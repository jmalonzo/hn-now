import { HNItem, StoryDisplay, StoryType } from './types';
declare class HackerNewsClient {
    private config;
    constructor();
    fetchStoryIds(type: StoryType): Promise<number[]>;
    fetchStoryDetails(id: number): Promise<HNItem | null>;
    fetchStories(type: StoryType): Promise<StoryDisplay[]>;
    private transformToDisplay;
    private getTimeAgo;
    private formatStoryForDisplay;
    private extractDomain;
    showStoryMenu(stories: StoryDisplay[]): Promise<void>;
    showStoryActions(story: StoryDisplay): Promise<void>;
    private openUrl;
    showMainMenu(): Promise<void>;
    showSettings(): Promise<void>;
    start(): Promise<void>;
}
export default HackerNewsClient;
//# sourceMappingURL=main.d.ts.map