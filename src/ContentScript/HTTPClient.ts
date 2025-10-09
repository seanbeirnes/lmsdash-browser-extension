export class HTTPClient {
  private static async getCsrfToken(): Promise<string> {
    const cookie = await cookieStore.get({ name: "_csrf_token", url: document.location.href });
    if (!cookie || typeof cookie.value !== "string") {
      return "";
    }
    return decodeURIComponent(cookie.value);
  }

  static async get(url: string): Promise<Response> {
    const response = await fetch(url, {
      method: "GET",
      mode: "cors",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        "X-Csrf-Token": await this.getCsrfToken(),
      },
    });

    return response;
  }

  static async put(url: string, data: unknown): Promise<Response> {
    const response = await fetch(url, {
      method: "PUT",
      mode: "cors",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        "X-Csrf-Token": await this.getCsrfToken(),
      },
      body: JSON.stringify(data),
    });

    return response;
  }
}