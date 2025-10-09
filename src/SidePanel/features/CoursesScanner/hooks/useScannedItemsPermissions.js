import {CanvasRequest} from "../../../../shared/models/CanvasRequest.js";
import {useQuery} from "@tanstack/react-query";
import {Message} from "../../../../shared/models/Message.js";

export default function useScannedItemsPermissions(courseId)
{
  async function fetchPermissions({queryKey})
  {
    const [_key, {courseId}] = queryKey;
    const reqAnnouncements = new CanvasRequest(CanvasRequest.Get.Announcements, {courseId: courseId, page: 1, perPage: 10});
    const reqAssignments = new CanvasRequest(CanvasRequest.Get.Assignments, {courseId: courseId, page: 1, perPage: 10});
    const reqTabs = new CanvasRequest(CanvasRequest.Get.Tabs, {courseId: courseId, page: 1, perPage: 10});
    const reqDiscussions = new CanvasRequest(CanvasRequest.Get.Discussions, {courseId: courseId, page: 1, perPage: 10});
    const reqFiles = new CanvasRequest(CanvasRequest.Get.CourseFiles, {courseId: courseId, onlyNames: true, page: 1, perPage: 10});
    const reqModules = new CanvasRequest(CanvasRequest.Get.Modules, {courseId: courseId, page: 1, perPage: 10});
    const reqPages = new CanvasRequest(CanvasRequest.Get.Pages, {courseId: courseId, includeBody: false, page: 1, perPage: 10});
    const reqCourse = new CanvasRequest(CanvasRequest.Get.Course, {courseId: courseId, syllabusBody: true});

    const canvasRequests = [reqAnnouncements, reqAssignments, reqTabs, reqDiscussions, reqFiles, reqModules, reqPages, reqCourse];


    const msgRequest = new Message(Message.Target.SERVICE_WORKER,
        Message.Sender.SIDE_PANEL,
        Message.Type.Canvas.REQUESTS,
        "Permissions request",
        canvasRequests)
    const msgResponse = await chrome.runtime.sendMessage(msgRequest);

    if(!msgResponse.data) throw new Error("Message data is null")

    const hasAnnouncements = msgResponse.data.filter(item => item.id === reqAnnouncements.id)[0].status < 400;
    const hasAssignments = msgResponse.data.filter(item => item.id === reqAssignments.id)[0].status < 400;
    const hasTabs = msgResponse.data.filter(item => item.id === reqTabs.id)[0].status < 400;
    const hasDiscussions = msgResponse.data.filter(item => item.id === reqDiscussions.id)[0].status < 400;
    const hasFiles = msgResponse.data.filter(item => item.id === reqFiles.id)[0].status < 400;
    const hasModules = msgResponse.data.filter(item => item.id === reqModules.id)[0].status < 400;
    const hasPages = msgResponse.data.filter(item => item.id === reqPages.id)[0].status < 400;
    const courseResponse = msgResponse.data.filter(item => item.id === reqCourse.id)[0];
    const courseObj = courseResponse.text ? JSON.parse(courseResponse.text) : null;
    const hasSyllabus = courseObj["syllabus_body"] ? courseObj["syllabus_body"] !== null : false;

    return {hasAnnouncements:  hasAnnouncements,
    hasAssignments: hasAssignments,
    hasTabs: hasTabs,
    hasDiscussions: hasDiscussions,
    hasFiles: hasFiles,
    hasModules: hasModules,
    hasPages: hasPages,
    hasSyllabus: hasSyllabus}
  }

  return useQuery({
    queryKey: ["get-permissions", {courseId}],
    queryFn: fetchPermissions,
    enabled: !!courseId})
}