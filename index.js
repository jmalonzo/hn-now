#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    // Check if main.js exists (compiled from TypeScript)
    const mainJsPath = path.join(__dirname, 'main.js');
    const hasCompiledVersion = fs.existsSync(mainJsPath);

    if (!hasCompiledVersion) {
        console.error('Error: main.js not found. Please run "npm run build" first.');
        console.error('Or install TypeScript globally and run "tsc"');
        process.exit(1);
    }

    // Check command line arguments for legacy mode
    const args = process.argv.slice(2);
    const legacyModes = ['top', 'new', 'best', 'ask', 'show', 'job'];

    // If a legacy command is provided, use the old CLI interface
    if (args.length > 0 && legacyModes.includes(args[0])) {
        // Legacy mode - quick output without interaction
        const axios = (await import('axios')).default;
        const chalk = (await import('chalk')).default;

        const storyType = args[0];
        const limit = Math.min(parseInt(args[1]) || 30, 100);

        const endpoints = {
            top: 'https://hacker-news.firebaseio.com/v0/topstories.json',
            new: 'https://hacker-news.firebaseio.com/v0/newstories.json',
            best: 'https://hacker-news.firebaseio.com/v0/beststories.json',
            ask: 'https://hacker-news.firebaseio.com/v0/askstories.json',
            show: 'https://hacker-news.firebaseio.com/v0/showstories.json',
            job: 'https://hacker-news.firebaseio.com/v0/jobstories.json'
        };

        const itemEndpoint = 'https://hacker-news.firebaseio.com/v0/item';
        const hnBaseUrl = 'https://news.ycombinator.com/item?id=';

        console.log(chalk.blue(`Fetching ${limit} ${storyType} stories...`));

        try {
            const response = await axios.get(endpoints[storyType]);
            const storyIds = response.data.slice(0, limit);
            const promises = storyIds.map(id =>
                axios.get(`${itemEndpoint}/${id}.json`).catch(() => null)
            );

            const responses = await Promise.all(promises);
            console.log(chalk.green(`\n📰 ${storyType.toUpperCase()} STORIES\n`));

            responses
                .filter(resp => resp && resp.data && resp.data.title)
                .forEach((resp, index) => {
                    const story = resp.data;
                    const number = chalk.gray(`${index + 1}.`.padEnd(4));
                    const title = chalk.bold.white(story.title);
                    const score = story.score ? chalk.yellow(`▲${story.score}`) : chalk.gray('no score');
                    const comments = story.descendants ? chalk.blue(`💬${story.descendants}`) : chalk.gray('no comments');
                    const author = story.by ? chalk.green(`@${story.by}`) : chalk.gray('unknown');

                    console.log(`${number}${title}`);

                    if (story.url && story.url !== `${hnBaseUrl}${story.id}`) {
                        console.log(`    🔗 ${chalk.cyan(story.url)}`);
                    }

                    console.log(`    ${score} | ${comments} | ${author} | ${chalk.gray(`💬 ${hnBaseUrl}${story.id}`)}`);
                    console.log('');
                });
        } catch (error) {
            console.error(chalk.red('Error fetching stories:'), error.message);
            process.exit(1);
        }
    } else {
        // Interactive mode - load the full application
        if (args.length > 0 && !['--help', '-h', '--version', '-v'].includes(args[0])) {
            const chalk = (await import('chalk')).default;
            console.log(chalk.yellow('Unknown command. Starting interactive mode...\n'));
            console.log('Usage:');
            console.log('  hn-now                    # Interactive mode');
            console.log('  hn-now top [limit]        # Legacy: show top stories');
            console.log('  hn-now new [limit]        # Legacy: show new stories');
            console.log('  hn-now best [limit]       # Legacy: show best stories');
            console.log('  hn-now ask [limit]        # Legacy: show Ask HN');
            console.log('  hn-now show [limit]       # Legacy: show Show HN');
            console.log('  hn-now job [limit]        # Legacy: show jobs\n');
        }

        if (args.includes('--help') || args.includes('-h')) {
            console.log('Hacker News CLI Browser');
            console.log('');
            console.log('Usage:');
            console.log('  hn-now                    # Start interactive browser');
            console.log('  hn-now <type> [limit]     # Legacy CLI mode');
            console.log('');
            console.log('Story types: top, new, best, ask, show, job');
            console.log('Limit: 1-100 (default: 30)');
            console.log('');
            console.log('Examples:');
            console.log('  hn-now                    # Interactive mode');
            console.log('  hn-now top 50             # Show 50 top stories');
            console.log('  hn-now ask                # Show Ask HN stories');
            process.exit(0);
        }

        if (args.includes('--version') || args.includes('-v')) {
            const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
            console.log(`hn-now v${pkg.version}`);
            process.exit(0);
        }

        // Load and start the interactive application
        await import('./main.js');
    }
}

main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
});
