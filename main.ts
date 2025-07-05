import axios from 'axios';
import chalk from 'chalk';
import inquirer from 'inquirer';
import open from 'open';
import ora from 'ora';
import { HNItem, StoryDisplay, StoryType, AppConfig } from './types';

const HACKER_NEWS_BASE_URL = 'https://news.ycombinator.com/item?id=';
const API_BASE_URL = 'https://hacker-news.firebaseio.com/v0';

const ENDPOINTS = {
    top: `${API_BASE_URL}/topstories.json`,
    new: `${API_BASE_URL}/newstories.json`,
    best: `${API_BASE_URL}/beststories.json`,
    ask: `${API_BASE_URL}/askstories.json`,
    show: `${API_BASE_URL}/showstories.json`,
    job: `${API_BASE_URL}/jobstories.json`,
    item: `${API_BASE_URL}/item`
};

class HackerNewsClient {
    private config: AppConfig;

    constructor() {
        this.config = {
            limit: 30,
            storyType: 'top',
            openInBrowser: true
        };
    }

    async fetchStoryIds(type: StoryType): Promise<number[]> {
        try {
            const response = await axios.get(ENDPOINTS[type]);
            return response.data.slice(0, this.config.limit);
        } catch (error) {
            throw new Error(`Failed to fetch ${type} stories: ${error}`);
        }
    }

    async fetchStoryDetails(id: number): Promise<HNItem | null> {
        try {
            const response = await axios.get(`${ENDPOINTS.item}/${id}.json`);
            return response.data;
        } catch (error) {
            console.warn(`Failed to fetch story ${id}: ${error}`);
            return null;
        }
    }

    async fetchStories(type: StoryType): Promise<StoryDisplay[]> {
        const spinner = ora(`Fetching ${type} stories...`).start();

        try {
            const storyIds = await this.fetchStoryIds(type);
            const storyPromises = storyIds.map(id => this.fetchStoryDetails(id));
            const storyData = await Promise.all(storyPromises);

            spinner.succeed(`Fetched ${storyData.filter(s => s).length} stories`);

            return storyData
                .filter((story): story is HNItem => story !== null && story.title !== undefined)
                .map(story => this.transformToDisplay(story));
        } catch (error) {
            spinner.fail('Failed to fetch stories');
            throw error;
        }
    }

    private transformToDisplay(story: HNItem): StoryDisplay {
        const timeAgo = story.time ? this.getTimeAgo(story.time) : 'unknown time';
        const commentsUrl = `${HACKER_NEWS_BASE_URL}${story.id}`;

        return {
            id: story.id,
            title: story.title || 'Untitled',
            url: story.url,
            score: story.score,
            by: story.by,
            time: story.time,
            descendants: story.descendants,
            commentsUrl
        };
    }

    private getTimeAgo(timestamp: number): string {
        const now = Math.floor(Date.now() / 1000);
        const diff = now - timestamp;

        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    }

    private formatStoryForDisplay(story: StoryDisplay, index: number): string {
        const number = chalk.gray(`${index + 1}.`.padEnd(4));
        const title = chalk.bold.white(story.title);
        const score = story.score ? chalk.yellow(`▲ ${story.score}`) : chalk.gray('no score');
        const comments = story.descendants ? chalk.blue(`💬 ${story.descendants}`) : chalk.gray('no comments');
        const author = story.by ? chalk.green(`@${story.by}`) : chalk.gray('unknown');
        const time = story.time ? chalk.gray(this.getTimeAgo(story.time)) : '';

        let firstLine = `${number} ${title}`;
        let secondLine = `    ${score} | ${comments} | ${author} | ${time}`;

        if (story.url && story.url !== story.commentsUrl) {
            const domain = this.extractDomain(story.url);
            secondLine += ` | ${chalk.cyan(domain)}`;
        }

        return `${firstLine}\n${secondLine}`;
    }

