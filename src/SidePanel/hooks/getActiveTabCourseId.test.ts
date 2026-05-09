import { describe, expect, it } from "vitest";
import getActiveTabCourseId from "./getActiveTabCourseId";

describe("getActiveTabCourseId", () => {
  it("extracts the course id from a Canvas course page URL", () => {
    expect(getActiveTabCourseId({ url: "https://school.instructure.com/courses/12345" } as chrome.tabs.Tab)).toBe("12345");
  });

  it("extracts the course id when the user is on a nested course resource", () => {
    expect(getActiveTabCourseId({ url: "https://school.instructure.com/courses/9876/assignments/55" } as chrome.tabs.Tab)).toBe("9876");
  });

  it("returns null for a Canvas page that is not scoped to a course", () => {
    expect(getActiveTabCourseId({ url: "https://school.instructure.com/calendar" } as chrome.tabs.Tab)).toBeNull();
  });

  it("returns null when there is no active tab", () => {
    expect(getActiveTabCourseId(null as unknown as chrome.tabs.Tab)).toBeNull();
  });
});
