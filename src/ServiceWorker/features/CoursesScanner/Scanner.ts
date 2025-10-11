import CourseItemScanResult from "../../../shared/models/CourseItemScanResult"
import type { PreviewTuple } from "../../../shared/models/CourseItemScanResult"
import { ScannableTypes } from "./Scannable"
import type { ScannableType } from "./Scannable"
import Logger from "../../../shared/utils/Logger"
import { CourseItemTypes } from "../../../shared/models/CourseItem"
import type { CourseItemType } from "../../../shared/models/CourseItem"
import HTMLSanitizer from "../../../shared/utils/HTMLSanitizer"

type ScanSettings = {
  settings: string[]
  searchTerms: string[]
  lmsBaseUrl: string
}

type CourseInfo = Record<string, any>

type MutableScanProps = {
  type: CourseItemType
  id: number | string
  name: string
  url: string
  published: boolean
  text: string[]
  html: string[]
}

// A static class responsible for scanning scannable items
export default class Scanner {
  private static readonly maxPreviewLength = 75

  // Takes in scannable.items, scannable.type
  static scanItems(scannableItems: any[], itemType: ScannableType, scanSettings: ScanSettings, courseInfo: CourseInfo): CourseItemScanResult[] {
    const scanResults: CourseItemScanResult[] = []

    // Do not scan modules
    if (itemType === ScannableTypes.MODULE) return scanResults

    scannableItems.forEach((item) => {
      const result = Scanner.scan(item, itemType, scanSettings, courseInfo)
      if (result) scanResults.push(result)
    })

    Logger.debug(__dirname, "Scan Results: \n" + JSON.stringify(scanResults))

   return scanResults
  }

  static scan(item: any, type: ScannableType, scanSettings: ScanSettings, courseInfo: CourseInfo): CourseItemScanResult | null {
    // Only scan module links
    if (type === ScannableTypes.MODULE_ITEM && item["type"] !== "File" && item["type"] !== "ExternalUrl" && item["type"] !== "ExternalTool") return null

    // Prepare to scan
    const scanProperties = Scanner.getScanProperties(item, type, scanSettings.lmsBaseUrl, courseInfo)

    // If "only published items" setting, do not scan unpublished items
    if (scanSettings.settings.includes("only-published-items") && !scanProperties.published) return null

    // Scan
    const matches = new Set<string>()
    let previews: PreviewTuple[] = []

    scanProperties.text.forEach((text) => {
      const results = Scanner.scanText(text, scanSettings)
      results.matches.forEach((match) => matches.add(match))
      previews = previews.concat(results.previews)
    })

    scanProperties.html.forEach((html) => {
      const results = Scanner.scanHtml(html, scanSettings)
      results.matches.forEach((match) => matches.add(match))
      previews = previews.concat(results.previews)
    })

    // Return results
    if (matches.size === 0) return null // If no matches, return nothing

    return new CourseItemScanResult(
      scanProperties.type,
      scanProperties.id,
      scanProperties.name,
      scanProperties.url,
      scanProperties.published,
      Array.from(matches),
      previews
    )
  }

