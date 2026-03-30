import { Message, MESSAGE_SENDER, MESSAGE_TARGET, MESSAGE_TYPE } from "../../../../../shared/models/Message";
import { useQuery } from "@tanstack/react-query";
import { CanvasRequest } from "../../../../../shared/models/CanvasRequest";
import ProgressSpinner from "../../../../components/shared/progress/ProgressSpinner";
import { useEffect } from "react";

type CourseData = {
  id: number | string;
  name: string;
  course_code: string;
  sis_course_id?: string | null;
};

type CanvasResponse = {
  status: number;
  text: string;
};

interface SelectCourseProps {
  courseId: number | string | null;
  setCourseIds: (ids: Array<number | string>) => void;
}

function SelectCourse({ courseId, setCourseIds }: SelectCourseProps) {
  async function fetchCourse({ queryKey }: { queryKey: [string, { courseId: number | string | null }] }): Promise<{ data: CanvasResponse[] }> {
    const [_key, { courseId }] = queryKey;
    const msgRequest = new Message(
      MESSAGE_TARGET.SERVICE_WORKER,
      MESSAGE_SENDER.SIDE_PANEL,
      MESSAGE_TYPE.Canvas.REQUESTS,
      "Course request",
      [new CanvasRequest(CanvasRequest.Get.Course, { courseId })]
    );
    const msgResponse = await chrome.runtime.sendMessage(msgRequest) as { data: CanvasResponse[] };

    if (msgResponse.data.length === 0) throw Error("Course Not Found");
    if (msgResponse.data[0].status >= 400) throw Error("Error fetching course info");
    if (msgResponse.data[0].text.length < 1) throw Error("No course information received");

    return msgResponse;
  }

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["get-course", { courseId }],
    queryFn: fetchCourse,
    enabled: !!courseId,
  });

  const course = data ? JSON.parse(data.data[0].text) as CourseData : null;

  useEffect(() => {
    if (course) {
      setCourseIds([course.id]);
    } else {
      setCourseIds([]);
    }
  }, [data, setCourseIds]);

  if (!courseId) {
    return (
      <>
        <p>No course selected.</p>
        <p>Navigate to a course and it will automatically be selected.</p>
      </>
    );
  }

  if (isPending || !data) {
    return (
      <div className="w-full flex justify-center">
        <ProgressSpinner className="" />
      </div>
    );
  }

  if (isError) {
    return (
      <p>{error.message}</p>
    );
  }

  if (!course) {
    return (
      <p>No course information received.</p>
    );
  }

  return (
    <div className="text-base text-gray-700">
      <p><span className="font-bold">Title: </span>{course.name}</p>
      <p><span className="font-bold">Code:  </span>{course.course_code}</p>
      {course.sis_course_id && (<p><span className="font-bold">SISID: </span>{course.sis_course_id}</p>)}
    </div>
  );
}

export default SelectCourse;
