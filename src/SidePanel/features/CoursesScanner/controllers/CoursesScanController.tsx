import { useContext, useEffect, useState } from "react";
import PrimaryCardLayout from "../../../components/shared/cards/PrimaryCardLayout";
import SettingsView from "../views/SettingsView/SettingsView";
import Logger from "../../../../shared/utils/Logger";
import ProgressView from "../views/ProgressView/ProgressView";
import { Message, MESSAGE_SENDER, MESSAGE_TARGET, MESSAGE_TYPE } from "../../../../shared/models/Message";
import Task, { TaskStatuses, TaskTypes } from "../../../../shared/models/Task";
import { CoursesScanSettings, ScanType } from "../../../../shared/models/CoursesScanSettings";
import { useMutation } from "@tanstack/react-query";
import { UserInfoContext } from "../../../App";
import ProgressSpinner from "../../../components/shared/progress/ProgressSpinner";
import useTasksByType from "../../../hooks/useTasksByType";
import MenuButton from "../../../components/shared/buttons/MenuButton";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import ResultsView from "../views/ResultsView/ResultsView";

type UserInfo = {
  lmsInstance: string;
};

type ExistingTask = {
  id: number;
  status: string;
};

function CoursesScanController() {
  const userInfo = useContext(UserInfoContext) as UserInfo;

  const [runningTaskId, setRunningTaskId] = useState<number | null>(null);
  const [lastScannedTaskId, setLastScannedTaskId] = useState<number | null>(null);
  const [completedTaskId, setCompletedTaskId] = useState<number | null>(null);

  const [scanType, setScanType] = useState<string[]>(["single-course"]);
  const [courseIds, setCourseIds] = useState<Array<string | number>>([]);
  const [searchTerms, setSearchTerms] = useState<string[]>([""]);
  const [scannedItems, setScannedItems] = useState<string[]>([]);
  const [settings, setSettings] = useState<string[]>([]);

  const { isPending, data } = useTasksByType(TaskTypes.coursesScan);

  useEffect(() => {
    if (!data || !Array.isArray(data)) {
      return;
    }

    data.forEach((task: ExistingTask) => {
      if (runningTaskId === null && task.status === TaskStatuses.RUNNING) setRunningTaskId(task.id);
      if (lastScannedTaskId === null && task.status === TaskStatuses.COMPLETE) setLastScannedTaskId(task.id);
    });
  }, [data, runningTaskId, lastScannedTaskId]);

  const createTask = useMutation({
    mutationFn: async (scanSettings: CoursesScanSettings) => {
      const msgRequest = new Message(
        MESSAGE_TARGET.SERVICE_WORKER,
        MESSAGE_SENDER.SIDE_PANEL,
        MESSAGE_TYPE.Task.Request.NEW,
        "New course scan request",
        new Task(TaskTypes.coursesScan, scanSettings)
      );
      const msgResponse = await chrome.runtime.sendMessage(msgRequest);
      return msgResponse.data;
    },
    onSuccess: (task: ExistingTask | null) => {
      if (task !== null) setRunningTaskId(task.id);
    },
  });

  const stopTask = useMutation({
    mutationFn: async (taskId: number) => {
      const msgRequest = new Message(
        MESSAGE_TARGET.SERVICE_WORKER,
        MESSAGE_SENDER.SIDE_PANEL,
        MESSAGE_TYPE.Task.Request.STOP,
        "Stop scan task request",
        taskId
      );
      const msgResponse = await chrome.runtime.sendMessage(msgRequest);
      return msgResponse.data;
    },
    onSuccess: (success: boolean) => {
      if (success) setRunningTaskId(null);
    },
  });

  function runScanCallback() {
    Logger.debug("CoursesScanController", `\n${scanType}\n${courseIds}\n${searchTerms}\n${scannedItems}\n${settings}\n${userInfo.lmsInstance}`);

    const mappedScanType: ScanType = scanType[0] === "term" && scanType[1]
      ? ["term", scanType[1]]
      : "course";

    createTask.mutate(new CoursesScanSettings(mappedScanType, courseIds, searchTerms, scannedItems, settings, userInfo.lmsInstance));

    if (scanType[0] === "term") setScanType(["term"]);
  }

  function stopScanCallback() {
    Logger.debug("CoursesScanController", "Stopping Scan");
    if (runningTaskId !== null) {
      stopTask.mutate(runningTaskId);
    }
  }

  function viewResultsCallback() {
    Logger.debug("CoursesScanController", "Viewing results");
    setCompletedTaskId(runningTaskId);
    setRunningTaskId(null);
  }

  function scanAgainCallback() {
    Logger.debug("CoursesScanController", "Scan again clicked");
    setCompletedTaskId(null);
  }

  if (isPending) {
    return (
      <ProgressSpinner className="" />
    );
  }

  if (runningTaskId !== null) {
    return (
      <ProgressView taskId={runningTaskId} viewResultsCallback={viewResultsCallback} stopScanCallback={stopScanCallback} />
    );
  }

  if (completedTaskId !== null) {
    return (
      <ResultsView taskId={completedTaskId} scanAgainCallback={scanAgainCallback} />
    );
  }

  return (
    <div className="w-full h-full">
      {(lastScannedTaskId !== null) &&
        <PrimaryCardLayout className="" fullWidth={true}>
          <div className="w-72">
            <MenuButton onClick={() => {
              setCompletedTaskId(lastScannedTaskId);
              setLastScannedTaskId(null);
            }}>
              <MagnifyingGlassIcon />
              View Last Scan Results
            </MenuButton>
          </div>
        </PrimaryCardLayout>
      }
      <SettingsView scanType={scanType}
                    setScanType={setScanType}
                    courseIds={courseIds}
                    setCourseIds={setCourseIds}
                    searchTerms={searchTerms}
                    setSearchTerms={setSearchTerms}
                    scannedItems={scannedItems}
                    setScannedItems={setScannedItems}
                    settings={settings}
                    setSettings={setSettings}
                    runScanCallback={runScanCallback} />
    </div>
  );
}

export default CoursesScanController;
