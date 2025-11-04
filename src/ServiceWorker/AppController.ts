import { TabHandler } from "./TabHandler";
import { AppState } from "../shared/models/AppState";
import { CanvasRequest } from "../shared/models/CanvasRequest";
import { MessageHandler } from "./MessageHandler";
import Logger from "../shared/utils/Logger";
import TaskController from "./TaskController";
import type { AppControllerLike as MessageHandlerAppControllerLike } from "./MessageHandler";
import type { AppControllerLike as TaskControllerAppControllerLike } from "./TaskController";

export class AppController implements MessageHandlerAppControllerLike, TaskControllerAppControllerLike
{
  static APP_LOOP_MS = 500;
  static APP_LOOP_MULTIPLIER = 20;

  countCheckedIsAdmin = 0;
  tasks: unknown[] = [];

  state: AppState;
  messageHandler: MessageHandler;
  taskController: TaskController;
  tabHandler: TabHandler;

  constructor()
  {
    this.state = new AppState();

    this.messageHandler = new MessageHandler(this);
    this.messageHandler.init();

    this.taskController = new TaskController(this as TaskControllerAppControllerLike);

    this.tabHandler = new TabHandler();
    this.tabHandler.init();
    this.state.hasTabs = this.tabHandler.hasTabs();
  }

  getState(): AppState
  {
    return this.state;
  }

  updateTasks(): boolean
  {
    this.taskController.update();
    return true;
  }

  // Set the sidePanel as open in app state and notify sidePanel of state change
  setSidePanelOpen(): void
  {
    Logger.debug(__dirname, "Side panel set to OPEN");
    this.state.hasOpenSidePanel = true;
    this.state.timeChanged = Date.now();
    this.notifySidePanel();
  }

  // Updates the app state and returns true if it has changed
  async update(counter: number = 1): Promise<void>
  {
    this.state.timeUpdated = Date.now();

    const newActiveTabId = this.tabHandler.getLastActiveTabId();
    const newIsOnline = navigator.onLine;
    const newHasTabs = this.tabHandler.hasTabs();
    let newIsAdmin = this.state.isAdmin;

    const isChanged_isOnline = this.state.isOnline !== newIsOnline;
    const isChanged_hasTabs = this.state.hasTabs !== newHasTabs;
    const isChanged_activeTabId = this.state.activeTabId !== newActiveTabId;
    let isChanged_activeTab = false;

    // Update activeTab if activeTabId changed
    const id = newActiveTabId;
    if (id !== null && (isChanged_activeTabId || this.state.activeTab !== null))
    {
      const newActiveTab = await chrome.tabs.get(id);
      if (newActiveTab.url !== this.state.activeTab?.url) isChanged_activeTab = true;
      this.state.activeTab = newActiveTab;
    }

    // Check if non-dependant rules changed
    let isChanged = (isChanged_isOnline || isChanged_hasTabs || isChanged_activeTabId || isChanged_activeTab);

    // Check if isAdmin changed
    // Will only run if is admin is false AND checked < 5 times OR at the max app loop count
    if (((isChanged || this.countCheckedIsAdmin < 5 || counter % 100 === 0) && this.state.isAdmin !== true))
    {
      if (this.state.hasTabs)
      {
        newIsAdmin = await this.checkIsAdmin();
        this.countCheckedIsAdmin++;
      }
    }

    // Update isChanged if it was not already true AND isAdmin changed
    if (isChanged === false)
    {
      isChanged = this.state.isAdmin !== newIsAdmin;
    }

    // Update states
    // Updating these after checking isAdmin gives the content script time to load
    this.state.isOnline = newIsOnline;
    this.state.hasTabs = newHasTabs;
    this.state.isAdmin = newIsAdmin;
    this.state.activeTabId = newActiveTabId;

    // If any changed, send update to SidePanel
    if (isChanged)
    {
      this.state.timeChanged = Date.now();
      this.notifySidePanel();
    }
  }

  // Message the side panel of the app state
  private notifySidePanel(): void
  {
    this.messageHandler.sendSidePanelMessage("app state", this.state);

    Logger.debug(__dirname, JSON.stringify(this.state));
  }

  // Sends Canvas account courses request /api/v1/accounts/1/courses...
  // If 200 status, returns true (since only an admin would have that permission)
  // Otherwise, return false
  private async checkIsAdmin(): Promise<boolean>
  {
    const response = await this.messageHandler.sendCanvasRequests(
      [new CanvasRequest(CanvasRequest.Get.CoursesAccount, { page: 1, perPage: 10 })]
    );

    return !!(response && response[0] && (response[0] as any).status !== 401);
  }
}