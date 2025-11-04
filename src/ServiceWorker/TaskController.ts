import Logger from "../shared/utils/Logger";
import TaskRunner from "./TaskRunner";
import Task, { TaskTypes, TaskStatuses } from "../shared/models/Task";
import type { CanvasRequest } from "../shared/models/CanvasRequest";
import type { CanvasResponse } from "../shared/models/CanvasResponse";

export interface MessageHandlerLike {
  sendCanvasRequests(requests: CanvasRequest[]): Promise<CanvasResponse[] | null>;
}

export interface AppControllerLike {
  messageHandler: MessageHandlerLike;
}

export default class TaskController
{
  static CACHED_COUNT_LIMIT = 5;

  private appController: AppControllerLike;
  private nextId: number;
  private newTasks: Task[];
  private runningTasks: Task[];
  private finishedTasks: Task[];

  constructor(appController: AppControllerLike)
  {
    this.appController = appController;
    this.nextId = 0;
    this.newTasks = [];
    this.runningTasks = [];
    this.finishedTasks = [];
  }

  enqueue(newTask: { type: string; settingsData?: unknown } | Task): Task
  {
    const task = new Task(newTask.type, (newTask as Task).settingsData);
    task.setId(this.nextId++);
    this.newTasks.push(task);

    return task;
  }

  // Handle changes in task status and new tasks
  update(): void
  {
    this.handleFinished();
    this.handleRunning();
    this.handleNew();
  }

  // Removes old tasks to prevent memory leaks
  private handleFinished(): void
  {
    // Do not run if below cache limit
    if (this.finishedTasks.length < TaskController.CACHED_COUNT_LIMIT) return;

    // Keep track of counts per task type
    let coursesScanCount = 0;

    // Updates counts of task types
    function updateCounts(task: Task) {
      switch (task.type)
      {
        case TaskTypes.coursesScan:
          coursesScanCount++;
          break;

        default:
          break;
      }
    }

    // Returns false if cache rule is met, defaults to true
    function shouldRemove(task: Task): boolean
    {
      switch (task.type)
      {
        case TaskTypes.coursesScan:
          if (coursesScanCount < 2) return false;
          break;

        default:
          break;
      }
      return true;
    }

    // Sort tasks from oldest to newest
    const tasks = this.finishedTasks.sort(
      (a, b) => (a.timeFinished ?? 0) - (b.timeFinished ?? 0)
    );

    // Iterate over array of tasks from newest to oldest (backwards loop so tasks can be removed)
    for (let i = tasks.length - 1; i >= 0; i--)
    {
      updateCounts(tasks[i]);
      if (shouldRemove(tasks[i])) tasks.splice(i, 1);
    }

    Logger.debug(__dirname, "Cleared old tasks.\n" + tasks.toString());
    if (tasks.length >= TaskController.CACHED_COUNT_LIMIT)
      console.warn("Tasks length exceeds cache limit. Total tasks cached: " + tasks.length);
  }

  // Removes finished tasks from running tasks array
  private handleRunning(): void
  {
    for (let i = this.runningTasks.length - 1; i >= 0; i--)
    {
      // Ignore running tasks
      if (this.runningTasks[i].status === TaskStatuses.RUNNING) continue;

      // Move to finished
      const task = this.runningTasks[i];
      this.finishedTasks.push(task);
      this.runningTasks.splice(i, 1);
    }
  }

  // Runs tasks that are not started
  private handleNew(): void
  {
    // Count down so tasks added back do not get scanned again this round
    for (let i = this.newTasks.length - 1; i >= 0; i--)
    {
      // Run task
      const task = this.newTasks.shift();
      if (!task) continue;

      // Do not start process intensive tasks if more than one is running
      if (
        this.runningTasks.findIndex((t) => t.type === TaskTypes.coursesScan) >= 0 &&
        task.type === TaskTypes.coursesScan
      )
      {
        this.newTasks.push(task);
      }

      const isRunning = TaskRunner.runTask(task, this.appController);
      if (isRunning)
      {
        this.runningTasks.push(task);
        Logger.debug(__dirname, "Started task: \n" + task.toString());
      }
      else
      {
        this.finishedTasks.push(task);
        Logger.debug(__dirname, "Failed to start task: \n" + task.toString());
      }
    }
  }

  getTaskById(id: number): Task | null
  {
    let index = this.newTasks.findIndex((task) => task.id === id);
    if (index !== -1) return this.newTasks[index];

    index = this.runningTasks.findIndex((task) => task.id === id);
    if (index !== -1) return this.runningTasks[index];

    index = this.finishedTasks.findIndex((task) => task.id === id);
    if (index !== -1) return this.finishedTasks[index];

    return null;
  }

  getTaskByUuid(uuid: string): Task | null
  {
    let index = this.newTasks.findIndex((task) => task.uuid === uuid);
    if (index !== -1) return this.newTasks[index];

    index = this.runningTasks.findIndex((task) => task.uuid === uuid);
    if (index !== -1) return this.runningTasks[index];

    index = this.finishedTasks.findIndex((task) => task.uuid === uuid);
    if (index !== -1) return this.finishedTasks[index];

    return null;
  }

  // Returns array of tasks of a type
  getTasksByType(type: string, _includeResults?: boolean): Task[] | null
  {
    const tasks: Task[] = [];

    this.newTasks.forEach((task) =>
    {
      if (task.type === type) tasks.push(task);
    });

    this.runningTasks.forEach((task) =>
    {
      if (task.type === type) tasks.push(task);
    });

    this.finishedTasks.forEach((task) =>
    {
      if (task.type === type) tasks.push(task);
    });

    if (tasks.length > 0) return tasks;

    return null;
  }

  stopTask(taskId: number | null): boolean
  {
    if (taskId === null) return false;

    const task = this.getTaskById(taskId);
    if (!task)
    {
      console.warn("No task for received task id");
      return false;
    }

    const controller = task.controller as { stop?: () => void } | null;
    controller?.stop?.();
    return true;
  }
}