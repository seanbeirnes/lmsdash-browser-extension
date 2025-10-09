import {Message} from "../../../../../shared/models/Message.js";
import {useQuery} from "@tanstack/react-query";
import {CanvasRequest} from "../../../../../shared/models/CanvasRequest.js";
import ProgressSpinner from "../../../../components/shared/progress/ProgressSpinner.jsx";
import {useEffect} from "react";

function SelectCourse({courseId, setCourseIds})
{
  async function fetchCourse({queryKey})
  {
    const [_key, {courseId}] = queryKey;
    const msgRequest = new Message(Message.Target.SERVICE_WORKER,
        Message.Sender.SIDE_PANEL,
        Message.Type.Canvas.REQUESTS,
        "Course request",
        [new CanvasRequest(CanvasRequest.Get.Course, {courseId: courseId})])
    const msgResponse = await chrome.runtime.sendMessage(msgRequest);

    if(msgResponse.data.length === 0) throw Error("Course Not Found");
    if(msgResponse.data[0].status >= 400) throw Error("Error fetching course info");
    if(msgResponse.data[0].text.length < 1) throw Error("No course information received");

    return msgResponse;
  }
  const {isPending, isError, data, error} = useQuery({queryKey: ["get-course", {courseId}], queryFn:fetchCourse, enabled: !!courseId})

  const course = data ? JSON.parse(data.data[0].text) : null;

  // Update the course id in course settings
  useEffect(() => {
    if(course)
    {
      setCourseIds([course.id])
    }
    else
    {
      setCourseIds([]);
    }
  }, [data])

  if(!courseId)
  {
    return(
      <>
        <p>No course selected.</p>
        <p>Navigate to a course and it will automatically be selected.</p>
      </>
    )
  }

  if(isPending || !data)
  {
    return (
      <div className="w-full flex justify-center">
      <ProgressSpinner />
      </div>
    )
  }

  if(isError)
  {
    return (
      <p>{error.message}</p>
    )
  }

  return (
    <div className="text-base text-gray-700">
      <p><span className={"font-bold"}>Title: </span>{course["name"]}</p>
      <p><span className={"font-bold"}>Code:  </span>{course["course_code"]}</p>
      {course["sis_course_id"] && (<p><span className={"font-bold"}>SISID: </span>{course["sis_course_id"]}</p>)}
    </div>
  )
}

export default SelectCourse;