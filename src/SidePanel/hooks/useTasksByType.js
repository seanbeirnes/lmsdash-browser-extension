import {Message} from "../../shared/models/Message.js";
import {useQuery} from "@tanstack/react-query";

export default function useTasksByType(taskType) {
  async function fetchTasks({queryKey})
  {
    const [_key, {taskType}] = queryKey;
    const msgRequest = new Message(Message.Target.SERVICE_WORKER,
        Message.Sender.SIDE_PANEL,
        Message.Type.Task.Request.BY_TYPE,
        "Task by type request",
        taskType)
    const msgResponse = await chrome.runtime.sendMessage(msgRequest);

    return msgResponse.data;
  }

  return useQuery({
    queryKey: ["get-tasks-by-type", {taskType}],
    queryFn: fetchTasks
  })
}