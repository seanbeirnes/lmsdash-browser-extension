import {Message} from "../../shared/models/Message.js";
import {useQuery} from "@tanstack/react-query";

export default function useTaskById(taskId) {
  async function fetchTasks({queryKey})
  {
    const [_key, {taskType}] = queryKey;
    const msgRequest = new Message(Message.Target.SERVICE_WORKER,
        Message.Sender.SIDE_PANEL,
        Message.Type.Task.Request.BY_ID,
        "Task by id request",
        taskId)
    const msgResponse = await chrome.runtime.sendMessage(msgRequest)

    return msgResponse.data;
  }

  return useQuery({
    queryKey: ["get-task-by-id", {taskId}],
    queryFn: fetchTasks
  })
}