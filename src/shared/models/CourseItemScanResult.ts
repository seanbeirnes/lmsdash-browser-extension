import type { CourseItemType } from "./CourseItem"

export type PreviewTuple = [string, string, string]

// Holds the data for a course item that contained a match in the scan process.
export default class CourseItemScanResult {
  type: CourseItemType
  id: number | string
  name: string
  url: string
  published: boolean
  matches: string[]
  previews: PreviewTuple[]
  errors: string[]

  constructor(
    type: CourseItemType,
    id: number | string,
    name: string,
    url: string,
    published: boolean,
    matches: string[] = [],
    previews: PreviewTuple[] = [],
    errors: string[] = []
  ) {
    this.type = type
    this.id = id
    this.name = name
    this.matches = matches
    this.previews = previews
    this.url = url
    this.published = published
    this.errors = errors
  }
}