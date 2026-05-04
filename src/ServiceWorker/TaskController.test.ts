import { beforeEach, describe, expect, it, vi } from "vitest";
import TaskController from "./TaskController";
import TaskRunner from "./TaskRunner";
import Task, { TaskStatuses, TaskTypes } from "../shared/models/Task";

describe("TaskController", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("assigns stable ids and preserves task settings when enqueued", () => {
    const controller = new TaskController({
      messageHandler: {
        sendCanvasRequests: vi.fn(),
      },
    });

    const firstTask = controller.enqueue({
      type: TaskTypes.coursesScan,
      settingsData: { searchTerms: ["retired faculty name"] },
    });
    const secondTask = controller.enqueue({
      type: TaskTypes.coursesScan,
      settingsData: { searchTerms: ["old phone number"] },
    });

    expect(firstTask.id).toBe(0);
    expect(firstTask.settingsData).toEqual({ searchTerms: ["retired faculty name"] });
    expect(secondTask.id).toBe(1);
    expect(secondTask.settingsData).toEqual({ searchTerms: ["old phone number"] });
  });

  it("moves completed tasks from running to finished on update", () => {
    const controller = new TaskController({
      messageHandler: {
        sendCanvasRequests: vi.fn(),
      },
    });
    const task = controller.enqueue({ type: TaskTypes.coursesScan });

    const runTaskSpy = vi.spyOn(TaskRunner, "runTask").mockImplementation((currentTask) => {
      currentTask.setStatus(TaskStatuses.COMPLETE);
      currentTask.setTimeFinished();
      return true;
    });

    controller.update();

    expect(runTaskSpy).toHaveBeenCalledTimes(1);
    expect(controller.getTaskById(task.id)?.status).toBe(TaskStatuses.COMPLETE);
    expect(controller.getTasksByType(TaskTypes.coursesScan)).toHaveLength(1);
  });

  it("defers a second courses scan until the first one is no longer running", () => {
    const controller = new TaskController({
      messageHandler: {
        sendCanvasRequests: vi.fn(),
      },
    });
    const firstTask = controller.enqueue({ type: TaskTypes.coursesScan });
    const secondTask = controller.enqueue({ type: TaskTypes.coursesScan });

    const runTaskSpy = vi.spyOn(TaskRunner, "runTask").mockImplementation((currentTask) => {
      if (currentTask.id === firstTask.id) {
        currentTask.setStatus(TaskStatuses.RUNNING);
        return true;
      }

      currentTask.setStatus(TaskStatuses.COMPLETE);
      return true;
    });

    controller.update();

    expect(runTaskSpy).toHaveBeenCalledTimes(1);
    expect(runTaskSpy.mock.calls[0][0].id).toBe(firstTask.id);
    expect(controller.getTaskById(firstTask.id)?.status).toBe(TaskStatuses.RUNNING);
    expect(controller.getTaskById(secondTask.id)?.status).toBe(TaskStatuses.NOT_STARTED);

    const runningTask = controller.getTaskById(firstTask.id);
    if (runningTask) runningTask.setStatus(TaskStatuses.COMPLETE);

    controller.update();

    expect(runTaskSpy).toHaveBeenCalledTimes(2);
    expect(runTaskSpy.mock.calls[1][0].id).toBe(secondTask.id);
    expect(controller.getTaskById(secondTask.id)?.status).toBe(TaskStatuses.COMPLETE);
  });

  it("delegates stopTask to the running task controller", () => {
    const controller = new TaskController({
      messageHandler: {
        sendCanvasRequests: vi.fn(),
      },
    });
    const task = controller.enqueue({ type: TaskTypes.coursesScan });
    const stop = vi.fn();

    task.controller = { stop };

    expect(controller.stopTask(task.id)).toBe(true);
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it("returns false when stopTask receives a missing id", () => {
    const controller = new TaskController({
      messageHandler: {
        sendCanvasRequests: vi.fn(),
      },
    });
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    expect(controller.stopTask(999)).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith("No task for received task id");
  });
});
