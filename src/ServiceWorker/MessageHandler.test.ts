import { describe, expect, it, vi, beforeEach } from "vitest";
import { MessageHandler } from "./MessageHandler";
import { Message, MESSAGE_SENDER, MESSAGE_TARGET, MESSAGE_TYPE } from "../shared/models/Message";
import { AppState } from "../shared/models/AppState";
import Task, { TaskStatuses, TaskTypes } from "../shared/models/Task";
import { CanvasResponse } from "../shared/models/CanvasResponse";
import { CanvasRequest } from "../shared/models/CanvasRequest";

describe("MessageHandler", () => {
  const makeAppController = () => {
    const state = new AppState();
    return {
      state,
      setSidePanelOpen: vi.fn(() => {
        state.hasOpenSidePanel = true;
      }),
      tabHandler: {
        getTabId: vi.fn(() => 123),
      },
      taskController: {
        stopTask: vi.fn(() => true),
        enqueue: vi.fn((task: Task) => task),
        getTaskById: vi.fn(),
        getTasksByType: vi.fn(),
      },
    };
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns app state when the side panel announces it opened", async () => {
    const appController = makeAppController();
    const handler = new MessageHandler(appController);
    const sendResponse = vi.fn();

    await handler.handleSidePanelMessage(
      new Message(
        MESSAGE_TARGET.SERVICE_WORKER,
        MESSAGE_SENDER.SIDE_PANEL,
        MESSAGE_TYPE.Task.Request.App.SET_PANEL_OPENED,
        "opened"
      ),
      {} as chrome.runtime.MessageSender,
      sendResponse
    );

    expect(appController.setSidePanelOpen).toHaveBeenCalledTimes(1);
    const response = sendResponse.mock.calls[0][0] as Message;
    expect(response.type).toBe(MESSAGE_TYPE.Task.Response.App.SET_PANEL_OPENED);
    expect(response.data).toBe(appController.state);
    expect(appController.state.hasOpenSidePanel).toBe(true);
  });

  it("requests the current user from Canvas for USER info messages", async () => {
    const appController = makeAppController();
    const handler = new MessageHandler(appController);
    const sendResponse = vi.fn();
    const userInfoRequest = new CanvasRequest(CanvasRequest.Get.UsersSelf);
    const canvasResponses = [
      new CanvasResponse(userInfoRequest.id, '{"name":"Teacher"}', false, null, true, false, 200, "OK", "basic"),
    ];
    const sendCanvasRequestsSpy = vi.spyOn(handler, "sendCanvasRequests").mockResolvedValue(canvasResponses);

    await handler.handleSidePanelMessage(
      new Message(
        MESSAGE_TARGET.SERVICE_WORKER,
        MESSAGE_SENDER.SIDE_PANEL,
        MESSAGE_TYPE.Task.Request.Info.USER,
        "user"
      ),
      {} as chrome.runtime.MessageSender,
      sendResponse
    );

    expect(sendCanvasRequestsSpy).toHaveBeenCalledTimes(1);
    const requests = sendCanvasRequestsSpy.mock.calls[0][0];
    expect(requests).toHaveLength(1);
    expect(requests[0]?.type).toBe(CanvasRequest.Get.UsersSelf);

    const response = sendResponse.mock.calls[0][0] as Message;
    expect(response.type).toBe(MESSAGE_TYPE.Task.Response.Info.USER);
    expect(response.data).toEqual(canvasResponses);
    expect(response.data[0]?.id).toBe(userInfoRequest.id);
  });

  it("returns a serializable task copy with results for BY_ID requests", async () => {
    const appController = makeAppController();
    const task = new Task(TaskTypes.coursesScan, { searchTerms: ["retired faculty name"] });
    task.setId(4);
    task.setStatus(TaskStatuses.RUNNING);
    task.controller = { stop: vi.fn() };
    task.resultsData = { hidden: true };
    appController.taskController.getTaskById.mockReturnValue(task);

    const handler = new MessageHandler(appController);
    const sendResponse = vi.fn();

    await handler.handleSidePanelMessage(
      new Message(
        MESSAGE_TARGET.SERVICE_WORKER,
        MESSAGE_SENDER.SIDE_PANEL,
        MESSAGE_TYPE.Task.Request.BY_ID,
        "task by id",
        4
      ),
      {} as chrome.runtime.MessageSender,
      sendResponse
    );

    const response = sendResponse.mock.calls[0][0] as Message;
    expect(response.type).toBe(MESSAGE_TYPE.Task.Response.BY_ID);
    expect(response.data).toMatchObject({
      id: 4,
      type: TaskTypes.coursesScan,
      status: TaskStatuses.RUNNING,
      settingsData: { searchTerms: ["retired faculty name"] },
    });
    expect(response.data.controller).toBeNull();
    expect(response.data.resultsData).toEqual({ hidden: true });
  });

  it("returns serializable task copies for BY_TYPE requests", async () => {
    const appController = makeAppController();
    const task = new Task(TaskTypes.coursesScan, { searchTerms: ["old phone number"] });
    task.setId(8);
    task.setStatus(TaskStatuses.COMPLETE);
    appController.taskController.getTasksByType.mockReturnValue([task]);

    const handler = new MessageHandler(appController);
    const sendResponse = vi.fn();

    await handler.handleSidePanelMessage(
      new Message(
        MESSAGE_TARGET.SERVICE_WORKER,
        MESSAGE_SENDER.SIDE_PANEL,
        MESSAGE_TYPE.Task.Request.BY_TYPE,
        "tasks by type",
        TaskTypes.coursesScan
      ),
      {} as chrome.runtime.MessageSender,
      sendResponse
    );

    const response = sendResponse.mock.calls[0][0] as Message;
    expect(response.type).toBe(MESSAGE_TYPE.Task.Response.BY_TYPE);
    expect(response.data).toHaveLength(1);
    expect(response.data[0]).toMatchObject({
      id: 8,
      type: TaskTypes.coursesScan,
      status: TaskStatuses.COMPLETE,
      settingsData: { searchTerms: ["old phone number"] },
    });
    expect(response.data[0].controller).toBeNull();
  });

  it("stops a task when the side panel sends a STOP request", async () => {
    const appController = makeAppController();
    const handler = new MessageHandler(appController);
    const sendResponse = vi.fn();

    await handler.handleSidePanelMessage(
      new Message(
        MESSAGE_TARGET.SERVICE_WORKER,
        MESSAGE_SENDER.SIDE_PANEL,
        MESSAGE_TYPE.Task.Request.STOP,
        "stop task",
        5
      ),
      {} as chrome.runtime.MessageSender,
      sendResponse
    );

    expect(appController.taskController.stopTask).toHaveBeenCalledWith(5);
    const response = sendResponse.mock.calls[0][0] as Message;
    expect(response.type).toBe(MESSAGE_TYPE.Task.Response.STOP);
    expect(response.data).toBe(true);
  });
});
