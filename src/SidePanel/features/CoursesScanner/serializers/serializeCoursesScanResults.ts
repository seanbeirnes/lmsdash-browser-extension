import { CourseItemTypes, type CourseItemType } from "../../../../shared/models/CourseItem";
import type CourseItemScanResult from "../../../../shared/models/CourseItemScanResult";

type ItemLike = CourseItemScanResult | {
  type: CourseItemType;
  id: number | string;
  name: string;
  url?: string | null;
  published: boolean;
  matches: string[];
};

interface SerializableCourse {
  id: number | string | null;
  name: string | null;
  courseCode: string | null;
  sisCourseId: string | null;
  published: boolean | null;
  url: string | null;
  items: {
    announcement: ItemLike[];
    assignment: ItemLike[];
    courseNavLink: ItemLike[];
    discussion: ItemLike[];
    file: ItemLike[];
    moduleLink: ItemLike[];
    page: ItemLike[];
    syllabus: ItemLike[];
  };
}

export default async function serializeCoursesScanResults(
  scanResults: SerializableCourse[]
): Promise<string> {
  const headerRow = [
    "course_id",
    "course_name",
    "course_code",
    "course_sis_id",
    "course_published",
    "course_url",
    "type",
    "id",
    "name",
    "url",
    "published",
    "matches"
  ];

  const rows: string[] = [];
  rows.push(headerRow.join(","));
  for (const course of scanResults) {
    rows.push(...serializeCourse(course));
  }
  return rows.join("\n");
}

function serializeCourse(course: SerializableCourse): string[] {
  const courseDetails = [
    formatText(course?.id ?? ""),
    formatText(course?.name ?? ""),
    course?.courseCode ? formatText(course.courseCode) : "",
    course?.sisCourseId ? formatText(course.sisCourseId) : "",
    course?.published ? "TRUE" : "FALSE",
    course?.url ? formatText(course.url) : "",
  ];

  const results: string[] = [];

  const pushRows = (items?: ItemLike[]) => {
    if (!items) return;
    for (const item of items) {
      results.push([...courseDetails, ...serializeCourseItem(item)].join(","));
    }
  };

  pushRows(course.items.announcement);
  pushRows(course.items.assignment);
  pushRows(course.items.courseNavLink);
  pushRows(course.items.discussion);
  pushRows(course.items.file);
  pushRows(course.items.moduleLink);
  pushRows(course.items.page);
  pushRows(course.items.syllabus);

  return results;
}

function serializeCourseItem(courseItem: ItemLike): string[] {
  return [
    formatText(courseItem.type),
    formatText(courseItem.type === CourseItemTypes.SYLLABUS ? "N/A" : courseItem.id),
    formatText(courseItem.name),
    courseItem.url ? formatText(courseItem.url) : "",
    courseItem.published ? "TRUE" : "FALSE",
    formatText(Array.isArray(courseItem.matches) ? courseItem.matches.join(", ") : ""),
  ];
}

function formatText(input: string | number): string {
  const text = String(input ?? "").trim();
  if (!text.includes(",")) return text;
  if (text.includes('"')) return `"${text.replace(/"/g, '""')}"`;
  return `"${text}"`;
}