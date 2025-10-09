import {Message} from "../../shared/models/Message.js";
import {useQuery} from "@tanstack/react-query";

export default function useTaskProgress(taskId, interval = 0) {
  async function fetchTasks({queryKey})
  {
    const [_key, {taskId}] = queryKey;
    const msgRequest = new Message(Message.Target.SERVICE_WORKER,
        Message.Sender.SIDE_PANEL,
        Message.Type.Task.Request.PROGRESS,
        "Task progress request",
        taskId)
    const msgResponse = await chrome.runtime.sendMessage(msgRequest);

    return msgResponse.data;
  }

  return useQuery({
    queryKey: ["get-task-progress", {taskId}],
    queryFn: fetchTasks,
    refetchInterval: interval,
    refetchIntervalInBackground: interval > 0,
    refetchIntervalInWidth: interval > 0
  })
}