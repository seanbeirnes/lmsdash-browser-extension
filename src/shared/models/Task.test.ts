import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Task, { TaskStatuses, TaskTypes } from "./Task";

describe("Task", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes a courses scan task with stable default lifecycle fields", () => {
    const settingsData = {
      searchTerms: ["retired faculty name", "old phone number"],
      settings: ["case-sensitive"],
    };
    const task = new Task(TaskTypes.coursesScan, settingsData);

    expect(task).toMatchObject({
      id: -1,
      uuid: "test-uuid",
      type: TaskTypes.coursesScan,
      status: TaskStatuses.NOT_STARTED,
      progress: 0,
      progressData: null,
      errorsData: null,
      settingsData,
      resultsData: null,
      controller: null,
      timeStarted: null,
      timeFinished: null,
    });
    expect(task.timeCreated).toBe(task.timeUpdated);
  });

  it("updates the task lifecycle timestamps as scan state changes", () => {
    const task = new Task(TaskTypes.coursesScan);
    const createdTime = task.timeUpdated;

    vi.advanceTimersByTime(1000);
    task.setStatus(TaskStatuses.RUNNING);
    expect(task.status).toBe(TaskStatuses.RUNNING);
    expect(task.timeUpdated).toBe(createdTime + 1000);

    vi.advanceTimersByTime(1000);
    task.setProgress(25);
    task.setProgressData(["Scanning assignments"]);
    expect(task.progress).toBe(25);
    expect(task.progressData).toEqual(["Scanning assignments"]);
    expect(task.timeUpdated).toBe(createdTime + 2000);

    vi.advanceTimersByTime(1000);
    task.setErrorsData(["Announcement request failed"]);
    expect(task.errorsData).toEqual(["Announcement request failed"]);
    expect(task.timeUpdated).toBe(createdTime + 3000);

    vi.advanceTimersByTime(1000);
    task.setResultsData({ resultsCount: 2 });
    expect(task.resultsData).toEqual({ resultsCount: 2 });
    expect(task.timeUpdated).toBe(createdTime + 4000);
  });

  it("records started and finished times for a completed scan", () => {
    const task = new Task(TaskTypes.coursesScan);

    vi.advanceTimersByTime(1000);
    task.setTimeStarted();
    expect(task.timeStarted).toBe(Date.parse("2025-01-01T00:00:01.000Z"));

    vi.advanceTimersByTime(1000);
    task.setStatus(TaskStatuses.COMPLETE);
    task.setTimeFinished();
    expect(task.status).toBe(TaskStatuses.COMPLETE);
    expect(task.timeFinished).toBe(Date.parse("2025-01-01T00:00:02.000Z"));
    expect(task.getTimes()).toEqual({
      created: Date.parse("2025-01-01T00:00:00.000Z"),
      started: Date.parse("2025-01-01T00:00:01.000Z"),
      updated: Date.parse("2025-01-01T00:00:02.000Z"),
      finished: Date.parse("2025-01-01T00:00:02.000Z"),
    });
  });
});
