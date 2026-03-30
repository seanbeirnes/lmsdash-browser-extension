import { CanvasRequest } from "../../../../shared/models/CanvasRequest";
import { useQuery } from "@tanstack/react-query";
import { Message, MESSAGE_SENDER, MESSAGE_TARGET, MESSAGE_TYPE } from "../../../../shared/models/Message";

type Permissions = {
  hasAnnouncements: boolean;
  hasAssignments: boolean;
  hasTabs: boolean;
  hasDiscussions: boolean;
  hasFiles: boolean;
  hasModules: boolean;
  hasPages: boolean;
  hasSyllabus: boolean;
};

type RequestResponseItem = {
  id: string;
  status: number;
  text?: string;
};

export default function useScannedItemsPermissions(courseId: number | string | null) {
  async function fetchPermissions({ queryKey }: { queryKey: [string, { courseId: number | string | null }] }): Promise<Permissions> {
    const [_key, { courseId }] = queryKey;

    const reqAnnouncements = new CanvasRequest(CanvasRequest.Get.Announcements, { courseId, page: 1, perPage: 10 });
    const reqAssignments = new CanvasRequest(CanvasRequest.Get.Assignments, { courseId, page: 1, perPage: 10 });
    const reqTabs = new CanvasRequest(CanvasRequest.Get.Tabs, { courseId, page: 1, perPage: 10 });
    const reqDiscussions = new CanvasRequest(CanvasRequest.Get.Discussions, { courseId, page: 1, perPage: 10 });
    const reqFiles = new CanvasRequest(CanvasRequest.Get.CourseFiles, { courseId, onlyNames: true, page: 1, perPage: 10 });
    const reqModules = new CanvasRequest(CanvasRequest.Get.Modules, { courseId, page: 1, perPage: 10 });
    const reqPages = new CanvasRequest(CanvasRequest.Get.Pages, { courseId, includeBody: false, page: 1, perPage: 10 });
    const reqCourse = new CanvasRequest(CanvasRequest.Get.Course, { courseId, syllabusBody: true });

    const canvasRequests = [reqAnnouncements, reqAssignments, reqTabs, reqDiscussions, reqFiles, reqModules, reqPages, reqCourse];

    const msgRequest = new Message(
      MESSAGE_TARGET.SERVICE_WORKER,
      MESSAGE_SENDER.SIDE_PANEL,
      MESSAGE_TYPE.Canvas.REQUESTS,
      "Permissions request",
      canvasRequests
    );

    const msgResponse = await chrome.runtime.sendMessage(msgRequest) as { data?: RequestResponseItem[] };

    if (!msgResponse.data) {
      throw new Error("Message data is null");
    }

    const findResponse = (requestId: string) => {
      const response = msgResponse.data?.find((item) => item.id === requestId);
      if (!response) {
        throw new Error(`Missing response for request ${requestId}`);
      }

      return response;
    };

    const hasAnnouncements = findResponse(reqAnnouncements.id).status < 400;
    const hasAssignments = findResponse(reqAssignments.id).status < 400;
    const hasTabs = findResponse(reqTabs.id).status < 400;
    const hasDiscussions = findResponse(reqDiscussions.id).status < 400;
    const hasFiles = findResponse(reqFiles.id).status < 400;
    const hasModules = findResponse(reqModules.id).status < 400;
    const hasPages = findResponse(reqPages.id).status < 400;
    const courseResponse = findResponse(reqCourse.id);
    const courseObj = courseResponse.text ? JSON.parse(courseResponse.text) as Record<string, unknown> : null;
    const hasSyllabus = typeof courseObj?.syllabus_body === "string" && courseObj.syllabus_body !== null;

    return {
      hasAnnouncements,
      hasAssignments,
      hasTabs,
      hasDiscussions,
      hasFiles,
      hasModules,
      hasPages,
      hasSyllabus,
    };
  }

  return useQuery({
    queryKey: ["get-permissions", { courseId }],
    queryFn: fetchPermissions,
    enabled: !!courseId,
  });
}
