import { describe, expect, it } from "vitest";
import { CanvasRequest } from "./CanvasRequest";
import { Message, MESSAGE_SENDER, MESSAGE_TARGET, MESSAGE_TYPE } from "./Message";
import Task, { TaskTypes } from "./Task";

describe("Message", () => {
  it("constructs a side panel task creation request with the expected contract fields", () => {
    const task = new Task(TaskTypes.coursesScan, {
      searchTerms: ["retired faculty name"],
      settings: ["include-html"],
    });

    const message = new Message(
      MESSAGE_TARGET.SERVICE_WORKER,
      MESSAGE_SENDER.SIDE_PANEL,
      MESSAGE_TYPE.Task.Request.NEW,
      "Start task",
      task,
      12345
    );

    expect(message).toMatchObject({
      target: MESSAGE_TARGET.SERVICE_WORKER,
      sender: MESSAGE_SENDER.SIDE_PANEL,
      type: MESSAGE_TYPE.Task.Request.NEW,
      text: "Start task",
      data: task,
      time: 12345,
    });
  });

  it("defaults optional fields for a canvas request envelope", () => {
    const request = new CanvasRequest(CanvasRequest.Get.UsersSelf);
    const message = new Message(
      MESSAGE_TARGET.TAB,
      MESSAGE_SENDER.SERVICE_WORKER,
      MESSAGE_TYPE.Canvas.REQUESTS,
      undefined,
      [request]
    );

    expect(message.target).toBe(MESSAGE_TARGET.TAB);
    expect(message.sender).toBe(MESSAGE_SENDER.SERVICE_WORKER);
    expect(message.type).toBe(MESSAGE_TYPE.Canvas.REQUESTS);
    expect(message.text).toBe("");
    expect(message.data).toEqual([request]);
    expect(typeof message.time).toBe("number");
  });
});
