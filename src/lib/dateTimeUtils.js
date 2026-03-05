const TIME_ONLY_PATTERN = /^(\d{2}):(\d{2})(?::(\d{2}))?$/;

export const isValidDate = (value) => value instanceof Date && !Number.isNaN(value.getTime());

const withTimeOnBaseDate = (timeString, baseDate) => {
  const match = String(timeString || "").trim().match(TIME_ONLY_PATTERN);
  if (!match) {
    return null;
  }
  const [, hh, mm, ss] = match;
  const date = isValidDate(baseDate) ? new Date(baseDate) : new Date();
  date.setHours(Number(hh), Number(mm), Number(ss || 0), 0);
  return isValidDate(date) ? date : null;
};

const fromDatePartsObject = (value) => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const year = Number(value.year);
  const month = Number(value.monthValue ?? value.month);
  const day = Number(value.dayOfMonth ?? value.day);
  const hour = Number(value.hour ?? 0);
  const minute = Number(value.minute ?? 0);
  const second = Number(value.second ?? 0);
  const millisecond = Math.floor(Number(value.nano ?? 0) / 1_000_000);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }

  const date = new Date(year, month - 1, day, hour, minute, second, millisecond);
  return isValidDate(date) ? date : null;
};

const fromDatePartsArray = (value) => {
  if (!Array.isArray(value) || value.length < 3) {
    return null;
  }

  const [
    year,
    month,
    day,
    hour = 0,
    minute = 0,
    second = 0,
    nano = 0
  ] = value.map(Number);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }

  const millisecond = Math.floor((Number.isFinite(nano) ? nano : 0) / 1_000_000);
  const date = new Date(year, month - 1, day, hour, minute, second, millisecond);
  return isValidDate(date) ? date : null;
};

export const parseFlexibleDate = (value, baseDate = null) => {
  if (value == null || value === "") {
    return null;
  }

  if (value instanceof Date) {
    return isValidDate(value) ? value : null;
  }

  if (typeof value === "number") {
    const date = new Date(value);
    return isValidDate(date) ? date : null;
  }

  if (Array.isArray(value)) {
    return fromDatePartsArray(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const nativeParsed = new Date(trimmed);
    if (isValidDate(nativeParsed)) {
      return nativeParsed;
    }

    return withTimeOnBaseDate(trimmed, baseDate);
  }

  if (typeof value === "object") {
    return fromDatePartsObject(value);
  }

  return null;
};

export const resolveLessonDateFromRequest = (request) => {
  const requestedAt = parseFlexibleDate(request?.requestedAt);
  return (
    parseFlexibleDate(request?.lessonDateTime, requestedAt) ||
    parseFlexibleDate(request?.requestedSlot?.specificStartTime, requestedAt) ||
    null
  );
};
