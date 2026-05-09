import { describe, expect, it } from "vitest";
import {
  formatCanvasDateTime,
  hasNativeTemporal,
  resolveEffectiveCanvasTimeZone,
  shiftCanvasDateTimeByDays,
} from "./temporalDateTime";

describe("temporalDateTime", () => {
  it("detects native Temporal support in the test runtime", () => {
    expect(hasNativeTemporal()).toBe(true);
  });

  it("prefers a valid user timezone over the course timezone", () => {
    expect(resolveEffectiveCanvasTimeZone("America/Denver", "America/Chicago")).toBe("America/Denver");
  });

  it("falls back to the course timezone when the user timezone is invalid", () => {
    expect(resolveEffectiveCanvasTimeZone("Invalid/Timezone", "America/Chicago")).toBe("America/Chicago");
  });

  it("shifts a Canvas datetime forward by whole days while preserving local time", () => {
    const shiftedDate = shiftCanvasDateTimeByDays("2026-03-10T17:00:00Z", "America/Denver", 3);

    expect(shiftedDate).toBe("2026-03-13T17:00:00Z");
    expect(formatCanvasDateTime(shiftedDate, "America/Denver")).toBe("Fri 3/13/2026, 11:00 AM");
  });

  it("shifts a Canvas datetime backward by whole days while preserving local time", () => {
    const shiftedDate = shiftCanvasDateTimeByDays("2026-03-10T17:00:00Z", "America/Denver", -2);

    expect(shiftedDate).toBe("2026-03-08T17:00:00Z");
    expect(formatCanvasDateTime(shiftedDate, "America/Denver")).toBe("Sun 3/8/2026, 11:00 AM");
  });
});
