import PrimaryCard from "../../../../components/shared/cards/PrimaryCard.jsx";
import * as Collapsible from "@radix-ui/react-collapsible";
import {
  CaretSortIcon, FileIcon, FileTextIcon
} from "@radix-ui/react-icons";
import {useState} from "react";
import CaretUnsortIcon from "../../../../components/shared/icons/CaretUnsortIcon.jsx";
import MegaphoneSimpleIcon from "../../../../components/shared/icons/MegaphoneSimpleIcon.jsx";
import PencilLineIcon from "../../../../components/shared/icons/PencilLineIcon.jsx";
import LinkSimpleIcon from "../../../../components/shared/icons/LinkSimpleIcon.jsx";
import ChatCircleTextIcon from "../../../../components/shared/icons/ChatCircleTextIcon.jsx";
import ClipboardTextIcon from "../../../../components/shared/icons/ClipboardTextIcon.jsx";
import CourseItemResultsSection from "./CourseItemResultsSection.jsx";

function CourseScanResult({id, name, courseCode, sisCourseId, published, url, items, defaultOpen = false, infoModalCallback})
{
  const [open, setOpen] = useState(defaultOpen);

  return (
    <PrimaryCard fixedWidth={false} minHeight={false} className="w-full">
      <Collapsible.Root open={open} onOpenChange={setOpen}>
        <div className={`flex flex-row items-center gap-1 ${open ? "mb-2" : ""}`}>
          <h3 className="basis-full text-xl text-Left">
            <a href={url} target="_blank" title="Link to course"
               className="text-blue-600 hover:text-blue-500 hover:underline active:text-blue-400">{name}</a>
          </h3>
          <Collapsible.Trigger
            className="text-blue-600 rounded-sm hover:text-blue-50 hover:bg-blue-500 active:bg-blue-400 active:shadow-inner">
            {open ?
              <CaretUnsortIcon className="w-9 h-9"/>
              :
              <CaretSortIcon className="w-9 h-9"/>}
          </Collapsible.Trigger>
        </div>
        <Collapsible.Content>
          <div
            className="w-full sm:w-fit flex flex-col sm:flex-row flex-wrap justify-start items-center content-center gap-2">
            {published ?
              <p
                className="w-full sm:w-fit px-4 py-1 text-sm text-green-600 bg-green-200 font-bold text-center rounded-full">Published</p>
              :
              <p
                className="w-full sm:w-fit px-4 py-1 text-sm text-red-600 bg-red-200 font-bold text-center rounded-full">Unpublished</p>
            }
            {
              courseCode &&
              <p className="w-full sm:w-fit px-4 py-1 text-sm text-gray-400 bg-gray-100 text-center rounded-full"><span
                className="inline-block font-bold">Course Code:</span> {courseCode}</p>
            }
            {
              sisCourseId &&
              <p className="w-full sm:w-fit px-4 py-1 text-sm text-gray-400 bg-gray-100 text-center rounded-full"><span
                className="inline-block font-bold">SIS ID:</span> {sisCourseId}</p>
            }
            {
              id &&
              <p className="w-full sm:w-fit px-4 py-1 text-sm text-gray-400 bg-gray-100 text-center rounded-full"><span
                className="inline-block font-bold">ID:</span> {id}</p>
            }
          </div>
          {(items.announcement?.length > 0) &&
            <CourseItemResultsSection icon={<MegaphoneSimpleIcon className="w-6 h-6 text-gray-400"/>}
                                      title="Announcements" items={items.announcement} infoModalCallback={infoModalCallback} />
          }
          {(items.assignment?.length > 0) &&
            <CourseItemResultsSection icon={<PencilLineIcon className="w-6 h-6 text-gray-400"/>} title="Assignments"
                                      items={items.assignment} infoModalCallback={infoModalCallback} />
          }
          {(items.courseNavLink?.length > 0) &&
            <CourseItemResultsSection icon={<LinkSimpleIcon className="w-6 h-6 text-gray-400"/>}
                                      title="Course Navigation Links" items={items.courseNavLink} infoModalCallback={infoModalCallback} />
          }
          {(items.discussion?.length > 0) &&
            <CourseItemResultsSection icon={<ChatCircleTextIcon className="w-6 h-6 text-gray-400"/>} title="Discussions"
                                      items={items.discussion} infoModalCallback={infoModalCallback} />
          }
          {(items.file?.length > 0) &&
            <CourseItemResultsSection icon={<FileIcon className="w-6 h-6 text-gray-400"/>} title="File Names"
                                      items={items.file} infoModalCallback={infoModalCallback} />
          }
          {(items.moduleLink?.length > 0) &&
            <CourseItemResultsSection icon={<LinkSimpleIcon className="w-6 h-6 text-gray-400"/>} title="Module Links"
                                      items={items.moduleLink} infoModalCallback={infoModalCallback} />
          }
          {(items.page?.length > 0) &&
            <CourseItemResultsSection icon={<FileTextIcon className="w-6 h-6 text-gray-400"/>} title="Pages"
                                      items={items.page} infoModalCallback={infoModalCallback} />
          }
          {(items.syllabus?.length > 0) &&
            <CourseItemResultsSection icon={<ClipboardTextIcon className="w-6 h-6 text-gray-400"/>} title="Syllabus"
                                      items={items.syllabus} infoModalCallback={infoModalCallback} />
          }
        </Collapsible.Content>
      </Collapsible.Root>
    </PrimaryCard>
  )
}

export default CourseScanResult;
