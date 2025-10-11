import { CanvasRequest } from "../../../shared/models/CanvasRequest"
import Logger from "../../../shared/utils/Logger"
import Scannable, { ScannableTypes, type ScannableType } from "./Scannable"
import ScannablesBuilder from "./ScannablesBuilder"
import Requester from "./Requester"
import CourseScanResult from "../../../shared/models/CourseScanResult"
import Scanner from "./Scanner"
import type { CanvasResponse } from "../../../shared/models/CanvasResponse"
import type { CoursesScanSettings } from "../../../shared/models/CoursesScanSettings"

type CourseInfo = Record<string, any>

/* Using shared CoursesScanSettings type from ../../../shared/models/CoursesScanSettings */

interface CoursesScanControllerLike {
  running: boolean
  sendCanvasRequests(requests: CanvasRequest[]): Promise<CanvasResponse[] | null>
  incrementProgress(): void
  updateProgressData(courseName: string): void
}

export default class CourseScannerController {
  private courseId: string | number
  private scanSettings: CoursesScanSettings
  private coursesScanController: CoursesScanControllerLike
  private courseScanResult: CourseScanResult
  private courseInfo: CourseInfo | null

  constructor(courseId: string | number, scanSettings: CoursesScanSettings, coursesScanController: CoursesScanControllerLike) {
    this.courseId = courseId
    this.scanSettings = scanSettings
    this.coursesScanController = coursesScanController
    this.courseScanResult = new CourseScanResult()
    this.courseInfo = null
  }

  // Get the info of the course and update it to the class field
  async collectCourseInfo(): Promise<boolean> {
    const response = await this.coursesScanController.sendCanvasRequests([
      new CanvasRequest(CanvasRequest.Get.Course, {
        courseId: this.courseId,
        syllabusBody: this.scanSettings.scannedItems.includes(ScannableTypes.SYLLABUS),
      }),
    ])

    Logger.debug(__dirname, "Course info response: " + JSON.stringify(response))
    if (!response || !response[0] || !response[0].ok || !response[0].text) return false

    this.courseInfo = JSON.parse(response[0].text)

    return true
  }

  async scanCourseItems(): Promise<void> {
    const scannables = ScannablesBuilder.build(this.scanSettings.scannedItems as ScannableType[])
    Logger.debug(__dirname, "" + scannables.length + " Scannables: " + scannables.toString())
    const requester = new Requester(this.courseId, this.courseInfo as CourseInfo, this.coursesScanController)

    while (scannables.length > 0 && this.coursesScanController.running) {
      // Make requests for each scannable, update items and update isLastPage
      const success = await requester.request(scannables)
      void success

      // Iterate backwards so new items can be added while old items can be removed
      for (let i = scannables.length - 1; i >= 0; i--) {
        const scannable = scannables[i]

        ////// Scan items in each scannable (except modules) AND add results to results
        const scanSettingsForScanner = {
          settings: this.scanSettings.settings,
          searchTerms: this.scanSettings.searchTerms,
          lmsBaseUrl: this.scanSettings.lmsBaseUrl,
        }
        const scanResults = Scanner.scanItems(scannable.items as any[], scannable.type, scanSettingsForScanner, this.courseInfo as CourseInfo)
        this.courseScanResult.appendResults(scanResults)

        ////// If type "MODULE," create new Scannable of type "MODULE_ITEMS"
        if (scannable.type === ScannableTypes.MODULE) {
          scannable.items.forEach((module: any) => {
            scannables.push(new Scannable(ScannableTypes.MODULE_ITEM, module["id"]))
          })
        }

        ////// Remove if isLastPage and update progress OR prepare for next iteration
        if (scannable.isLastPage) {
          scannables.splice(i, 1)

          // Increment progress once for all types except MODULE_ITEM
          if (scannable.type !== ScannableTypes.MODULE_ITEM) this.coursesScanController.incrementProgress()
        } else {
          scannable.incrementPage()
          scannable.clearItems()
        }
      }
    }
  }

  async run(): Promise<CourseScanResult> {
    // Prepare for course scan
    const hasCourseInfo = await this.collectCourseInfo()

    // Handle error if there is no course info returned
    if (!hasCourseInfo) {
      console.warn(`No course info found for course ${this.courseId}`)
      this.courseScanResult.errors = ["No course info found for course"]
      return this.courseScanResult
    }

    // Update scan result model info and progress
    this.courseScanResult.setFields(this.courseInfo as CourseInfo, this.scanSettings.lmsBaseUrl)
    this.coursesScanController.updateProgressData((this.courseInfo as CourseInfo)["name"])

    // Scan course
    await this.scanCourseItems()

    // Return the course scan result model
    return this.courseScanResult
  }
}