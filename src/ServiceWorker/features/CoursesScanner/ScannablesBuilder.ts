import type { ScannableType } from "./Scannable"
import Scannable, { ScannableTypes } from "./Scannable"

export default class ScannablesBuilder {
  // Creates the starting array of scannables from a scannedItems array in scanSettings
  static build(scannedItems: ScannableType[]): Scannable[] {
    const scannables: Scannable[] = []

    if (scannedItems.includes(ScannableTypes.ANNOUNCEMENT)) {
      scannables.push(new Scannable(ScannableTypes.ANNOUNCEMENT))
    }

    if (scannedItems.includes(ScannableTypes.ASSIGNMENT)) {
      scannables.push(new Scannable(ScannableTypes.ASSIGNMENT))
    }

    if (scannedItems.includes(ScannableTypes.COURSE_NAV_LINK)) {
      scannables.push(new Scannable(ScannableTypes.COURSE_NAV_LINK))
    }

    if (scannedItems.includes(ScannableTypes.DISCUSSION)) {
      scannables.push(new Scannable(ScannableTypes.DISCUSSION))
    }

    if (scannedItems.includes(ScannableTypes.FILE)) {
      scannables.push(new Scannable(ScannableTypes.FILE))
    }

    if (scannedItems.includes(ScannableTypes.MODULE_LINK)) {
      // Make a MODULE type to find modules first
      scannables.push(new Scannable(ScannableTypes.MODULE))
    }

    if (scannedItems.includes(ScannableTypes.PAGE)) {
      scannables.push(new Scannable(ScannableTypes.PAGE))
    }

    if (scannedItems.includes(ScannableTypes.SYLLABUS)) {
      const syllabus = new Scannable(ScannableTypes.SYLLABUS)
      // Syllabus data should already be in courseScannerController.courseInfo,
      // Set as last page so it is scanned only once
      syllabus.setIsLastPage(true)
      scannables.push(syllabus)
    }

    return scannables
  }
}