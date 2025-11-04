// Handles tracking valid Canvas tabs in the browser to serve to the app controller
export class TabHandler
{
    // Tracks valid canvas tabs open in browser
    private canvasTabs: number[] = [];
    private lastActiveTabId: number | null = null;

    // Returns a valid Canvas tabId
    getTabId(): number | null
    {
        if (this.canvasTabs.length > 0)
        {
            return this.canvasTabs[0];
        }
        else
        {
            return null;
        }
    }

    getLastActiveTabId(): number | null
    {
        if (this.lastActiveTabId === null) return null;

        if (this.canvasTabs.includes(this.lastActiveTabId))
        {
            return this.lastActiveTabId;
        }

        return null;
    }

    hasTabs(): boolean
    {
        return this.canvasTabs.length > 0;
    }

    private static async isValidTab(tabId: number): Promise<boolean>
    {
        const tab = await chrome.tabs.get(tabId);

        if (!tab.url)
        {
            return false;
        }

        const INSTRUCTURE_HOSTED_PATTERN = /https:\/\/(?:\w{1,255}\.)+instructure\.com/;
        const CANVAS_SUBDOMAIN_PATTERN = /https:\/\/canvas\.(?:\w{1,255}\.)+\w{1,26}/;

        const tabUrl = new URL(tab.url);
        const isValidUrl = (INSTRUCTURE_HOSTED_PATTERN.test(tabUrl.origin) || CANVAS_SUBDOMAIN_PATTERN.test(tabUrl.origin));

        return isValidUrl;
    }

    private async updateValidTabs(tabId: number): Promise<void>
    {
        const isValid = await TabHandler.isValidTab(tabId);

        if (isValid && !this.canvasTabs.includes(tabId))
        {
            this.canvasTabs.push(tabId);
            this.lastActiveTabId = tabId;
        }
        else if (!isValid && this.canvasTabs.includes(tabId))
        {
            this.canvasTabs.splice(this.canvasTabs.indexOf(tabId), 1);
        }
    }

    private async removeTab(tabId: number): Promise<number[] | null>
    {
        if (this.canvasTabs.includes(tabId))
        {
            return this.canvasTabs.splice(this.canvasTabs.indexOf(tabId), 1);
        }

        return null;
    }

    private async updateActiveTab(): Promise<void>
    {
        const response = await chrome.tabs.query({ active: true, currentWindow: true });

        if (response.length < 1) return;

        const newTab = response[0];
        if (newTab.id !== undefined && this.canvasTabs.includes(newTab.id)) this.lastActiveTabId = newTab.id;
    }

    init(): null
    {
        // Add listeners to track all valid tabs
        chrome.tabs.onUpdated.addListener(async (tabId: number, info: any, tab: chrome.tabs.Tab) => {
            this.updateValidTabs(tabId);
        });

        chrome.tabs.onRemoved.addListener(async (tabId: number, info: any) => {
            this.removeTab(tabId);
            if (this.lastActiveTabId === tabId) this.lastActiveTabId = null;
        });

        // Add listener to track last active tab
        chrome.tabs.onActivated.addListener(async (_activeInfo: any) => {
            this.updateActiveTab();
        });

        return null;
    }
}