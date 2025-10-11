import { CanvasRequest } from "../../../shared/models/CanvasRequest"
import Logger from "../../../shared/utils/Logger"
import CourseScannerController from "./CourseScannerController"
import Task from "../../../shared/models/Task"
import type { CanvasResponse } from "../../../shared/models/CanvasResponse"
import type { CoursesScanSettings } from "../../../shared/models/CoursesScanSettings"
import CourseScanResult from "../../../shared/models/CourseScanResult"

/* Using shared CoursesScanSettings type from ../../../shared/models/CoursesScanSettings */

interface MessageHandlerLike {
  sendCanvasRequests(requests: CanvasRequest[]): Promise<CanvasResponse[] | null>
}

interface AppControllerLike {
  messageHandler: MessageHandlerLike
}

export default class CoursesScanController {
  private appController: AppControllerLike
  private task: Task
  private scanSettings: CoursesScanSettings
  coursesScanned: number
  totalCourses: number
  totalProgressSteps: number
  currentProgressStep: number
  running: boolean
  courseScanResults: CourseScanResult[]
  stopped: boolean

  constructor(task: Task, appController: AppControllerLike) {
    this.appController = appController
    this.task = task
    this.scanSettings = task.settingsData as CoursesScanSettings
    this.coursesScanned = 0
    this.totalCourses = 0
    this.totalProgressSteps = 0
    this.currentProgressStep = 0
    this.running = false
    this.courseScanResults = []
    this.stopped = false
  }

  start(): boolean {
    this.running = true
    this.task.setProgressData(["Starting search..."])
    void this.run()
    return true
  }

  stop(): void {
    this.running = false
    this.stopped = true
    this.task.setProgressData(["Stopping search..."])
  }

  private async run(): Promise<void> {
    // If scan type is 'term', collect course ids
    this.task.setProgressData(["Gathering courses..."])
    if (Array.isArray(this.scanSettings.scanType) && this.scanSettings.scanType.includes("term")) {
      await this.collectCourseIds()
    }

    // Initialize totalProgressSteps and totalCourses fields
    this.initTotalCourses()
    this.initProgress()

    // for each course id, while running is true, scan course with that id
    for (let i = 0; i < this.scanSettings.courseIds.length; i++) {
      if (!this.running) break // Check if scan was stopped

      const courseScanController = new CourseScannerController(this.scanSettings.courseIds[i], this.scanSettings, this)

      this.incrementProgress()

      const scanResult = await courseScanController.run()

      // If scan results were found, add to the courseScanResults array
      if (
        scanResult.items.announcement.length ||
        scanResult.items.assignment.length ||
        scanResult.items.courseNavLink.length ||
        scanResult.items.discussion.length ||
        scanResult.items.file.length ||
        scanResult.items.moduleLink.length ||
        scanResult.items.page.length ||
        scanResult.items.syllabus.length
      ) {
        this.courseScanResults.push(scanResult)
      }

      this.incrementCoursesScanned()
    }

    this.running = false

    // Update task with results and stop scan
    this.task.setStatus(this.stopped ? "failed" : "complete")
    this.task.setTimeFinished()
    this.task.setProgressData(this.stopped ? ["Search stopped"] : ["Search Complete!", `Searched ${this.totalCourses} course(s)`])
    this.task.setResultsData(this.courseScanResults)

    Logger.debug(__dirname, "Search Complete! \n" + this.task.toString())
  }

  async collectCourseIds(): Promise<void> {
    let hasNextLink = true
    let page = 1
    const courseIds: Array<number | string> = []

    while (hasNextLink && this.running) {
      const response = await this.sendCanvasRequests([
        new CanvasRequest(CanvasRequest.Get.CoursesByTermId, {
          termId: (this.scanSettings.scanType as ["term", string | number])[1],
          page: page,
          perPage: 100,
        }),
      ])

      if (response == null) {
        return
      }

      const responseData = JSON.parse(response[0].text)
      responseData.forEach((courseObj: any) => courseIds.push(courseObj["id"]))

      if (!response[0].link || !response[0].link.next) hasNextLink = false

      page++
    }

    this.scanSettings.courseIds = courseIds

    Logger.debug(__dirname, "Collected course IDs for searching: \n" + courseIds.toString())
  }

  async sendCanvasRequests(requests: CanvasRequest[]): Promise<CanvasResponse[] | null> {
    return await this.appController.messageHandler.sendCanvasRequests(requests)
  }

  incrementProgress(): void {
    this.currentProgressStep++
    this.task.setProgress(Math.round((this.currentProgressStep / this.totalProgressSteps) * 100))
    Logger.debug(__dirname, "Incremented task progress: \n" + this.task.toString())
  }

  updateProgressData(courseName: string): void {
    this.task.setProgressData([`Searching course ${this.coursesScanned + 1} of ${this.totalCourses}`, `Searching items in course ${courseName}`])
  }

  private initProgress(): void {
    let stepsPerCourse = this.scanSettings.scannedItems.length // Total types of items to scan
    // Account for an extra step to increment at the start of each course scan
    stepsPerCourse++
    this.totalProgressSteps = stepsPerCourse * this.scanSettings.courseIds.length
  }

  incrementCoursesScanned(): void {
    this.coursesScanned++
  }

  private initTotalCourses(): void {
    this.totalCourses = this.scanSettings.courseIds.length
  }
}