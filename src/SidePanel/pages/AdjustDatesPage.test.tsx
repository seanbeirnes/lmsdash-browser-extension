// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import AdjustDatesPage from "./AdjustDatesPage";
import { AppStateContext, type AppStateValue, UserInfoContext, type UserInfoValue } from "../App";
import { PageRouterContext } from "../router/PageRouter";
import { ROUTER_PAGES } from "../types";
import useActiveCourseAnnouncements from "../hooks/useActiveCourseAnnouncements";
import { formatCanvasDateTime } from "../helpers/temporalDateTime";
import { CANVAS_REQUEST_PUT } from "../../shared/models/CanvasRequest";
import { MESSAGE_TYPE } from "../../shared/models/Message";

vi.mock("../hooks/useActiveCourseAnnouncements", () => ({
  default: vi.fn(),
}));

const mockedUseActiveCourseAnnouncements = vi.mocked(useActiveCourseAnnouncements);

type AnnouncementQueryMock = ReturnType<typeof useActiveCourseAnnouncements>;

function createAnnouncementsQueryResult(overrides: Partial<AnnouncementQueryMock> = {}): AnnouncementQueryMock {
  return {
    data: undefined,
    error: null,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    isError: false,
    isFetched: true,
    isFetchedAfterMount: true,
    isFetching: false,
    isInitialLoading: false,
    isLoading: false,
    isLoadingError: false,
    isPaused: false,
    isPending: false,
    isPlaceholderData: false,
    isRefetchError: false,
    isRefetching: false,
    isStale: false,
    isSuccess: true,
    refetch: vi.fn().mockResolvedValue(undefined),
    status: "success",
    fetchStatus: "idle",
    dataUpdatedAt: 0,
    errorUpdatedAt: 0,
    promise: Promise.resolve(undefined),
    ...overrides,
  } as unknown as AnnouncementQueryMock;
}

const appStateValue: AppStateValue = {
  activeTab: { id: 51, url: "https://school.instructure.com/courses/51" } as chrome.tabs.Tab,
  activeTabCourseId: "51",
  hasTabs: true,
  isAdmin: true,
  isOnline: true,
  timeChanged: 1,
  timeUpdated: 1,
};

const userInfoValue: UserInfoValue = {
  timeChecked: 1,
  firstName: "Casey",
  lastName: "Admin",
  fullName: "Casey Admin",
  shortName: "Casey",
  email: "casey@example.com",
  sis_user_id: "u-1",
  lmsInstance: "https://school.instructure.com",
  timeZone: "America/Denver",
};

function renderPage() {
  return render(
    <PageRouterContext.Provider value={{ page: ROUTER_PAGES.ADJUST_DATES, setPage: vi.fn() }}>
      <AppStateContext.Provider value={appStateValue}>
        <UserInfoContext.Provider value={userInfoValue}>
          <AdjustDatesPage />
        </UserInfoContext.Provider>
      </AppStateContext.Provider>
    </PageRouterContext.Provider>,
  );
}

describe("AdjustDatesPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockedUseActiveCourseAnnouncements.mockReturnValue(
      createAnnouncementsQueryResult({
        data: {
          courseId: "51",
          courseName: "History 101",
          courseTimeZone: "America/Denver",
          announcements: [
            {
              id: 101,
              title: "Welcome",
              delayedPostAt: "2026-03-10T17:00:00Z",
            },
            {
              id: 102,
              title: "No schedule",
              delayedPostAt: null,
            },
          ],
        },
        refetch: vi.fn().mockResolvedValue(undefined),
      }),
    );
    vi.mocked(chrome.runtime.sendMessage as unknown as ReturnType<typeof vi.fn>).mockReset();
  });

  it("previews shifted announcement dates using the Temporal-backed helper", async () => {
    renderPage();

    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "3" } });
    const announcementCheckboxes = screen.getAllByRole("checkbox");
    fireEvent.click(announcementCheckboxes[0]);
    fireEvent.click(screen.getByRole("button", { name: "Preview Changes" }));

    await waitFor(() => {
      expect(screen.getByText("Preview (1 update(s))")).toBeInTheDocument();
    });

    expect(screen.getByText(formatCanvasDateTime("2026-03-10T17:00:00Z", "America/Denver"))).toBeInTheDocument();
    expect(screen.getByText(formatCanvasDateTime("2026-03-13T17:00:00Z", "America/Denver"))).toBeInTheDocument();
    expect(screen.getByText(/1 announcement\(s\) do not have a scheduled posting date/)).toBeInTheDocument();
  });

  it("sends one announcement update request per preview item with shifted UTC dates", async () => {
    const refetch = vi.fn().mockResolvedValue(undefined);
    mockedUseActiveCourseAnnouncements.mockReturnValue(
      createAnnouncementsQueryResult({
        data: {
          courseId: "51",
          courseName: "History 101",
          courseTimeZone: "America/Denver",
          announcements: [
            {
              id: 101,
              title: "Welcome",
              delayedPostAt: "2026-03-10T17:00:00Z",
            },
            {
              id: 103,
              title: "Reminder",
              delayedPostAt: "2026-03-11T17:00:00Z",
            },
          ],
        },
        refetch,
      }),
    );
    const sendMessageSpy = vi
      .mocked(chrome.runtime.sendMessage as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValue({
        data: [{ status: 200 }, { status: 200 }],
      });

    renderPage();

    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "Select all scheduled" }));
    fireEvent.click(screen.getByRole("button", { name: "Preview Changes" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Apply Changes" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Apply Changes" }));

    await waitFor(() => {
      expect(sendMessageSpy).toHaveBeenCalledTimes(1);
    });

    const requestMessage = sendMessageSpy.mock.calls[0][0];
    expect(requestMessage.type).toBe(MESSAGE_TYPE.Canvas.REQUESTS);
    expect(requestMessage.data).toHaveLength(2);
    expect(requestMessage.data[0].type).toBe(CANVAS_REQUEST_PUT.Announcement);
    expect(requestMessage.data[0].params).toEqual({
      courseId: "51",
      announcementId: 101,
      delayedPostAt: "2026-03-12T17:00:00Z",
    });
    expect(requestMessage.data[1].params).toEqual({
      courseId: "51",
      announcementId: 103,
      delayedPostAt: "2026-03-13T17:00:00Z",
    });
    expect(await screen.findByText("Successfully updated 2 announcement(s).")).toBeInTheDocument();
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("reports partial failures from the update API", async () => {
    vi.mocked(chrome.runtime.sendMessage as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [{ status: 200 }, { status: 500 }],
    });
    mockedUseActiveCourseAnnouncements.mockReturnValue(
      createAnnouncementsQueryResult({
        data: {
          courseId: "51",
          courseName: "History 101",
          courseTimeZone: "America/Denver",
          announcements: [
            {
              id: 101,
              title: "Welcome",
              delayedPostAt: "2026-03-10T17:00:00Z",
            },
            {
              id: 103,
              title: "Reminder",
              delayedPostAt: "2026-03-11T17:00:00Z",
            },
          ],
        },
        refetch: vi.fn().mockResolvedValue(undefined),
      }),
    );

    renderPage();

    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "Select all scheduled" }));
    fireEvent.click(screen.getByRole("button", { name: "Preview Changes" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Apply Changes" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Apply Changes" }));

    expect(await screen.findByText("Updated 1 announcement(s), but 1 failed.")).toBeInTheDocument();
  });
});
