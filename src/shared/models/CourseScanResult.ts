/**
 * Holds the resulting data for a course scan
 */
import CourseItemScanResult from "./CourseItemScanResult"
import { CourseItemTypes, type CourseItemType } from "./CourseItem"

type CourseInfo = Record<string, any>

type ItemsMap = {
  announcement: CourseItemScanResult[]
  assignment: CourseItemScanResult[]
  courseNavLink: CourseItemScanResult[]
  discussion: CourseItemScanResult[]
  file: CourseItemScanResult[]
  moduleLink: CourseItemScanResult[]
  page: CourseItemScanResult[]
  syllabus: CourseItemScanResult[]
}

export default class CourseScanResult {
  id: number | string | null
  name: string | null
  courseCode: string | null
  sisCourseId: string | null
  published: boolean | null
  url: string | null
  items: ItemsMap
  errors: string[] | null

  constructor() {
    this.id = null
    this.name = null
    this.courseCode = null
    this.sisCourseId = null
    this.published = null
    this.url = null
    this.items = {
      announcement: [],
      assignment: [],
      courseNavLink: [],
      discussion: [],
      file: [],
      moduleLink: [],
      page: [],
      syllabus: [],
    }
    this.errors = null
  }

  // Sets the fields of the class from the courseInfo object
  setFields(courseInfo: CourseInfo, baseUrl: string): void {
    this.id = courseInfo["id"]
    this.name = courseInfo["name"]
    this.courseCode = courseInfo["course_code"]
    this.sisCourseId = courseInfo["sis_course_id"]
    // "available" courses are visible, "completed" courses are visible in read only state
    this.published = courseInfo["workflow_state"] === "available" || courseInfo["workflow_state"] === "completed"
    this.url = baseUrl + "/courses/" + this.id
  }

  append = {
    announcement: (item: CourseItemScanResult) => this.items.announcement.push(item),
    assignment: (item: CourseItemScanResult) => this.items.assignment.push(item),
    courseNavLink: (item: CourseItemScanResult) => this.items.courseNavLink.push(item),
    discussion: (item: CourseItemScanResult) => this.items.discussion.push(item),
    file: (item: CourseItemScanResult) => this.items.file.push(item),
    moduleLink: (item: CourseItemScanResult) => this.items.moduleLink.push(item),
    page: (item: CourseItemScanResult) => this.items.page.push(item),
    syllabus: (item: CourseItemScanResult) => this.items.syllabus.push(item),
  }

  appendResults(scanResults: Array<CourseItemScanResult | null>): void {
    for (let i = 0; i < scanResults.length; i++) {
      const scanResult = scanResults[i]
      if (!scanResult) continue // Do not append null values

      switch (scanResult.type as CourseItemType) {
        case CourseItemTypes.ANNOUNCEMENT:
          this.append.announcement(scanResult)
          break

        case CourseItemTypes.ASSIGNMENT:
          this.append.assignment(scanResult)
          break

        case CourseItemTypes.COURSE_NAV_LINK:
          this.append.courseNavLink(scanResult)
          break

        case CourseItemTypes.DISCUSSION:
          this.append.discussion(scanResult)
          break

        case CourseItemTypes.FILE:
          this.append.file(scanResult)
          break

        case CourseItemTypes.MODULE_LINK:
          this.append.moduleLink(scanResult)
          break

        case CourseItemTypes.PAGE:
          this.append.page(scanResult)
          break

        case CourseItemTypes.SYLLABUS:
          this.append.syllabus(scanResult)
          break

        default:
          throw new Error("Unrecognized item type for scan result")
      }
    }
  }
}