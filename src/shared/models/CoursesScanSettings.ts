/**
 * Holds settings for a course scan
 */
export type ScanType = "course" | ["term", string | number]

export class CoursesScanSettings {
  scanType: ScanType // 'course' for single course or 'term' for term
  courseIds: Array<number | string> // ids of courses to scan
  searchTerms: string[] // search terms to scan for
  scannedItems: string[] // Canvas items to scan for (string identifiers, e.g. "assignment", "page")
  settings: string[] // Additional settings flags (e.g. "only-published-items", "include-html")
  lmsBaseUrl: string // Base url of Canvas instance

  constructor(
    scanType: ScanType,
    courseIds: Array<number | string>,
    searchTerms: string[],
    scannedItems: string[],
    settings: string[],
    lmsBaseUrl: string
  ) {
    this.scanType = scanType
    this.courseIds = courseIds
    this.searchTerms = searchTerms
    this.scannedItems = scannedItems
    this.settings = settings
    this.lmsBaseUrl = lmsBaseUrl
  }
}