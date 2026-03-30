import { Message, MESSAGE_TARGET, MESSAGE_SENDER, MESSAGE_TYPE } from "../shared/models/Message";
import { CanvasRequest } from "../shared/models/CanvasRequest";
import { Utils } from "../shared/utils/Utils";
import Task from "../shared/models/Task";
import type { CanvasResponse } from "../shared/models/CanvasResponse";
import type { AppState } from "../shared/models/AppState";

interface TabHandlerLike {
  getTabId(): number | null;
}

interface TaskControllerLike {
  stopTask(id: number): boolean;
  enqueue(task: Task): Task | null;
  getTaskById(id: number): Task | null;
  getTasksByType(type: string, includeResults: boolean): Task[] | null;
}

export interface AppControllerLike {
  state: AppState;
  setSidePanelOpen(): void;
  tabHandler: TabHandlerLike;
  taskController: TaskControllerLike;
}

export class MessageHandler
{
  private appController: AppControllerLike;

  constructor(appController: AppControllerLike)
  {
    this.appController = appController;
  }

  init(): void
  {
    chrome.runtime.onMessage.addListener((message: Message, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) =>
      { ( async () => {
        if (message.target !== MESSAGE_TARGET.SERVICE_WORKER) return;

        if (message.sender === MESSAGE_SENDER.SIDE_PANEL)
        {
          await this.handleSidePanelMessage(message, sender, sendResponse);
        }

        // if(message.sender === Message.Sender.TAB)
        // {
        //   // Future: Handle messages initiated by contentScript
        //   return;
        // }
      })();
        return true;
      }
    );
  }

  async handleSidePanelMessage(message: Message, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void): Promise<void>
  {
    switch (message.type)
    {
      case MESSAGE_TYPE.Canvas.REQUESTS:
      {
        const response = await this.sendCanvasRequests(message.data);

        const responseMsg = new Message(
          MESSAGE_TARGET.SIDE_PANEL,
          MESSAGE_SENDER.SERVICE_WORKER,
          MESSAGE_TYPE.Canvas.RESPONSES,
          "Canvas Responses",
          response
        );

        sendResponse(responseMsg);
      }
        break;

      // case Message.Type.Task.Request.App.STATE:
      // {
      //  //TO DO: return App State
      // }
      //   break;

      case MESSAGE_TYPE.Task.Request.App.SET_PANEL_OPENED:
      {
        this.appController.setSidePanelOpen();
        const responseMsg =  new Message(
            MESSAGE_TARGET.SIDE_PANEL,
            MESSAGE_SENDER.SERVICE_WORKER,
            MESSAGE_TYPE.Task.Response.App.SET_PANEL_OPENED,
            "SidePanel was opened",
            this.appController.state
          );

        sendResponse(responseMsg);
      }
        break;

      case MESSAGE_TYPE.Task.Request.Info.USER:
      {
        const response = await this.sendCanvasRequests(
          [new CanvasRequest(CanvasRequest.Get.UsersSelf)]
        );

        const responseMsg = new Message(
            MESSAGE_TARGET.SIDE_PANEL,
            MESSAGE_SENDER.SERVICE_WORKER,
            MESSAGE_TYPE.Task.Response.Info.USER,
            "User info response",
            response
          );

        sendResponse(responseMsg);
      }
        break;

      // Message requesting a task for progress info
      case MESSAGE_TYPE.Task.Request.PROGRESS:
      {
        const task = this.getTaskById(message.data as number, false); // Data should only be an integer

        const responseMsg = new Message(
            MESSAGE_TARGET.SIDE_PANEL,
            MESSAGE_SENDER.SERVICE_WORKER,
            MESSAGE_TYPE.Task.Response.PROGRESS,
            task ? "Task found" : "No task by received id",
            task ? task : null
          );

        sendResponse(responseMsg);
      }

        break;
      // Message requesting a task by its id
      case MESSAGE_TYPE.Task.Request.BY_ID:
      {
        const task = this.getTaskById(message.data as number); // Data should only be an integer

        const responseMsg =  new Message(
            MESSAGE_TARGET.SIDE_PANEL,
            MESSAGE_SENDER.SERVICE_WORKER,
            MESSAGE_TYPE.Task.Response.BY_ID,
            task ? "Task found" : "No task by received id",
            task ? task : null
          );

        sendResponse(responseMsg);
      }
        break;

      // Message requesting array of tasks by type, returns array of task IDs
      case MESSAGE_TYPE.Task.Request.BY_TYPE:
      {
        const tasks = this.getTasksByType(message.data as string); // Data should only be a string

        const responseMsg =  new Message(
            MESSAGE_TARGET.SIDE_PANEL,
            MESSAGE_SENDER.SERVICE_WORKER,
            MESSAGE_TYPE.Task.Response.BY_TYPE,
            tasks ? "Tasks found" : "No tasks by received task type",
            tasks ? tasks : null
          );

        sendResponse(responseMsg);
      }
        break;

      // Message requesting to start a new task
      case MESSAGE_TYPE.Task.Request.NEW:
      {
        const task = this.enqueueTask(message.data as Task);

        const responseMsg = new Message(
              MESSAGE_TARGET.SIDE_PANEL,
              MESSAGE_SENDER.SERVICE_WORKER,
              MESSAGE_TYPE.Task.Response.NEW,
              task ? "New task created" : "Task creation failed",
              task ? task : null
            );

        sendResponse(responseMsg);
      }
        break;

      // Message requesting to stop a task
      case MESSAGE_TYPE.Task.Request.STOP:
      {
        const success = this.appController.taskController.stopTask(message.data as number);

        const responseMsg = new Message(
            MESSAGE_TARGET.SIDE_PANEL,
            MESSAGE_SENDER.SERVICE_WORKER,
            MESSAGE_TYPE.Task.Response.STOP,
            success ? "Task stopped" : "Task could not be stopped",
            success
          );

        sendResponse(responseMsg);
      }
        break;

      default:
        throw new Error("Unknown message type passed.");
    }
  }

