import PrimaryCardLayout from "../../../../components/shared/cards/PrimaryCardLayout";
import PrimaryCard from "../../../../components/shared/cards/PrimaryCard";
import * as Progress from "@radix-ui/react-progress";
import ButtonPrimaryDanger from "../../../../components/shared/buttons/ButtonPrimaryDanger";
import useTaskProgress from "../../../../hooks/useTaskProgress";
import ProgressSpinner from "../../../../components/shared/progress/ProgressSpinner";
import { TaskStatuses } from "../../../../../shared/models/Task";
import { useEffect, useState } from "react";
import GenericErrorMessage from "../../../../components/shared/error/GenericErrorMessage";

interface ProgressTask {
  status: string;
  progress?: number;
  progressData?: string[];
}

interface ProgressViewProps {
  taskId: number;
  viewResultsCallback: () => void;
  stopScanCallback: () => void;
}

function ProgressView({ taskId, viewResultsCallback, stopScanCallback }: ProgressViewProps) {
  const [scanError, setScanError] = useState(false);
  const [stoppingScan, setStoppingScan] = useState(false);
  const { isPending: isProgress, data } = useTaskProgress(taskId, 500);

  const taskData = data as ProgressTask | undefined;

  useEffect(() => {
    if (!taskData || !taskData.status) return;
    if (taskData.status === TaskStatuses.COMPLETE) viewResultsCallback();
    if (taskData.status === TaskStatuses.FAILED && !stoppingScan) setScanError(true);
  }, [taskData, viewResultsCallback, stoppingScan]);

  function handleStopScanClick(): void {
    setStoppingScan(true);
    stopScanCallback();
  }

  if (scanError) {
    return (
      <GenericErrorMessage />
    );
  }

  if (isProgress || !taskData || !taskData.progressData || taskData.progressData.length === 0 || taskData.progressData[0] === "Gathering courses...") {
    return (
      <PrimaryCardLayout className="" fullWidth={true}>
        <PrimaryCard fixedWidth={false} minHeight={false} className="w-full min-h-52">
          <div className="self-stretch grid grid-cols-1 grid-flow-row justify-start content-start gap-2">
            <h2
              className="text-gray-700 text-xl text-center font-bold">{(taskData && taskData.progressData && taskData.progressData.length > 0) ? taskData.progressData[0] : "Fetching data..."}</h2>
          </div>
          <div className="flex justify-center">
            <ProgressSpinner className="" />
          </div>
          <div className="justify-self-center self-end w-full max-w-sm">
            <ButtonPrimaryDanger onClick={stopScanCallback}
                                 disabled={taskData && taskData.status ? taskData.status !== TaskStatuses.RUNNING : false}>Stop
              Scan</ButtonPrimaryDanger>
          </div>
        </PrimaryCard>
      </PrimaryCardLayout>
    );
  }

  return (
    <PrimaryCardLayout className="" fullWidth={true}>
      <PrimaryCard fixedWidth={false} minHeight={false} className="w-full min-h-52">
        <div className="grid grid-cols-1 grid-flow-row start justify-start content-start gap-2">
          <h2
            className="text-gray-700 text-xl text-center font-bold">{taskData.progressData.length > 0 ? taskData.progressData[0] : " "}</h2>
          <Progress.Root className="relative overflow-hidden bg-gray-200 rounded-full w-full h-6 shadow-inner"
                         style={{ transform: "translateZ(0)" }}
                         value={taskData.progress ? taskData.progress : 0}>
            <Progress.Indicator className="bg-blue-400 w-full h-full transition-transform duration-500 ease-in-out"
                                style={{ transform: `translateX(-${100 - (taskData.progress ? taskData.progress : 0)}%)` }} />
            <span
              className="absolute top-0 w-full h-full text-center text-gray-700">{taskData.progress ? taskData.progress : 0}%</span>
          </Progress.Root>
          <p
            className="text-gray-700 text-base text-left">{(taskData.progressData && taskData.progressData.length > 1) ? taskData.progressData[1] : " "}</p>
        </div>
        <div className="justify-self-center self-end w-full max-w-sm">
          <ButtonPrimaryDanger onClick={handleStopScanClick} disabled={taskData && taskData.status !== TaskStatuses.RUNNING}>Stop
            Scan</ButtonPrimaryDanger>
        </div>
      </PrimaryCard>
    </PrimaryCardLayout>
  );
}

export default ProgressView;
