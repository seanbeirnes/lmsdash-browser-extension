import {Utils} from "../../../shared/utils/Utils.js";
import {Message} from "../../../shared/models/Message.js";
import {CanvasRequest} from "../../../shared/models/CanvasRequest.js";
import Logger from "../../../shared/utils/Logger.js";
import CourseScannerController from "./CourseScannerController.js";
import Task from "../../../shared/models/Task.js";
import Security from "../../../shared/utils/Security.js";

export default class CoursesScanController
{
  constructor(task, appController)
  {
    this.appController = appController;
    this.task = task;
    this.scanSettings = task.settingsData;
    this.coursesScanned = 0;
    this.totalCourses = 0;
    this.totalProgressSteps = 0;
    this.currentProgressStep = 0;
    this.running = false;
    this.courseScanResults = [];
    this.stopped = false;
  }

  start()
  {
    this.running = true;
    this.task.setProgressData(["Starting search..."]);
    this.#run();

    return true;
  }

  stop()
  {
    this.running = false;
    this.stopped = true;
    this.task.setProgressData(["Stopping search..."]);
  }

  async #run()
  {
    // If scan type is 'term', collect course ids
    this.task.setProgressData(["Gathering courses..."])
    if(this.scanSettings.scanType.includes("term")) await this.collectCourseIds()

    // Initialize totalProgressSteps and totalCourses fields
    this.#initTotalCourses();
    this.#initProgress();

    // for each course id, while running is true, scan coruse with that id
    for(let i = 0; i < this.scanSettings.courseIds.length; i++)
    {
      if(!this.running) break; // Check if scan was stopped

      const courseScanController = new CourseScannerController(
        this.scanSettings.courseIds[i],
        this.scanSettings,
        this,
      );

      this.incrementProgress();

      const scanResult = await courseScanController.run();

      // If scan results were found, add to the courseScanResults array
      if(scanResult.items.announcement.length ||
        scanResult.items.assignment.length ||
        scanResult.items.courseNavLink.length ||
        scanResult.items.discussion.length ||
        scanResult.items.file.length ||
        scanResult.items.moduleLink.length ||
        scanResult.items.page.length ||
        scanResult.items.syllabus.length) this.courseScanResults.push(scanResult);

      this.incrementCoursesScanned();
    }
    this.running = false

    // Update task with results and stop scan
    this.task.setStatus(this.stopped ? Task.status.failed : Task.status.complete)
    this.task.setTimeFinished();
    this.task.setProgressData(this.stopped ? ["Search stopped"] : ["Search Complete!",`Searched ${this.totalCourses} course(s)`]);
    this.task.setResultsData(this.courseScanResults);

    Logger.debug(__dirname, "Search Complete! \n" + this.task.toString());
  }

  async collectCourseIds()
  {
    let hasNextLink = true;
    let page = 1;
    const courseIds = []

    while(hasNextLink && this.running)
    {
      const response = await this.sendCanvasRequests([
        new CanvasRequest(CanvasRequest.Get.CoursesByTermId, {
          termId: this.scanSettings.scanType[1],
          page: page,
          perPage: 100
        })
      ])
      const responseData = JSON.parse(response[0].text)
      responseData.forEach((courseObj) => courseIds.push(courseObj["id"]))

      if(!response[0].link || !response[0].link.next) hasNextLink = false;

      page++
    }

    this.scanSettings.courseIds = courseIds;

    Logger.debug(__dirname, "Collected course IDs for searching: \n" + courseIds.toString());
  }

  async sendCanvasRequests(requests)
  {
    return await this.appController.messageHandler.sendCanvasRequests(requests);
  }

  incrementProgress()
  {
    this.currentProgressStep++;
    this.task.setProgress(
      Math.round((this.currentProgressStep / this.totalProgressSteps) * 100)
    );
    Logger.debug(__dirname, "Incremented task progress: \n" + this.task.toString());
  }

  updateProgressData(courseName)
  {
    this.task.setProgressData([
      `Searching course ${this.coursesScanned + 1} of ${this.totalCourses}`,
      `Searching items in course ${courseName}`
    ]);
  }

  #initProgress()
  {
    let stepsPerCourse = this.scanSettings.scannedItems.length; // Total types of items to scan
    // Account for an extra step to increment at the start of each course scan
    stepsPerCourse++
    this.totalProgressSteps = stepsPerCourse * this.scanSettings.courseIds.length;
  }

  incrementCoursesScanned()
  {
    this.coursesScanned++;
  }

  #initTotalCourses()
  {
    this.totalCourses = this.scanSettings.courseIds.length;
  }
}