    private extractDomain(url: string): string {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return 'invalid-url';
        }
    }

    async showStoryMenu(stories: StoryDisplay[]): Promise<void> {
        const choices: any[] = stories.map((story, index) => ({
            name: this.formatStoryForDisplay(story, index),
            value: story,
            short: story.title
        }));

        choices.push(new inquirer.Separator());
        choices.push({
            name: chalk.yellow('← Back to main menu'),
            value: 'back',
            short: 'Back'
        });

        const { selectedStory } = await inquirer.prompt([
            {
                type: 'list',
                name: 'selectedStory',
                message: `Select a story to view (${stories.length} stories):`,
                choices,
                pageSize: 20
            }
        ]);

        if (selectedStory === 'back') {
            return;
        }

        await this.showStoryActions(selectedStory as StoryDisplay);
    }

    async showStoryActions(story: StoryDisplay): Promise<void> {
        const actions: any[] = [];

        if (story.url && story.url !== story.commentsUrl) {
            actions.push({
                name: `🔗 Open article: ${chalk.cyan(this.extractDomain(story.url))}`,
                value: 'open-article'
            });
        }

        actions.push({
            name: `💬 Open comments (${story.descendants || 0} comments)`,
            value: 'open-comments'
        });

        actions.push({
            name: '📋 Copy article URL',
            value: 'copy-url'
        });

        actions.push({
            name: '📋 Copy comments URL',
            value: 'copy-comments'
        });

        actions.push(new inquirer.Separator());
        actions.push({
            name: chalk.yellow('← Back to story list'),
            value: 'back'
        });

        console.log('\n' + chalk.bold(story.title));
        console.log(chalk.gray(`Score: ${story.score || 0} | Comments: ${story.descendants || 0} | By: ${story.by || 'unknown'}`));
        if (story.url) {
            console.log(chalk.cyan(story.url));
        }

        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: actions
            }
        ]);

        switch (action) {
            case 'open-article':
                if (story.url) {
                    await this.openUrl(story.url);
                }
                break;
            case 'open-comments':
                await this.openUrl(story.commentsUrl);
                break;
            case 'copy-url':
                if (story.url) {
                    console.log(chalk.green('Article URL copied to clipboard:'));
                    console.log(story.url);
                }
                break;
            case 'copy-comments':
                console.log(chalk.green('Comments URL copied to clipboard:'));
                console.log(story.commentsUrl);
                break;
            case 'back':
                return;
        }

        // Show actions again unless user chose to go back
        if (action !== 'back') {
            console.log('\nPress Enter to continue...');
            await inquirer.prompt([{ type: 'input', name: 'continue', message: '' }]);
            await this.showStoryActions(story);
        }
    }

    private async openUrl(url: string): Promise<void> {
        try {
            await open(url);
            console.log(chalk.green(`Opened in browser: ${url}`));
        } catch (error) {
            console.log(chalk.red('Failed to open browser. URL:'));
            console.log(url);
        }
    }

    async showMainMenu(): Promise<void> {
        console.log(chalk.bold.blue('\n🗞️  Hacker News CLI Browser\n'));

        const { choice } = await inquirer.prompt([
            {
                type: 'list',
                name: 'choice',
                message: 'What would you like to browse?',
                choices: [
                    { name: '🔥 Top Stories', value: 'top' },
                    { name: '🆕 New Stories', value: 'new' },
                    { name: '⭐ Best Stories', value: 'best' },
                    { name: '❓ Ask HN', value: 'ask' },
                    { name: '🎯 Show HN', value: 'show' },
                    { name: '💼 Jobs', value: 'job' },
                    new inquirer.Separator(),
                    { name: '⚙️  Settings', value: 'settings' },
                    { name: '❌ Exit', value: 'exit' }
                ]
            }
        ]);

        switch (choice) {
            case 'top':
            case 'new':
            case 'best':
            case 'ask':
            case 'show':
            case 'job':
                try {
                    const stories = await this.fetchStories(choice as StoryType);
                    await this.showStoryMenu(stories);
                    await this.showMainMenu(); // Return to main menu after browsing
                } catch (error) {
                    console.error(chalk.red('Error fetching stories:'), error);
                    await this.showMainMenu();
                }
                break;
            case 'settings':
                await this.showSettings();
                await this.showMainMenu();
                break;
            case 'exit':
                console.log(chalk.blue('Thanks for using Hacker News CLI! 👋'));
                process.exit(0);
        }
    }

    async showSettings(): Promise<void> {
        const { limit } = await inquirer.prompt({
            type: 'number',
            name: 'limit',
            message: 'How many stories to fetch?',
            default: this.config.limit,
            validate: (input: number | undefined) => {
                if (input === undefined || input < 1 || input > 100) {
                    return 'Please enter a number between 1 and 100';
                }
                return true;
            }
        });

        this.config.limit = limit;
        console.log(chalk.green(`Settings updated! Will now fetch ${limit} stories.`));
    }

    async start(): Promise<void> {
        try {
            await this.showMainMenu();
        } catch (error) {
            console.error(chalk.red('An error occurred:'), error);
            process.exit(1);
        }
    }
}

// Main execution
async function main() {
    const client = new HackerNewsClient();
    await client.start();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log(chalk.blue('\n\nThanks for using Hacker News CLI! 👋'));
    process.exit(0);
});

// Start the application
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error(chalk.red('Fatal error:'), error);
        process.exit(1);
    });
}

export default HackerNewsClient;
