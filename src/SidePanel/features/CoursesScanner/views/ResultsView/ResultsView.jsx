import PrimaryCardLayout from "../../../../components/shared/cards/PrimaryCardLayout.jsx";
import useTaskById from "../../../../hooks/useTaskById.js";
import ProgressSpinner from "../../../../components/shared/progress/ProgressSpinner.jsx";
import PrimaryCard from "../../../../components/shared/cards/PrimaryCard.jsx";
import * as Progress from "@radix-ui/react-progress";
import ButtonPrimary from "../../../../components/shared/buttons/ButtonPrimary.jsx";
import {Cross2Icon, DownloadIcon} from "@radix-ui/react-icons";
import IconButton from "../../../../components/shared/buttons/IconButton.jsx";
import CourseScanResult from "./CourseScanResult.jsx";
import * as Tooltip from "@radix-ui/react-tooltip";
import {useEffect, useRef, useState} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import * as Toast from "@radix-ui/react-toast";
import serializeCoursesScanResults from "../../serializers/serializeCoursesScanResults.js";
import downloadCSV from "../../../../helpers/downloadCSV.js";

function ResultsView({taskId, scanAgainCallback})
{
  const {isPending, isError, data, error} = useTaskById(taskId);
  const [curDetails, setCurDetails] = useState(null);
  const [downloaded, setDownloaded] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const timerRef = useRef(0);

  useEffect(() =>
  {
    return () => clearTimeout(timerRef.current);
  }, []);

  function infoModalCallback(details)
  {
    setCurDetails(details);
  }

  async function handleDownloadClick()
  {
    try{
      const csvData = await serializeCoursesScanResults(data.resultsData);
      await downloadCSV(csvData);
    }
    catch (error){
      setShowNotification(false);
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setDownloaded(false);
        setShowNotification(true);
      }, 100);
    }
    setShowNotification(false);
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setDownloaded(true);
        setShowNotification(true);
      }, 100);
  }

  if(isPending || !data)
  {
    return (
      <ProgressSpinner/>
    )
  }

  return (
    <>
    <PrimaryCardLayout>
      <PrimaryCard fixedWidth={false} minHeight={false} className="w-full">
        <div className="grid grid-cols-1 grid-flow-row start justify-start content-start gap-2">
          <h2
            className="text-gray-700 text-xl text-center font-bold">{data.progressData.length > 0 ? data.progressData[0] : " "}</h2>
          <Progress.Root className="relative overflow-hidden bg-gray-200 rounded-full w-full h-6 shadow-inner"
                         style={{transform: "translateZ(0)"}}
                         value={data.progress ? data.progress : 0}>
            <Progress.Indicator className="bg-blue-400 w-full h-full transition-transform duration-500 ease-in-out"
                                style={{transform: `translateX(-${100 - (data.progress ? data.progress : 0)}%)`}}/>
            <span
              className="absolute top-0 w-full h-full text-center text-gray-700">{data.progress ? data.progress : 0}%</span>
          </Progress.Root>
          <p
            className="text-gray-700 text-base text-left mb-4">{`Items found in ${data.resultsData.length} course(s).`}</p>
        </div>
        <div className="justify-self-center self-end w-full min-h16 flex justify-between items-center gap-4">
          <div className="hidden sm:block min-w-12">
          </div>
          <div className="w-full max-w-sm">
            <ButtonPrimary onClick={scanAgainCallback}>New Scan</ButtonPrimary>
          </div>
          <div>
            {(data && data.resultsData.length > 0) &&
              <Tooltip.Root>
                <IconButton animated={false} onClick={handleDownloadClick}
                            className="text-blue-500 hover:text-blue-400 hover:shadow-sm active:text-blue-400 active:shadow-inner">
                  <Tooltip.Trigger asChild>
                    <DownloadIcon className="w-10 h-10 p-1"/>
                  </Tooltip.Trigger>
                </IconButton>
                <Tooltip.Content className="select-none p-2 bg-white rounded-sm shadow-xl animate__animated animate__fadeIn"
                                 sideOffset={0}
                                 side={"bottom"}>
                  Download results as CSV file
                  <Tooltip.Arrow className="fill-white"/>
                </Tooltip.Content>
              </Tooltip.Root>
            }
          </div>
        </div>
      </PrimaryCard>
      {
        data.resultsData?.length < 1 ?
          <p className="text-lg text-gray-700 text-center font-bold">No scan results found.</p>
          :
          data.resultsData.map((course, index) =>
          {
            return <CourseScanResult id={course.id}
                                     name={course.name}
                                     courseCode={course.courseCode}
                                     sisCourseId={course.sisCourseId}
                                     published={course.published}
                                     url={course.url}
                                     items={course.items}
                                     defaultOpen={data.resultsData.length === 1}
                                     infoModalCallback={infoModalCallback}
                                     key={"course-id-"+ index} />
          })
      }
    </PrimaryCardLayout>
      <Toast.Root open={showNotification} onOpenChange={setShowNotification} className={`${downloaded ? "bg-green-200" : "bg-red-200"} rounded-md p-2 grid [grid-template-areas:_'title_action'_'description_action'] grid-cols-[auto_max-content] gap-x-3.5 animate__animated items-center data-[state=open]:animate__fadeInRight data-[state=closed]:animate__fadeOutDownBig data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate__fadeOutDown`}>
        <Toast.Title className={`${downloaded ? "text-green-600" : "text-red-600"} [grid-area:_title] mb-1 font-bold text-base`}>
          {downloaded ? "Download Success" : "Download Failed"}
        </Toast.Title>
        <Toast.Description className={`${downloaded ? "text-green-700" : "text-red-700"} [grid-area:_description] m-0 text-sm leading-snug`}>
          {downloaded ? "Scan results exported to CSV" : "An error occurred when exporting"}
        </Toast.Description>
      <Toast.Action className="[grid-area:_action]" asChild altText="Close download notification">
        <IconButton animated={false} onClick={() => setShowNotification(false)} className="text-gray-700 hover:text-white hover:bg-gray-700 appearance-none rounded-full">
          <Cross2Icon className="w-5 h-5 p-0.5" />
        </IconButton>
      </Toast.Action>
      </Toast.Root>
  <Dialog.Root open={curDetails !== null} modal={true}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 w-dvw h-dvh bg-gray-700 opacity-50" />
      <Dialog.Content onInteractOutside={() => setCurDetails(null)} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-dvw max-w-[85dvw] sm:max-w-lg max-h-[85dvh] min-h-32 p-8 text-2xl bg-white shadow-lg rounded-sm">
        <Dialog.Title className="text-gray-700 font-bold mb-2 text-center">
          Scan Result Details
        </Dialog.Title>
        <Dialog.Description className="text-sm text-gray-700">
          {curDetails !== null && curDetails.name}
        </Dialog.Description>
        <Tabs.Root className="flex flex-col w-full h-80" defaultValue="tab1">
          <Tabs.List className="shrink-0 flex border-b border-gray-200" aria-label="View details for course item">
            <Tabs.Trigger value="tab1" className="h-10 flex-1 flex items-center justify-center text-base select-none text-gray-700 hover:text-blue-500 data-[state=active]:text-blue-600 data-[state=active]:shadow-[inset_0_-2px_0_0] data-[state=active]:shadow-current cursor-default">Previews</Tabs.Trigger>
            <Tabs.Trigger value="tab2" className="h-10 flex-1 flex items-center justify-center text-base select-none text-gray-700 hover:text-blue-500 data-[state=active]:text-blue-600 data-[state=active]:shadow-[inset_0_-2px_0_0] data-[state=active]:shadow-current cursor-default">Details</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="tab1" className="grow">
            {(curDetails !== null && curDetails.previews.length > 0) && <div
              className="w-full h-72 p-4 flex flex-col overflow-y-scroll bg-gray-200 rounded-b shadow-inner">
              {
                curDetails.previews.map((preview, index) => {
                  return <div className="w-full break-all" key={"preview-" + index}>
                    <p  className="text-sm font-mono">{preview[0] ? preview[0] : ""}<span className="py-1 rounded-sm bg-blue-200 font-bold">{preview[1]}</span>{preview[2] ? preview[2] : ""}</p>
                    <hr className="border-gray-400 my-2"/>
                  </div>
                })
              }
            </div>}
          </Tabs.Content>
          <Tabs.Content value="tab2" className="grow">
            {curDetails && <div className="w-full h-full text-sm p-4 flex flex-col break-words rounded-b shadow-inner">
              <p className="text-base text-gray-700"><span className="font-bold">Name:</span> {curDetails.name}</p>
              <p className="text-base text-gray-700"><span className="font-bold">ID:</span> {curDetails.id}</p>
              <p className="text-base text-gray-700"><span
                className="font-bold">Published:</span> {curDetails.published ? "TRUE" : "FALSE"}</p>
              <p className="text-base break-all text-gray-700"><span className="font-bold">URL:</span> <a href={curDetails.url}
                                                                                                target="_blank"
                                                                                                className="text-blue-600 hover:text-blue-500 hover:underline active:text-blue-400">{curDetails.url}</a>
              </p>
              <p className="text-base text-gray-700"><span className="font-bold">Matches:</span> {curDetails.matches.toString().replaceAll(/[\[\]]/g,"").replaceAll(",",", ")}
              </p>
            </div>}
          </Tabs.Content>
        </Tabs.Root>
        <Dialog.Close asChild>
          <IconButton animated={false} onClick={() => setCurDetails(null)} className="text-gray-700 hover:text-white hover:bg-gray-700 absolute top-3 right-3 appearance-none rounded-full">
            <Cross2Icon className="w-8 h-8 p-2" />
          </IconButton>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
    </>
  )
}

export default ResultsView;