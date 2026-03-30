import { useQuery } from "@tanstack/react-query";
import { Message, MESSAGE_SENDER, MESSAGE_TARGET, MESSAGE_TYPE } from "../../shared/models/Message";
import { CanvasRequest } from "../../shared/models/CanvasRequest";

export interface AnnouncementDateItem {
  id: number;
  title: string;
  delayedPostAt: string | null;
}

interface ActiveCourseAnnouncementsResult {
  courseId: string;
  courseName: string;
  courseTimeZone: string;
  announcements: AnnouncementDateItem[];
}

type QueryKey = ["active-course-announcements", { courseId: string }];

type CanvasResponseItem = {
  id: string;
  status: number;
  text: string;
  link?: Record<string, string> | null;
};

type AnnouncementApiItem = {
  id: number;
  title: string;
  delayed_post_at: string | null;
};

type CourseApiItem = {
  name?: string;
  time_zone?: string | null;
};

function getNextPage(link: string | undefined): number | null {
  if (!link) return null;

  try {
    const nextUrl = new URL(link);
    const page = nextUrl.searchParams.get("page");
    if (!page) return null;

    const pageNumber = Number.parseInt(page, 10);
    if (Number.isNaN(pageNumber)) return null;

    return pageNumber;
  } catch {
    return null;
  }
}

async function sendCanvasRequests(requests: CanvasRequest[]): Promise<CanvasResponseItem[]> {
  const msgRequest = new Message(
    MESSAGE_TARGET.SERVICE_WORKER,
    MESSAGE_SENDER.SIDE_PANEL,
    MESSAGE_TYPE.Canvas.REQUESTS,
    "Canvas requests",
    requests
  );

  const msgResponse = await chrome.runtime.sendMessage(msgRequest) as { data?: CanvasResponseItem[] };
  return msgResponse.data ?? [];
}

async function fetchAnnouncementsData({ queryKey }: { queryKey: QueryKey }): Promise<ActiveCourseAnnouncementsResult> {
  const [_key, { courseId }] = queryKey;

  if (!courseId) {
    throw new Error("No active course found");
  }

  const courseRequest = new CanvasRequest(CanvasRequest.Get.Course, { courseId });
  const courseResponse = await sendCanvasRequests([courseRequest]);

  if (courseResponse.length === 0 || courseResponse[0].status >= 400) {
    throw new Error("Could not load active course details");
  }

  let courseName = `Course ${courseId}`;
  let courseTimeZone = "";

  try {
    const courseData = JSON.parse(courseResponse[0].text) as CourseApiItem;
    if (typeof courseData.name === "string" && courseData.name.length > 0) {
      courseName = courseData.name;
    }

    if (typeof courseData.time_zone === "string") {
      courseTimeZone = courseData.time_zone;
    }
  } catch {
    throw new Error("Could not parse active course details");
  }

  const announcements: AnnouncementDateItem[] = [];
  let nextPage: number | null = 1;

  while (nextPage !== null) {
    const announcementRequest = new CanvasRequest(CanvasRequest.Get.Announcements, {
      courseId,
      page: nextPage,
      perPage: 100,
    });

    const announcementResponse = await sendCanvasRequests([announcementRequest]);

    if (announcementResponse.length === 0 || announcementResponse[0].status >= 400) {
      throw new Error("Could not load announcements");
    }

    let pageItems: AnnouncementApiItem[] = [];

    try {
      pageItems = JSON.parse(announcementResponse[0].text) as AnnouncementApiItem[];
    } catch {
      throw new Error("Could not parse announcements data");
    }

    pageItems.forEach((item) => {
      announcements.push({
        id: item.id,
        title: item.title,
        delayedPostAt: item.delayed_post_at,
      });
    });

    nextPage = getNextPage(announcementResponse[0].link?.next);
  }

  return {
    courseId,
    courseName,
    courseTimeZone,
    announcements,
  };
}

export default function useActiveCourseAnnouncements(courseId: string | null) {
  return useQuery({
    queryKey: ["active-course-announcements", { courseId: courseId ?? "" }],
    queryFn: fetchAnnouncementsData,
    enabled: Boolean(courseId),
    staleTime: 15_000,
  });
}
