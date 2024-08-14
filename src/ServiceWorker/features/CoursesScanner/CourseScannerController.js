import {CanvasRequest} from "../../../shared/models/CanvasRequest.js";
import Logger from "../../../shared/utils/Logger.js";
import CourseItemScanResult from "../../../shared/models/CourseItemScanResult.js";
import Scannable from "./Scannable.js";
import ScannablesBuilder from "./ScannablesBuilder.js";
import Requester from "./Requester.js";

export default class CourseScannerController
{
  constructor(courseId, scanSettings, coursesScanController)
  {
    this.courseId = courseId;
    this.scanSettings = scanSettings;
    this.coursesScanController = coursesScanController;
    this.results = {
      announcements: [],
      assignments: [],
      courseNavLinks: [],
      discussions: [],
      fileNames: [],
      moduleLinks: [],
      pages: [],
      syllabus: [],
    }
    this.courseInfo = null;
  }

  // Get the info of the course and update it to the class field
  async collectCourseInfo()
  {
    const response = await this.coursesScanController.sendCanvasRequests([
      new CanvasRequest(
        CanvasRequest.Get.Course,
        {courseId: this.courseId, syllabusBody: this.scanSettings.scannedItems.includes(Scannable.Type.SYLLABUS)})
    ])

    Logger.debug(__dirname, "Course info response: " + JSON.stringify(response))
    if(!response || !response[0] || !response[0].ok || !response[0].text) return false;

    this.courseInfo = JSON.parse(response[0].text);

    return true;
  }

  async scanCourseItems()
  {
    const scannables = ScannablesBuilder.build(this.scanSettings.scannedItems);
    Logger.debug(__dirname, "" + scannables.length + " Scannables: " + scannables.toString());
    const requester = new Requester(this.courseId, this.courseInfo, this.coursesScanController);

    while(scannables.length > 0 && this.coursesScanController.running)
    {
      // Make requests for each scannable, update items and update isLastPage
      const success = await requester.request(scannables);

      // Iterate backwards so new items can be added while old items can be removed
      for(let i = scannables.length - 1; i >= 0; i--)
      {
        const scannable = scannables[i];
        // If type "MODULE," create new Scannable of type "MODULE_ITEMS"
        if(scannable.type === Scannable.Type.MODULE)
        {
          scannable.items.forEach((module) =>
          {
            scannables.push(new Scannable(Scannable.Type.MODULE_ITEM, module["id"]));
          })
        }

        // Scan items in each scannable (except modules) AND add results to results

        console.log("TO DO: Scan Items");

        // Remove if isLastPage and update progress OR prepare for next iteration
        if(scannable.isLastPage)
        {
          scannables.splice(i, 1);

          // Increment progress once for all types except MODULE_ITEM
          if(scannable.type !== Scannable.Type.MODULE_ITEM) this.coursesScanController.incrementProgress();

          // Only increment progress for last MODULE_ITEM
          if(scannable.type === Scannable.Type.MODULE_ITEM && 0 > scannables.findIndex(
            (item) => item.type === Scannable.Type.MODULE_ITEM)
          ) this.coursesScanController.incrementProgress();

        } else
        {
          scannable.incrementPage();
          scannable.clearItems();
        }
      }
    }
  }

  async run()
  {
    // Prepare for course scan
    const hasCourseInfo = await this.collectCourseInfo();
    console.log("TO DO: Handle error when there is no course info returned");
    this.coursesScanController.updateProgressData(this.courseInfo["name"]);

    // Scan course
    await this.scanCourseItems();

    console.log("TO DO: Return scan results")
    return true;
  }
}