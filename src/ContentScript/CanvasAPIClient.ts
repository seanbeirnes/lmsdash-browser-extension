import { HTTPClient } from "./HTTPClient";

export class CanvasAPIClient {
  public Get: typeof GetRequests;
  public Put: typeof PutRequests;

  constructor() {
    this.Get = GetRequests;
    this.Put = PutRequests;
  }

  static formatURL(url: string): string {
    const baseURL = "https://" + document.location.host;
    return baseURL + "/api/v1" + url;
  }
}

class GetRequests {
  static async Announcements(courseId: number | string, page: number = 1, perPage: number = 10): Promise<Response> {
    return await HTTPClient.get(
      CanvasAPIClient.formatURL(`/courses/${courseId}/discussion_topics?only_announcements=true&page=${page}&per_page=${perPage}`)
    );
  }

  static async Assignments(courseId: number | string, page: number = 1, perPage: number = 10): Promise<Response> {
    return await HTTPClient.get(
      CanvasAPIClient.formatURL(`/courses/${courseId}/assignments?page=${page}&per_page=${perPage}`)
    );
  }

  static async Course(courseId: number | string, syllabusBody: boolean = false): Promise<Response> {
    return await HTTPClient.get(
      CanvasAPIClient.formatURL(`/courses/${courseId}${syllabusBody ? "/?include[]=syllabus_body" : ""}`)
    );
  }

  static async CourseFiles(courseId: number | string, onlyNames: boolean = true, page: number = 1, perPage: number = 1): Promise<Response> {
    return await HTTPClient.get(
      CanvasAPIClient.formatURL(`/courses/${courseId}/files?${onlyNames ? "only[]=names&" : ""}page=${page}&per_page=${perPage}`)
    );
  }

  static async CoursesUser(): Promise<Response> {
    return await HTTPClient.get(
      CanvasAPIClient.formatURL("/courses?per_page=100")
    );
  }

  static async CoursesByAdminSearch(searchTerm: string, page: number = 1, perPage: number = 10): Promise<Response> {
    return await HTTPClient.get(
      CanvasAPIClient.formatURL(`/accounts/1/courses?search_term=${searchTerm}&page=${page}&per_page=${perPage}`)
    );
  }

  static async CoursesByTermId(termId: number | string, page: number = 1, perPage: number = 10): Promise<Response> {
    return await HTTPClient.get(
      CanvasAPIClient.formatURL(`/accounts/1/courses?enrollment_term_id=${termId}&page=${page}&per_page=${perPage}`)
    );
  }

  static async CoursesAccount(page: number = 1, perPage: number = 10): Promise<Response> {
    return await HTTPClient.get(
      CanvasAPIClient.formatURL(`/accounts/1/courses?page=${page}&per_page=${perPage}`)
    );
  }

  static async Discussions(courseId: number | string, page: number = 1, perPage: number = 10): Promise<Response> {
    return await HTTPClient.get(
      CanvasAPIClient.formatURL(`/courses/${courseId}/discussion_topics?page=${page}&per_page=${perPage}`)
    );
  }

  static async Modules(courseId: number | string, page: number = 1, perPage: number = 10): Promise<Response> {
    return await HTTPClient.get(
      CanvasAPIClient.formatURL(`/courses/${courseId}/modules?page=${page}&per_page=${perPage}`)
    );
  }

  static async ModuleItems(courseId: number | string, moduleId: number | string, page: number = 1): Promise<Response> {
    return HTTPClient.get(
      CanvasAPIClient.formatURL(`/courses/${courseId}/modules/${moduleId}/items?page=${page}&per_page=100`)
    );
  }

  static async Pages(courseId: number | string, includeBody: boolean = false, page: number = 1, perPage: number = 10): Promise<Response> {
    return await HTTPClient.get(
      CanvasAPIClient.formatURL(`/courses/${courseId}/pages?${includeBody ? "include[]=body&" : ""}page=${page}&per_page=${perPage}`)
    );
  }

  static async Tabs(courseId: number | string, page: number = 1, perPage: number = 10): Promise<Response> {
    return await HTTPClient.get(
      CanvasAPIClient.formatURL(`/courses/${courseId}/tabs?page=${page}&per_page=${perPage}`)
    );
  }

  static async TermsBySearch(searchTerm: string, page: number = 1, perPage: number = 10): Promise<Response> {
    return await HTTPClient.get(
      CanvasAPIClient.formatURL(`/accounts/1/terms?term_name=${searchTerm}&page=${page}&per_page=${perPage}`)
    );
  }

  static async UsersSelf(): Promise<Response> {
    return await HTTPClient.get(
      CanvasAPIClient.formatURL("/users/self")
    );
  }
}

class PutRequests {
  static async Announcement(courseId: number | string, announcementId: number | string, delayedPostAt: string): Promise<Response> {
    return await HTTPClient.put(
      CanvasAPIClient.formatURL(`/courses/${courseId}/discussion_topics/${announcementId}`),
      { delayed_post_at: delayedPostAt }
    );
  }
}