  private static getScanProperties(item: any, type: ScannableType, baseUrl: string, courseInfo: CourseInfo): MutableScanProps {
    const courseId = courseInfo["id"]

    const properties: MutableScanProps = {
      type: type,
      id: 0,
      name: "",
      url: "",
      published: false,
      text: [],
      html: [],
    }

    switch (type) {
      case ScannableTypes.ANNOUNCEMENT:
        properties.type = CourseItemTypes.ANNOUNCEMENT
        properties.id = item["id"]
        properties.name = item["title"]
        properties.url = item["html_url"]
        properties.published = item["published"]
        properties.text = [item["title"]]
        properties.html = [item["message"] === null ? "" : item["message"]]
        break

      case ScannableTypes.ASSIGNMENT:
        properties.type = CourseItemTypes.ASSIGNMENT
        properties.id = item["id"]
        properties.name = item["name"]
        properties.url = item["html_url"]
        properties.published = item["published"]
        properties.text = [item["name"]]
        properties.html = [item["description"] === null ? "" : item["description"]]
        break

      case ScannableTypes.COURSE_NAV_LINK:
        properties.type = CourseItemTypes.COURSE_NAV_LINK
        properties.id = item["id"]
        properties.name = item["label"]
        properties.url = item["full_url"]
        properties.published = item["hidden"] ? item["hidden"] : true
        properties.text = [item["label"]]
        properties.html = []
        break

      case ScannableTypes.DISCUSSION:
        properties.type = CourseItemTypes.DISCUSSION
        properties.id = item["id"]
        properties.name = item["title"]
        properties.url = item["html_url"]
        properties.published = item["published"]
        properties.text = [item["title"]]
        properties.html = [item["message"] === null ? "" : item["message"]]
        break

      case ScannableTypes.FILE:
        properties.type = CourseItemTypes.FILE
        properties.id = item["id"]
        properties.name = item["display_name"]
        properties.url = baseUrl + "/courses/" + courseId + "/files/" + item["id"]
        properties.published = true // Not technically a property for files, but use to make sure it is scanned
        properties.text = [item["display_name"]]
        properties.html = []
        break

      case ScannableTypes.MODULE_ITEM:
        properties.type = CourseItemTypes.MODULE_LINK
        properties.id = item["id"]
        properties.name = item["title"]
        properties.url = item["html_url"]
        properties.published = item["published"]
        properties.text = [item["title"]]
        properties.html = []
        if (item["type"] === "ExternalTool" || item["type"] === "ExternalUrl") properties.text.push(item["external_url"])
        break

      case ScannableTypes.PAGE:
        properties.type = CourseItemTypes.PAGE
        properties.id = item["page_id"]
        properties.name = item["title"]
        properties.url = item["html_url"]
        properties.published = item["published"]
        properties.text = [item["title"]]
        properties.html = [item["body"] === null ? "" : item["body"]]
        break

      case ScannableTypes.SYLLABUS:
        properties.type = CourseItemTypes.SYLLABUS
        properties.id = 1
        properties.name = "Syllabus"
        properties.url = baseUrl + "/courses/" + courseId + "/assignments/syllabus"
        properties.published = true
        properties.text = []
        properties.html = courseInfo["syllabus_body"] ? [courseInfo["syllabus_body"]] : []
        break
    }

    // Check if any properties are null
    // eslint-disable-next-line no-console
    if (properties.type === null || properties.id === null || properties.name === null || properties.url === null || properties.published === null) console.warn("Null property in scan properties")

    Logger.debug(__dirname, "Scan Properties: \n" + JSON.stringify(properties))

    return {
      type: properties.type as CourseItemType,
      id: properties.id as number | string,
      name: properties.name as string,
      url: properties.url as string,
      published: properties.published as boolean,
      text: properties.text,
      html: properties.html,
    }
  }

  // Scans plaintext
  private static scanText(text: string, scanSettings: ScanSettings): { matches: string[]; previews: PreviewTuple[] } {
    const isCaseSensitive = scanSettings.settings.includes("case-sensitive")
    const searchTerms = scanSettings.searchTerms

    const matches = new Set<string>() // Use set so there are no duplicates
    const previews: PreviewTuple[] = [] // Each preview follows pattern ["preview before", "match","preview after"]

    // Handle "case-sensitive" setting
    const scanText = isCaseSensitive ? text : text.toLowerCase()

    // Scan text for each searchTerm
    for (let i = 0; i < searchTerms.length; i++) {
      const searchTerm = searchTerms[i]
      if (!searchTerm) continue // Handle empty search term

      const scanTerm = isCaseSensitive ? searchTerm : searchTerm.toLowerCase()

      // Get index of string match
      const index = scanText.indexOf(scanTerm)

      // If no match, go to next loop iteration
      if (index < 0) continue

      // If match, create preview and add match
      matches.add(searchTerm)

      const maxPreviewLength = Scanner.maxPreviewLength
      const previewLeftStart = index - maxPreviewLength > 0 ? index - maxPreviewLength : 0
      const previewRightStart = index + searchTerm.length
      const previewRightEnd = previewRightStart + maxPreviewLength > text.length ? text.length : previewRightStart + maxPreviewLength
      let previewLeft = text.substring(previewLeftStart, index)
      let previewRight = text.substring(previewRightStart, previewRightEnd)
      if (previewLeftStart > 0) previewLeft = "..." + previewLeft
      if (previewRightStart < text.length) previewRight += "..."

      previews.push([previewLeft, text.substring(index, index + searchTerm.length), previewRight])
    }

    // Return results
    return { matches: Array.from(matches), previews }
  }

  // Scans html as plainText or parses HTML to scan only the text
  private static scanHtml(html: string, scanSettings: ScanSettings): { matches: string[]; previews: PreviewTuple[] } {
    const includeHtml = scanSettings.settings.includes("include-html")

    // If "include-html" setting, scan full html string like regular text
    if (includeHtml) return Scanner.scanText(html, scanSettings)

    // Remove html tags and scan text only
    return Scanner.scanText(HTMLSanitizer.sanitize(html), scanSettings)
  }
}