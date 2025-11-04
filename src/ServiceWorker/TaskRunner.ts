import Task, { TaskTypes, TaskStatuses } from "../shared/models/Task";
import Logger from "../shared/utils/Logger";
import CoursesScanController from "./features/CoursesScanner/CoursesScanController";
import type { CanvasRequest } from "../shared/models/CanvasRequest";
import type { CanvasResponse } from "../shared/models/CanvasResponse";

export interface MessageHandlerLike {
  sendCanvasRequests(requests: CanvasRequest[]): Promise<CanvasResponse[] | null>;
}

export interface AppControllerLike {
  messageHandler: MessageHandlerLike;
}

export default class TaskRunner
{
  static runTask(task: Task, appController: AppControllerLike): boolean
  {
    let isRunning = false;

    switch (task.type)
    {
      case TaskTypes.coursesScan:
        isRunning = TaskRunner.runCoursesScan(task, appController);
        break;

      default:
        Logger.debug(__dirname, "Task type not found. Could not run task: \n" + task.toString());
    }

    task.setTimeStarted();

    if (isRunning)
    {
      task.setStatus(TaskStatuses.RUNNING);
    }
    else
    {
      task.setStatus(TaskStatuses.FAILED);
      task.setTimeFinished();
    }

    return isRunning;
  }

  static runCoursesScan(task: Task, appController: AppControllerLike): boolean
  {
    const controller = new CoursesScanController(task, appController);
    task.controller = controller;
    controller.start();

    Logger.debug(__dirname, "Running Courses Scan Task: " + task.toString());
    return true;
  }
}