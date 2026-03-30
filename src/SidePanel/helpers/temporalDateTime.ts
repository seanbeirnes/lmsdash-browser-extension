type TemporalInstantLike = {
  toZonedDateTimeISO: (timeZone: string) => TemporalZonedDateTimeLike;
  toString: () => string;
};

type TemporalZonedDateTimeLike = {
  year: number;
  month: number;
  day: number;
  dayOfWeek: number;
  hour: number;
  minute: number;
  add: (durationLike: { days?: number }) => TemporalZonedDateTimeLike;
  toInstant: () => TemporalInstantLike;
};

type TemporalTimeZoneLike = unknown;

type TemporalGlobalLike = {
  Instant: {
    from: (value: string) => TemporalInstantLike;
  };
  TimeZone?: {
    from: (value: string) => TemporalTimeZoneLike;
  };
};

function getTemporal(): TemporalGlobalLike | null {
  const temporal = (globalThis as { Temporal?: TemporalGlobalLike }).Temporal;
  return temporal ?? null;
}

export function hasNativeTemporal(): boolean {
  const temporal = getTemporal();
  return Boolean(temporal && temporal.Instant);
}

function normalizeTimeZone(value: string | null | undefined): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

export function isValidTimeZone(timeZone: string | null | undefined): boolean {
  const normalizedTimeZone = normalizeTimeZone(timeZone);
  if (!normalizedTimeZone) return false;

  const temporal = getTemporal();
  if (!temporal) return false;

  try {
    if (temporal.TimeZone?.from) {
      temporal.TimeZone.from(normalizedTimeZone);
      return true;
    }

    const sampleInstant = temporal.Instant.from("2026-01-01T00:00:00Z");
    sampleInstant.toZonedDateTimeISO(normalizedTimeZone);
    return true;
  } catch {
    return false;
  }
}

export function resolveEffectiveCanvasTimeZone(userTimeZone: string | null | undefined, courseTimeZone: string | null | undefined): string {
  const normalizedUserTimeZone = normalizeTimeZone(userTimeZone);
  if (isValidTimeZone(normalizedUserTimeZone)) {
    return normalizedUserTimeZone;
  }

  const normalizedCourseTimeZone = normalizeTimeZone(courseTimeZone);
  if (isValidTimeZone(normalizedCourseTimeZone)) {
    return normalizedCourseTimeZone;
  }

  return "";
}

function toZonedDateTime(dateIsoUtc: string, timeZone: string): TemporalZonedDateTimeLike {
  const temporal = getTemporal();
  if (!temporal) {
    throw new Error("Temporal is not available in this browser.");
  }

  const instant = temporal.Instant.from(dateIsoUtc);
  return instant.toZonedDateTimeISO(timeZone);
}

export function formatCanvasDateTime(dateIsoUtc: string, timeZone: string): string {
  const zonedDateTime = toZonedDateTime(dateIsoUtc, timeZone);

  const weekdayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekdayLabel = weekdayNames[zonedDateTime.dayOfWeek - 1] ?? "";
  const hour12Value = zonedDateTime.hour % 12;
  const displayHour = hour12Value === 0 ? 12 : hour12Value;
  const displayMinute = String(zonedDateTime.minute).padStart(2, "0");
  const meridiem = zonedDateTime.hour >= 12 ? "PM" : "AM";

  return `${weekdayLabel} ${zonedDateTime.month}/${zonedDateTime.day}/${zonedDateTime.year}, ${displayHour}:${displayMinute} ${meridiem}`;
}

export function shiftCanvasDateTimeByDays(dateIsoUtc: string, timeZone: string, shiftDays: number): string {
  const zonedDateTime = toZonedDateTime(dateIsoUtc, timeZone);
  const shiftedDateTime = zonedDateTime.add({ days: shiftDays });
  return shiftedDateTime.toInstant().toString();
}
