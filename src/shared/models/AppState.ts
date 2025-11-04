export class AppState
{
  timeStarted: number;
  timeUpdated: number;
  timeChanged: number;

  isOnline: boolean;
  networkInfo: any;

  activeTabId: number | null;
  activeTab: chrome.tabs.Tab | null;

  hasTabs: boolean;
  isAdmin: boolean;
  hasOpenSidePanel: boolean;

  constructor()
  {
    this.timeStarted = Date.now();
    this.timeUpdated = Date.now();
    this.timeChanged = Date.now();

    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.networkInfo = typeof navigator !== 'undefined' && 'connection' in navigator ? (navigator as any).connection : null;

    this.activeTabId = null;
    this.activeTab = null;

    this.hasTabs = false;
    this.isAdmin = false;
    this.hasOpenSidePanel = false;
  }
}