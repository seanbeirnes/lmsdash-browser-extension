import {Message, MESSAGE_SENDER, MESSAGE_TARGET, MESSAGE_TYPE} from "../../shared/models/Message";
import {QueryFunctionContext, useQuery} from "@tanstack/react-query";

type TaskQueryKey = [string, {taskId: number}]

export default function useTaskProgress(taskId: number, interval = 0) {
  async function fetchTasks({queryKey}: QueryFunctionContext<TaskQueryKey>)
  {
    const [_key, options] = queryKey;
    const msgRequest = new Message(MESSAGE_TARGET.SERVICE_WORKER,
        MESSAGE_SENDER.SIDE_PANEL,
        MESSAGE_TYPE.Task.Request.PROGRESS,
        "Task progress request",
        options.taskId)
    const msgResponse = await chrome.runtime.sendMessage(msgRequest);

    return msgResponse.data;
  }

  return useQuery({
    queryKey: ["get-task-progress", {taskId}],
    queryFn: fetchTasks,
    refetchInterval: interval,
    refetchIntervalInBackground: interval > 0,
  })
}