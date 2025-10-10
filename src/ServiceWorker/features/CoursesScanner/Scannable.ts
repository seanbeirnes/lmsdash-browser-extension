import { CourseItemType } from "../../../shared/models/CourseItem"

export const ScannableTypes = {
  ANNOUNCEMENT: CourseItemType.ANNOUNCEMENT,
  ASSIGNMENT: CourseItemType.ASSIGNMENT,
  COURSE_NAV_LINK: CourseItemType.COURSE_NAV_LINK,
  DISCUSSION: CourseItemType.DISCUSSION,
  FILE: CourseItemType.FILE,
  MODULE: CourseItemType.MODULE,
  MODULE_ITEM: CourseItemType.MODULE_ITEM,
  MODULE_LINK: CourseItemType.MODULE_LINK,
  PAGE: CourseItemType.PAGE,
  SYLLABUS: CourseItemType.SYLLABUS,
} as const

// Use CourseItemType for the shared item types and extend for scanner-specific types
export type ScannableType = typeof ScannableTypes[keyof typeof ScannableTypes]

export default class Scannable {
  type: ScannableType
  items: unknown[]
  page: number
  id: string | number | null
  requestId: string | number | null
  isLastPage: boolean

  constructor(type: ScannableType, id: string | number | null = null) {
    this.type = type
    this.items = []
    this.page = 1
    this.id = id
    this.requestId = null
    this.isLastPage = false
  }

  incrementPage(): void {
    this.page++
  }

  setId(id: string | number | null): void {
    this.id = id
  }

  setIsLastPage(isLastPage: boolean): void {
    this.isLastPage = isLastPage
  }

  setItems(scannableItems: unknown[]): void {
    this.items = scannableItems
  }

  clearItems(): void {
    this.items = []
  }

  appendItem(scannableItem: any): void {
    this.items.push(scannableItem)
  }
}