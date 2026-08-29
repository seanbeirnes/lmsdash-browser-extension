import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppController } from "./AppController";
import { MessageHandler } from "./MessageHandler";
import TaskController from "./TaskController";
import { TabHandler } from "./TabHandler";
import { CanvasResponse } from "../shared/models/CanvasResponse";

describe("AppController", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(chrome.tabs.get as unknown as ReturnType<typeof vi.fn>).mockReset();
    vi.mocked(chrome.tabs.query as unknown as ReturnType<typeof vi.fn>).mockReset();
    vi.mocked(chrome.tabs.query as unknown as ReturnType<typeof vi.fn>).mockResolvedValue([]);
  });

  it("updates app state from bootstrapped Canvas tabs on the next controller update", async () => {
    vi.mocked(chrome.tabs.query as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce([
        { id: 71, url: "https://school.instructure.com/courses/71", active: true } as chrome.tabs.Tab,
      ])
      .mockResolvedValueOnce([
        { id: 71, url: "https://school.instructure.com/courses/71", active: true } as chrome.tabs.Tab,
      ]);
    vi.mocked(chrome.tabs.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 71,
      url: "https://school.instructure.com/courses/71",
      active: true,
    } as chrome.tabs.Tab);
    vi.spyOn(MessageHandler.prototype, "sendSidePanelMessage").mockResolvedValue(undefined);
    vi.spyOn(MessageHandler.prototype, "sendCanvasRequests").mockResolvedValue([
      new CanvasResponse("test-uuid", "[]", false, null, true, false, 200, "OK", "basic"),
    ]);

    const controller = new AppController();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await controller.update();

    expect(controller.state.hasTabs).toBe(true);
    expect(controller.state.activeTabId).toBe(71);
    expect(controller.state.activeTab?.url).toBe("https://school.instructure.com/courses/71");
  });

  it("notifies the side panel when tab availability changes", async () => {
    vi.spyOn(TabHandler.prototype, "hasTabs").mockReturnValueOnce(false).mockReturnValueOnce(true);
    vi.spyOn(TabHandler.prototype, "getLastActiveTabId").mockReturnValue(88);
    vi.mocked(chrome.tabs.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 88,
      url: "https://school.instructure.com/courses/88/pages/home",
      active: true,
    } as chrome.tabs.Tab);
    const sendSidePanelMessageSpy = vi
      .spyOn(MessageHandler.prototype, "sendSidePanelMessage")
      .mockResolvedValue(undefined);
    vi.spyOn(MessageHandler.prototype, "sendCanvasRequests").mockResolvedValue([
      new CanvasResponse("test-uuid", "[]", false, null, true, false, 200, "OK", "basic"),
    ]);

    const controller = new AppController();
    await controller.update();

    expect(controller.state.hasTabs).toBe(true);
    expect(controller.state.activeTabId).toBe(88);
    expect(sendSidePanelMessageSpy).toHaveBeenCalledWith("app state", controller.state);
  });

  it("does not notify the side panel when state is unchanged", async () => {
    vi.spyOn(TabHandler.prototype, "hasTabs").mockReturnValue(false);
    vi.spyOn(TabHandler.prototype, "getLastActiveTabId").mockReturnValue(null);
    const sendSidePanelMessageSpy = vi
      .spyOn(MessageHandler.prototype, "sendSidePanelMessage")
      .mockResolvedValue(undefined);

    const controller = new AppController();
    sendSidePanelMessageSpy.mockClear();

    await controller.update();

    expect(sendSidePanelMessageSpy).not.toHaveBeenCalled();
  });

  it("updates admin state from Canvas permission checks when tabs exist", async () => {
    vi.spyOn(TabHandler.prototype, "hasTabs").mockReturnValue(true);
    vi.spyOn(TabHandler.prototype, "getLastActiveTabId").mockReturnValue(91);
    vi.mocked(chrome.tabs.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 91,
      url: "https://school.instructure.com/courses/91",
      active: true,
    } as chrome.tabs.Tab);
    vi.spyOn(MessageHandler.prototype, "sendSidePanelMessage").mockResolvedValue(undefined);
    vi.spyOn(MessageHandler.prototype, "sendCanvasRequests").mockResolvedValue([
      new CanvasResponse("test-uuid", "[]", false, null, true, false, 200, "OK", "basic"),
    ]);

    const controller = new AppController();
    await controller.update();

    expect(controller.state.isAdmin).toBe(true);
    expect(controller.countCheckedIsAdmin).toBe(1);
  });

  it("delegates task updates to TaskController", () => {
    const updateSpy = vi.spyOn(TaskController.prototype, "update").mockImplementation(() => undefined);

    const controller = new AppController();
    const didUpdate = controller.updateTasks();

    expect(didUpdate).toBe(true);
    expect(updateSpy).toHaveBeenCalledTimes(1);
  });
});