  //////
  ////// Message utility functions
  //////
  async sendSidePanelMessage(text: string, data: any, counter = 0): Promise<void>
  {
    if (this.appController.state.hasOpenSidePanel === false) return;

    const newMessage = new Message(
        MESSAGE_TARGET.SIDE_PANEL,
        MESSAGE_SENDER.SERVICE_WORKER,
        MESSAGE_TYPE.Task.Response.App.STATE,
        text,
        data
      );

    try {
      await chrome.runtime.sendMessage(newMessage);
    } catch (e) {
      if (counter < 4)
      {
        await this.sendSidePanelMessage(text, data, ++counter);
      }
      else
      {
        console.log("SidePanel not available:\n" + e);
        this.appController.state.hasOpenSidePanel = false;
      }
    }
  }

  // Wrapper method for sending requests and receiving responses from the Canvas content script
  async sendCanvasRequests(requests: CanvasRequest[]): Promise<CanvasResponse[] | null>
  {
    const requestMsg = new Message(
      MESSAGE_TARGET.TAB,
      MESSAGE_SENDER.SERVICE_WORKER,
      MESSAGE_TYPE.Canvas.REQUESTS,
      "Canvas requests",
      requests
    );

    const responseMsg = await this.trySendingRequests(requestMsg);

    return responseMsg ? (responseMsg.data as CanvasResponse[]) : null;
  }

  // Recursively retries sending requests if they failed
  private async trySendingRequests(message: Message, counter = 0): Promise<Message | null>
  {
    if (counter > 0) await Utils.sleep(Math.pow(10, counter));
    const tabId = this.appController.tabHandler.getTabId();

    if (tabId == null) return null;

    try {
      const response = await chrome.tabs.sendMessage(tabId, message);
      if (!response) return null;
      return response as Message;
    } catch (e) {
      if (counter < 4)
      {
        return await this.trySendingRequests(message, ++counter);
      }
      else
      {
        console.warn("Content script not available:\n" + e);
      }
    }

    return null;
  }

  //////
  ////// Helper functions
  //////
  enqueueTask(task: Task | null | undefined): Task | null
  {
    if (!task || !task.type) return null; // Check for a bad task model format
    return this.appController.taskController.enqueue(task); // Enqueue the task and return it with the new id
  }

  // Returns a serializable copy of an original task object
  getTaskById(taskId: number | null | undefined, includeResults: boolean = true): Task | null
  {
    if (taskId === null || taskId === undefined || taskId < 0) return null;
    return this.getSerializableTask(this.appController.taskController.getTaskById(taskId), includeResults);
  }

  // Returns array of tasks of a type
  getTasksByType(taskType: string | null | undefined): Task[] | null
  {
    if (!taskType) return null;
    const tasks = this.appController.taskController.getTasksByType(taskType, false);
    if (!tasks) return null;

    const taskCopies: Task[] = [];
    tasks.forEach((task) => taskCopies.push(this.getSerializableTask(task)!));

    return taskCopies;
  }

  // Creates copy of a task without the controller object reference
  // so it can be converted to JSON
  getSerializableTask(task: Task | null, includeResults: boolean = false): Task | null
  {
    if (!task) return null;

    const taskCopy = new Task(task.type, task.settingsData);
    taskCopy.setId(task.id);
    taskCopy.uuid = task.uuid;
    taskCopy.setStatus(task.status);
    taskCopy.timeCreated = task.timeCreated;
    taskCopy.timeStarted = task.timeStarted;
    taskCopy.timeUpdated = task.timeUpdated;
    taskCopy.timeFinished = task.timeFinished;
    taskCopy.progress = task.progress;
    taskCopy.progressData = task.progressData;
    taskCopy.errorsData = task.errorsData;
    if (includeResults) taskCopy.resultsData = task.resultsData;

    return taskCopy;
  }
}