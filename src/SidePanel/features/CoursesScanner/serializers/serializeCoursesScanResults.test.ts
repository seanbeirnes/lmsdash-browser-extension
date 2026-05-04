import { describe, expect, it } from "vitest";
import serializeCoursesScanResults from "./serializeCoursesScanResults";
import { CourseItemTypes } from "../../../../shared/models/CourseItem";

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index++) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

describe("serializeCoursesScanResults", () => {
  it("serializes one row per matching item with repeated course fields", async () => {
    const csv = await serializeCoursesScanResults([
      {
        id: 42,
        name: "Course Alpha",
        courseCode: "ALPHA-101",
        sisCourseId: "SIS-42",
        published: true,
        url: "https://school.instructure.com/courses/42",
        items: {
          announcement: [],
          assignment: [
            {
              type: CourseItemTypes.ASSIGNMENT,
              id: 7,
              name: "Essay 1",
              url: "https://school.instructure.com/courses/42/assignments/7",
              published: false,
              matches: ["retired faculty name"],
              previews: [["Contact ", "retired faculty name", " for help"]],
            },
          ],
          courseNavLink: [],
          discussion: [],
          file: [],
          moduleLink: [],
          page: [
            {
              type: CourseItemTypes.PAGE,
              id: 9,
              name: "Homepage",
              url: "https://school.instructure.com/courses/42/pages/homepage",
              published: true,
              matches: ["old phone number"],
              previews: [["Call ", "old phone number", " to reach us"]],
            },
          ],
          syllabus: [],
        },
      },
    ]);

    const rows = csv.split("\n").map(parseCsvLine);
    expect(rows).toEqual([
      ["course_id", "course_name", "course_code", "course_sis_id", "course_published", "course_url", "type", "id", "name", "url", "published", "matches"],
      ["42", "Course Alpha", "ALPHA-101", "SIS-42", "TRUE", "https://school.instructure.com/courses/42", "assignment", "7", "Essay 1", "https://school.instructure.com/courses/42/assignments/7", "FALSE", "retired faculty name"],
      ["42", "Course Alpha", "ALPHA-101", "SIS-42", "TRUE", "https://school.instructure.com/courses/42", "page", "9", "Homepage", "https://school.instructure.com/courses/42/pages/homepage", "TRUE", "old phone number"],
    ]);
  });

  it("serializes the matches column as matched terms, not preview tuples", async () => {
    const csv = await serializeCoursesScanResults([
      {
        id: 1,
        name: "Course, \"Quoted\"",
        courseCode: "CODE,1",
        sisCourseId: null,
        published: false,
        url: null,
        items: {
          announcement: [],
          assignment: [],
          courseNavLink: [],
          discussion: [],
          file: [],
          moduleLink: [],
          page: [
            {
              type: CourseItemTypes.PAGE,
              id: 9,
              name: "Page, \"Home\"",
              url: null,
              published: true,
              matches: ["term,one", 'term "two"'],
              previews: [
                ["before ", "term,one", " after"],
                ["left ", 'term "two"', " right"],
              ],
            },
          ],
          syllabus: [],
        },
      },
    ]);

    const rows = csv.split("\n").map(parseCsvLine);
    expect(rows[1]).toEqual([
      "1",
      'Course, "Quoted"',
      "CODE,1",
      "",
      "FALSE",
      "",
      "page",
      "9",
      'Page, "Home"',
      "",
      "TRUE",
      'term,one, term "two"',
    ]);
  });

  it("uses N/A for syllabus item ids", async () => {
    const csv = await serializeCoursesScanResults([
      {
        id: 9,
        name: "Course",
        courseCode: null,
        sisCourseId: null,
        published: true,
        url: null,
        items: {
          announcement: [],
          assignment: [],
          courseNavLink: [],
          discussion: [],
          file: [],
          moduleLink: [],
          page: [],
          syllabus: [
            {
              type: CourseItemTypes.SYLLABUS,
              id: 999,
              name: "Syllabus",
              url: null,
              published: true,
              matches: ["obsolete office hours"],
              previews: [["See ", "obsolete office hours", " in this section"]],
            },
          ],
        },
      },
    ]);

    const rows = csv.split("\n").map(parseCsvLine);
    expect(rows[1][7]).toBe("N/A");
    expect(rows[1][11]).toBe("obsolete office hours");
  });
});
