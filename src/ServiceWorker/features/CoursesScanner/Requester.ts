import Scannable, {ScannableTypes} from "./Scannable"
import { CanvasRequest } from "../../../shared/models/CanvasRequest"
import Logger from "../../../shared/utils/Logger"
import { CanvasResponse } from "../../../shared/models/CanvasResponse"

type CourseInfo = Record<string, any>

interface CoursesScanControllerLike {
  sendCanvasRequests(requests: CanvasRequest[]): Promise<CanvasResponse[] | null>
}

export default class Requester {
  private courseId: string | number
  private courseInfo: CourseInfo
  private coursesScanController: CoursesScanControllerLike

  constructor(courseId: string | number, courseInfo: CourseInfo, coursesScanController: CoursesScanControllerLike) {
    this.courseId = courseId
    this.courseInfo = courseInfo
    this.coursesScanController = coursesScanController
  }

  // Makes the requests and updates items for an array of scannable
  async request(scannables: Scannable[]): Promise<boolean> {
    const canvasRequests: CanvasRequest[] = []

    // Clear previous items and build new request
    scannables.forEach((scannable) => {
      // Ignore syllabus type
      if (scannable.type === ScannableTypes.SYLLABUS) return

      const canvasRequest = this.buildRequest(scannable)
      scannable.requestId = canvasRequest.id
      canvasRequests.push(canvasRequest)
    })

    Logger.debug("src/ServiceWorker/features/CoursesScanner/Requester.ts", canvasRequests.toString())

    // Make the requests
    const responses = await this.coursesScanController.sendCanvasRequests(canvasRequests)

    // Update the items and check if last page
    scannables.forEach((scannable) => {
      // Handle syllabus type
      if (scannable.type === ScannableTypes.SYLLABUS) {
        scannable.appendItem(this.courseInfo["syllabus_body"])
        return
      }

      const response = responses?.find((res) => res.id === scannable.requestId)

      // If no response found, mark as last page and continue
      if (!response) {
        scannable.setIsLastPage(true)
        return
      }

      // Update response items
      const responseData = JSON.parse(response.text)
      scannable.setItems(responseData)

      // Update isLastPage: if there is no Link header parsed, assume last page
      if (!response.link) scannable.setIsLastPage(true)
    })

    return true
  }

  private buildRequest(scannable: Scannable): CanvasRequest {
    switch (scannable.type) {
      case ScannableTypes.ANNOUNCEMENT:
        return new CanvasRequest(CanvasRequest.Get.Announcements, {
          courseId: this.courseId,
          page: scannable.page,
          perPage: 100,
        })

      case ScannableTypes.ASSIGNMENT:
        return new CanvasRequest(CanvasRequest.Get.Assignments, {
          courseId: this.courseId,
          page: scannable.page,
          perPage: 100,
        })

      case ScannableTypes.COURSE_NAV_LINK:
        return new CanvasRequest(CanvasRequest.Get.Tabs, { courseId: this.courseId, page: scannable.page, perPage: 100 })

      case ScannableTypes.DISCUSSION:
        return new CanvasRequest(CanvasRequest.Get.Discussions, {
          courseId: this.courseId,
          page: scannable.page,
          perPage: 100,
        })

      case ScannableTypes.FILE:
        return new CanvasRequest(CanvasRequest.Get.CourseFiles, {
          courseId: this.courseId,
          onlyNames: true,
          page: scannable.page,
          perPage: 100,
        })

      case ScannableTypes.MODULE:
        return new CanvasRequest(CanvasRequest.Get.Modules, {
          courseId: this.courseId,
          page: scannable.page,
          perPage: 100,
        })

      case ScannableTypes.MODULE_ITEM:
        return new CanvasRequest(CanvasRequest.Get.ModuleItems, {
          courseId: this.courseId,
          moduleId: scannable.id,
          page: scannable.page,
        })

      case ScannableTypes.PAGE:
        return new CanvasRequest(CanvasRequest.Get.Pages, {
          courseId: this.courseId,
          includeBody: true,
          page: scannable.page,
          perPage: 100,
        })

      default:
        throw new Error("Unhandled scannable type passed to request builder.")
    }
  }
}