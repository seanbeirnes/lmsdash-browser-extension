import { CanvasAPIClient } from "./CanvasAPIClient";
import { CanvasRequest, CanvasRequestGet } from "../shared/models/CanvasRequest";
import { CanvasResponse } from "../shared/models/CanvasResponse";

export interface CanvasRequestParams {
  courseId?: number | string;
  page?: number;
  perPage?: number;
  syllabusBody?: boolean;
  onlyNames?: boolean;
  termId?: number | string;
  moduleId?: number | string;
  includeBody?: boolean;
  searchTerm?: string;
}

export interface CanvasRequestLike {
  id: string;
  type: CanvasRequestGet;
  params: CanvasRequestParams;
}

export class RequestHandler {
  private client: CanvasAPIClient;
  private queue: CanvasRequestLike[];

  constructor() {
    this.client = new CanvasAPIClient();
    this.queue = [];
  }

  enqueue(request: CanvasRequestLike): void {
    this.queue.push(request);
  }

  enqueueList(requests: CanvasRequestLike[]): void {
    requests.forEach((req) => this.enqueue(req));
  }

  // Returns a dictionary key/value pair of the link header if it is not null
  private parseLinkHeader(linkHeader: string | null): Record<string, string> | null {
    if (linkHeader == null) {
      return null;
    }

    const links: Record<string,string> = {};
    const list = linkHeader.split(",");

    list.forEach((link) => {
      const LINK_PATTERN = /^<([\\w\\/\\.&%?:\\-\\[\\]=]+)>;\\srel="(\\w+)"$/;
      const matches = link.match(LINK_PATTERN);
      if (matches && matches.length === 3) {
        links[matches[2]] = matches[1];
      }
    });

    if (Object.keys(links).length > 0) {
      return links;
    }

    return null;
  }

  async createRequest(request: CanvasRequestLike): Promise<any> {
    let response: Response | null = null;

    switch (request.type) {
      case CanvasRequest.Get.Announcements:
        response = await this.client.Get.Announcements(request.params.courseId!, request.params.page, request.params.perPage);
        break;

      case CanvasRequest.Get.Assignments:
        response = await this.client.Get.Assignments(request.params.courseId!, request.params.page, request.params.perPage);
        break;

      case CanvasRequest.Get.Course:
        response = await this.client.Get.Course(
          request.params.courseId!,
          request.params.syllabusBody ? request.params.syllabusBody : false
        );
        break;

      case CanvasRequest.Get.CourseFiles:
        response = await this.client.Get.CourseFiles(
          request.params.courseId!,
          typeof request.params.onlyNames === "boolean" ? request.params.onlyNames : true,
          request.params.page,
          request.params.perPage
        );
        break;

      case CanvasRequest.Get.CoursesUser:
        response = await this.client.Get.CoursesUser();
        break;

      case CanvasRequest.Get.CoursesByAdminSearch:
        response = await this.client.Get.CoursesByAdminSearch(
          request.params.searchTerm ?? "",
          request.params.page,
          request.params.perPage
        );
        break;

      case CanvasRequest.Get.CoursesByTermId:
        response = await this.client.Get.CoursesByTermId(
          request.params.termId!,
          request.params.page,
          request.params.perPage
        );
        break;

      case CanvasRequest.Get.CoursesAccount:
        response = await this.client.Get.CoursesAccount(request.params.page, request.params.perPage);
        break;

      case CanvasRequest.Get.Discussions:
        response = await this.client.Get.Discussions(request.params.courseId!, request.params.page, request.params.perPage);
        break;

      case CanvasRequest.Get.Modules:
        response = await this.client.Get.Modules(request.params.courseId!, request.params.page, request.params.perPage);
        break;

      case CanvasRequest.Get.ModuleItems:
        response = await this.client.Get.ModuleItems(request.params.courseId!, request.params.moduleId!, request.params.page);
        break;

      case CanvasRequest.Get.Pages:
        response = await this.client.Get.Pages(
          request.params.courseId!,
          request.params.includeBody ? request.params.includeBody : false,
          request.params.page,
          request.params.perPage
        );
        break;

      case CanvasRequest.Get.Tabs:
        response = await this.client.Get.Tabs(
          request.params.courseId!,
          request.params.page,
          request.params.perPage ? request.params.perPage : 10
        );
        break;

      case CanvasRequest.Get.TermsBySearch:
        response = await this.client.Get.TermsBySearch(
          request.params.searchTerm ?? "",
          request.params.page,
          request.params.perPage
        );
        break;

      case CanvasRequest.Get.UsersSelf:
        response = await this.client.Get.UsersSelf();
        break;

      default:
        console.error("Error: invalid canvas get request type passed to RequestHandler");
    }

    if (!response) {
      throw new Error("No response generated for request");
    }

    const linkHeader: string | null = response.headers.get("Link") ?? response.headers.get("link");

    return new CanvasResponse(
      request.id,
      await response.text(),
      response.bodyUsed,
      this.parseLinkHeader(linkHeader),
      response.ok,
      response.redirected,
      response.status,
      response.statusText,
      response.type
    );
  }

  async run(): Promise<any[]> {
    let responses: any[] = [];

    while (this.queue.length > 0) {
      // Build a request batch
      const batch: CanvasRequestLike[] = [];
      for (let i = 0; i < 25 && this.queue.length > 0; i++) {
        batch.push(this.queue[0]);
        this.queue.splice(0, 1);
      }

      const res = await Promise.all(batch.map(async (req) => await this.createRequest(req)));

      responses = responses.concat(res);
    }

    return responses;
  }
}