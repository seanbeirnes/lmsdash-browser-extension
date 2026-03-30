import Header from "../components/layout/Header";
import Main from "../components/layout/Main";
import Footer from "../components/layout/Footer";
import IconButton from "../components/shared/buttons/IconButton";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { useContext, useMemo, useState } from "react";
import { PageRouterContext } from "../router/PageRouter";
import { ROUTER_PAGES } from "../types";
import { AppStateContext, UserInfoContext, type UserInfoValue } from "../App";
import useActiveCourseAnnouncements, { type AnnouncementDateItem } from "../hooks/useActiveCourseAnnouncements";
import ButtonPrimary from "../components/shared/buttons/ButtonPrimary";
import { CanvasRequest } from "../../shared/models/CanvasRequest";
import { Message, MESSAGE_SENDER, MESSAGE_TARGET, MESSAGE_TYPE } from "../../shared/models/Message";
import {
  formatCanvasDateTime,
  hasNativeTemporal,
  resolveEffectiveCanvasTimeZone,
  shiftCanvasDateTimeByDays,
} from "../helpers/temporalDateTime";

type PreviewItem = {
  id: number;
  title: string;
  oldDateUtc: string;
  newDateUtc: string;
};

type CanvasResponseItem = {
  status: number;
};

function AdjustDatesPage() {
  const pageRouterState = useContext(PageRouterContext);
  const appState = useContext(AppStateContext);
  const userInfo = useContext(UserInfoContext) as UserInfoValue;

  const courseId = appState.activeTabCourseId;

  const { data, isLoading, isError, refetch } = useActiveCourseAnnouncements(courseId);

  const [shiftDaysInput, setShiftDaysInput] = useState("0");
  const [selectedAnnouncementIds, setSelectedAnnouncementIds] = useState<number[]>([]);
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const announcements = data?.announcements ?? [];
  const courseTimeZone = data?.courseTimeZone ?? "";
  const temporalAvailable = hasNativeTemporal();
  const effectiveTimeZone = resolveEffectiveCanvasTimeZone(userInfo.timeZone, courseTimeZone);
  const canUseTimeLogic = temporalAvailable && Boolean(effectiveTimeZone);
  const requiresTimeZoneNotice = Boolean(userInfo.timeZone) && Boolean(courseTimeZone) && userInfo.timeZone !== courseTimeZone;

  const selectableAnnouncements = useMemo(() => {
    return announcements.filter((item) => item.delayedPostAt !== null);
  }, [announcements]);

  const unselectableCount = announcements.length - selectableAnnouncements.length;

  function formatDateForDisplay(dateIso: string): string {
    if (!effectiveTimeZone) return "Unavailable";

    try {
      return formatCanvasDateTime(dateIso, effectiveTimeZone);
    } catch {
      return "Unavailable";
    }
  }

  function handleToggleAnnouncement(itemId: number): void {
    setStatusMessage(null);
    setPreviewItems([]);

    setSelectedAnnouncementIds((current) => {
      if (current.includes(itemId)) {
        return current.filter((id) => id !== itemId);
      }

      return [...current, itemId];
    });
  }

  function handleSelectAll(): void {
    setStatusMessage(null);
    setPreviewItems([]);
    setSelectedAnnouncementIds(selectableAnnouncements.map((item) => item.id));
  }

  function handleClearSelection(): void {
    setStatusMessage(null);
    setPreviewItems([]);
    setSelectedAnnouncementIds([]);
  }

  function createPreviewItems(): PreviewItem[] {
    if (!temporalAvailable) {
      throw new Error("This browser does not support Temporal.");
    }

    if (!effectiveTimeZone) {
      throw new Error("Canvas display timezone is unavailable for this course/user.");
    }

    const shiftDays = Number.parseInt(shiftDaysInput, 10);

    if (Number.isNaN(shiftDays)) {
      throw new Error("Shift days must be a whole number");
    }

    const announcementsMap = new Map<number, AnnouncementDateItem>(
      announcements.map((item) => [item.id, item])
    );

    const selectedItems = selectedAnnouncementIds
      .map((id) => announcementsMap.get(id))
      .filter((item): item is AnnouncementDateItem => Boolean(item && item.delayedPostAt));

    return selectedItems.map((item) => {
      const oldDateUtc = item.delayedPostAt as string;
      const newDateUtc = shiftCanvasDateTimeByDays(oldDateUtc, effectiveTimeZone, shiftDays);

      return {
        id: item.id,
        title: item.title,
        oldDateUtc,
        newDateUtc,
      };
    });
  }

  function handlePreview(): void {
    setStatusMessage(null);

    try {
      const nextPreviewItems = createPreviewItems();

      if (nextPreviewItems.length === 0) {
        setPreviewItems([]);
        setStatusMessage("Select at least one scheduled announcement before previewing.");
        return;
      }

      setPreviewItems(nextPreviewItems);
    } catch (error) {
      setPreviewItems([]);
      if (error instanceof Error) {
        setStatusMessage(error.message);
        return;
      }

      setStatusMessage("Could not generate preview.");
    }
  }

  async function handleApply(): Promise<void> {
    if (!data?.courseId || previewItems.length === 0) {
      setStatusMessage("Preview changes before applying updates.");
      return;
    }

    if (!canUseTimeLogic) {
      setStatusMessage("Cannot apply updates until Canvas display timezone is available.");
      return;
    }

    setIsApplying(true);
    setStatusMessage(null);

    const requests = previewItems.map((item) => new CanvasRequest(CanvasRequest.Put.Announcement, {
      courseId: data.courseId,
      announcementId: item.id,
      delayedPostAt: item.newDateUtc,
    }));

    try {
      const requestMessage = new Message(
        MESSAGE_TARGET.SERVICE_WORKER,
        MESSAGE_SENDER.SIDE_PANEL,
        MESSAGE_TYPE.Canvas.REQUESTS,
        "Adjust announcement dates",
        requests
      );

      const response = await chrome.runtime.sendMessage(requestMessage) as { data?: CanvasResponseItem[] };
      const responseItems = response.data ?? [];

      if (responseItems.length !== requests.length) {
        throw new Error("Unexpected response while applying updates");
      }

      const failedUpdates = responseItems.filter((item) => item.status >= 400).length;
      const successfulUpdates = responseItems.length - failedUpdates;

      if (failedUpdates > 0) {
        setStatusMessage(`Updated ${successfulUpdates} announcement(s), but ${failedUpdates} failed.`);
      } else {
        setStatusMessage(`Successfully updated ${successfulUpdates} announcement(s).`);
      }

      setPreviewItems([]);
      setSelectedAnnouncementIds([]);
      await refetch();
    } catch (error) {
      if (error instanceof Error) {
        setStatusMessage(error.message);
      } else {
        setStatusMessage("Could not apply updates.");
      }
    } finally {
      setIsApplying(false);
    }
  }

  const parsedShiftDays = Number.parseInt(shiftDaysInput, 10);
  const hasNonZeroShiftDays = !Number.isNaN(parsedShiftDays) && parsedShiftDays !== 0;
  const canPreview = selectedAnnouncementIds.length > 0 && canUseTimeLogic && hasNonZeroShiftDays;
  const canApply = previewItems.length > 0 && !isApplying && canUseTimeLogic;
  const isInApplyStep = previewItems.length > 0;

  return (
    <>
      <Header>
        <IconButton animated={true} onClick={() => pageRouterState.setPage(ROUTER_PAGES.MENU)}>
          <ArrowLeftIcon className="w-8 h-8" />
        </IconButton>
      </Header>
      <Main>
        <div className="justify-self-center self-start p-4 w-full grid grid-cols-1 grid-flow-row justify-items-center">
          <div className="grid grid-cols-1 grid-flow-row gap-3 justify-items-start w-full max-w-lg">
            <div className="w-full p-3 bg-gray-100 rounded-sm border border-gray-200">
              <h2 className="text-base font-bold text-gray-800">Adjust Announcement Dates</h2>
              <p className="text-sm text-gray-700 mt-1">Active course: <span className="font-bold">{data?.courseName ?? (courseId ? "Loading..." : "No active course")}</span></p>
              <p className="text-xs text-gray-500">Course ID: {courseId ?? "No course tab detected"}</p>
              <p className="text-xs text-gray-600 mt-1">Display timezone: {effectiveTimeZone || "Unavailable"}</p>
              {requiresTimeZoneNotice && <p className="text-xs text-gray-600">Course timezone: {courseTimeZone}</p>}
            </div>

            {isLoading && <p className="text-sm">Loading announcements...</p>}

            {isError && (
              <div className="w-full p-3 bg-red-100 text-red-700 rounded-sm">
                Could not load announcements for the active course.
              </div>
            )}

            {!isLoading && !isError && (
              <>
                {!courseId && (
                  <div className="w-full p-3 bg-yellow-100 rounded-sm border border-yellow-200 text-sm text-yellow-800">
                    Open a Canvas course tab first, then reopen this page.
                  </div>
                )}

                {!temporalAvailable && (
                  <div className="w-full p-3 bg-yellow-100 rounded-sm border border-yellow-200 text-sm text-yellow-800">
                    This browser does not support native Temporal yet. Adjust Dates is unavailable.
                  </div>
                )}

                {temporalAvailable && courseId && !effectiveTimeZone && (
                  <div className="w-full p-3 bg-yellow-100 rounded-sm border border-yellow-200 text-sm text-yellow-800">
                    Canvas display timezone is unavailable for this course/user. Cannot preview or apply changes.
                  </div>
                )}

                {courseId && (
                  <>
                    <div className="w-full p-3 bg-white rounded-sm shadow-sm border border-gray-200">
                      <p className="text-sm font-bold text-gray-700">Shift selected dates by days</p>
                      <input
                        className="mt-2 w-full px-2 py-1 bg-white text-base text-gray-700 rounded-sm shadow-inner border-2 border-gray-200 outline-blue-500"
                        type="number"
                        step={1}
                        value={shiftDaysInput}
                        onChange={(event) => {
                          setShiftDaysInput(event.target.value);
                          setStatusMessage(null);
                          setPreviewItems([]);
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Use negative values to move dates earlier.</p>
                      {!hasNonZeroShiftDays && (
                        <p className="text-xs text-gray-500 mt-1">Enter a non-zero day shift to preview changes.</p>
                      )}
                    </div>

                    <div className="w-full p-3 bg-white rounded-sm shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="text-sm font-bold text-gray-700">Announcements ({announcements.length})</p>
                        <div className="flex items-center gap-2">
                          <button className="text-xs text-blue-600 hover:text-blue-400" onClick={handleSelectAll} type="button">Select all scheduled</button>
                          <button className="text-xs text-gray-500 hover:text-gray-700" onClick={handleClearSelection} type="button">Clear</button>
                        </div>
                      </div>

                      {unselectableCount > 0 && (
                        <p className="text-xs text-gray-500 mb-2">{unselectableCount} announcement(s) do not have a scheduled posting date and cannot be shifted.</p>
                      )}

                      <div className="max-h-56 overflow-y-auto border border-gray-100 rounded-sm">
                        {announcements.length === 0 && <p className="text-sm p-2">No announcements found.</p>}

                        {announcements.map((item) => {
                          const isSelectable = item.delayedPostAt !== null;
                          const checked = selectedAnnouncementIds.includes(item.id);

                          return (
                            <label key={item.id} className={`flex gap-2 p-2 border-b border-gray-100 ${isSelectable ? "cursor-pointer" : "opacity-60"}`}>
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={!isSelectable}
                                onChange={() => handleToggleAnnouncement(item.id)}
                              />
                              <span className="text-sm grow">
                                <span className="font-medium block">{item.title}</span>
                                <span className="text-xs text-gray-500">
                                  {item.delayedPostAt ? `Scheduled: ${formatDateForDisplay(item.delayedPostAt)}` : "No scheduled posting date"}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="w-full grid grid-cols-1 gap-2">
                      {!isInApplyStep && (
                        <ButtonPrimary onClick={handlePreview} disabled={!canPreview}>Preview Changes</ButtonPrimary>
                      )}

                      {isInApplyStep && (
                        <ButtonPrimary onClick={handleApply} disabled={!canApply} isLoading={isApplying}>Apply Changes</ButtonPrimary>
                      )}
                    </div>

                    {previewItems.length > 0 && (
                      <div className="w-full p-3 bg-blue-50 rounded-sm border border-blue-100">
                        <p className="text-sm font-bold text-blue-700 mb-2">Preview ({previewItems.length} update(s))</p>
                        <div className="max-h-40 overflow-y-auto">
                          {previewItems.map((item) => (
                            <div key={item.id} className="text-xs text-blue-800 mb-2">
                              <p className="font-semibold">{item.title}</p>
                              <div className="flex items-center gap-2">
                                <span className="min-w-[13rem] text-right">{formatDateForDisplay(item.oldDateUtc)}</span>
                                <span>→</span>
                                <span className="min-w-[13rem] text-left">{formatDateForDisplay(item.newDateUtc)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {statusMessage && (
                      <div className="w-full p-2 rounded-sm bg-gray-100 text-sm text-gray-700">
                        {statusMessage}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </Main>
      <Footer />
    </>
  );
}

export default AdjustDatesPage;
