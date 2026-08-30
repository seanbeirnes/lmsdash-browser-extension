import { describe, expect, it } from "vitest";
import { RequestHandler } from "./RequestHandler";

type LinkParser = (linkHeader: string | null) => Record<string, string> | null;

const parseLinkHeader = (linkHeader: string | null): Record<string, string> | null => {
  const handler = new RequestHandler();
  const parser = Reflect.get(handler, "parseLinkHeader") as LinkParser;

  return parser.call(handler, linkHeader);
};

describe("RequestHandler link header parsing", () => {
  it("parses every link in a Canvas pagination header", () => {
    const linkHeader = [
      '<https://school.instructure.com/api/v1/accounts/1/courses?enrollment_term_id=42&page=1&per_page=100>; rel="current"',
      '<https://school.instructure.com/api/v1/accounts/1/courses?enrollment_term_id=42&page=2&per_page=100>; rel="next"',
      '<https://school.instructure.com/api/v1/accounts/1/courses?enrollment_term_id=42&page=1&per_page=100>; rel="first"',
      '<https://school.instructure.com/api/v1/accounts/1/courses?enrollment_term_id=42&page=5&per_page=100>; rel="last"',
    ].join(", ");

    expect(parseLinkHeader(linkHeader)).toEqual({
      current: "https://school.instructure.com/api/v1/accounts/1/courses?enrollment_term_id=42&page=1&per_page=100",
      next: "https://school.instructure.com/api/v1/accounts/1/courses?enrollment_term_id=42&page=2&per_page=100",
      first: "https://school.instructure.com/api/v1/accounts/1/courses?enrollment_term_id=42&page=1&per_page=100",
      last: "https://school.instructure.com/api/v1/accounts/1/courses?enrollment_term_id=42&page=5&per_page=100",
    });
  });

  it("parses a single link", () => {
    expect(parseLinkHeader('<https://school.instructure.com/api/v1/courses?page=1>; rel="current"')).toEqual({
      current: "https://school.instructure.com/api/v1/courses?page=1",
    });
  });

  it("tolerates RFC 8288 whitespace around the semicolon and unquoted rel values", () => {
    const linkHeader = [
      '<https://school.instructure.com/api/v1/courses?page=1> ; rel="current"',
      '<https://school.instructure.com/api/v1/courses?page=2>;rel="next"',
      "<https://school.instructure.com/api/v1/courses?page=1> ; rel=first",
    ].join(", ");

    expect(parseLinkHeader(linkHeader)).toEqual({
      current: "https://school.instructure.com/api/v1/courses?page=1",
      next: "https://school.instructure.com/api/v1/courses?page=2",
      first: "https://school.instructure.com/api/v1/courses?page=1",
    });
  });

  it("keeps the first occurrence when a rel value is duplicated", () => {
    const linkHeader = [
      '<https://school.instructure.com/api/v1/courses?page=2>; rel="next"',
      '<https://school.instructure.com/api/v1/courses?page=9>; rel="next"',
    ].join(", ");

    expect(parseLinkHeader(linkHeader)).toEqual({
      next: "https://school.instructure.com/api/v1/courses?page=2",
    });
  });

  it("returns null when the Link header is missing or malformed", () => {
    expect(parseLinkHeader(null)).toBeNull();
    expect(parseLinkHeader("")).toBeNull();
    expect(parseLinkHeader("not a Link header")).toBeNull();
  });
});
