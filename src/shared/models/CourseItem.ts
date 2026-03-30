export const CourseItemTypes = {
  ANNOUNCEMENT: "announcement",
  ASSIGNMENT: "assignment",
  COURSE_NAV_LINK: "course-nav-link",
  DISCUSSION: "discussion",
  FILE: "file",
  MODULE: "module",
  MODULE_ITEM: "module-item",
  MODULE_LINK: "module-link",
  PAGE: "page",
  SYLLABUS: "syllabus",
} as const

export type CourseItemType = typeof CourseItemTypes[keyof typeof CourseItemTypes]