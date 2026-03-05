const EN_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const HE_BY_EN = {
  Sunday: "ראשון",
  Monday: "שני",
  Tuesday: "שלישי",
  Wednesday: "רביעי",
  Thursday: "חמישי",
  Friday: "שישי",
  Saturday: "שבת"
};

const EN_BY_HE = Object.fromEntries(Object.entries(HE_BY_EN).map(([en, he]) => [he, en]));
const EN_BY_LOWER = Object.fromEntries(EN_DAYS.map((day) => [day.toLowerCase(), day]));
const BAD_TEXT_ONLY_PATTERN = /^[?\uFFFD]+$/;
const DAY_INDEX_BY_EN = Object.fromEntries(EN_DAYS.map((day, index) => [day, index]));

export const normalizeDayToEnglish = (rawDay) => {
  if (typeof rawDay !== "string") {
    return null;
  }

  const day = rawDay.trim();
  if (!day) {
    return null;
  }

  if (EN_BY_LOWER[day.toLowerCase()]) {
    return EN_BY_LOWER[day.toLowerCase()];
  }

  if (EN_BY_HE[day]) {
    return EN_BY_HE[day];
  }

  return null;
};

export const localizeDayName = (rawDay, isHe) => {
  const normalized = normalizeDayToEnglish(rawDay);
  if (normalized) {
    return isHe ? HE_BY_EN[normalized] : normalized;
  }

  if (typeof rawDay === "string" && rawDay.trim()) {
    const cleaned = rawDay.trim();
    if (BAD_TEXT_ONLY_PATTERN.test(cleaned)) {
      return isHe ? "יום לא מזוהה" : "Unknown day";
    }
    return cleaned;
  }

  return isHe ? "יום לא זוהה" : "Day not set";
};

export const toDateInputValue = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const getWeekdayEnglishFromDateInput = (dateValue) => {
  if (!dateValue) {
    return null;
  }
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return EN_DAYS[date.getDay()] || null;
};

export const getNextDateForWeekday = (rawDay, fromDate = new Date()) => {
  const day = normalizeDayToEnglish(rawDay);
  if (!day) {
    return null;
  }

  const targetIndex = EN_DAYS.indexOf(day);
  if (targetIndex < 0) {
    return null;
  }

  const base = new Date(fromDate);
  base.setHours(0, 0, 0, 0);
  const offset = (targetIndex - base.getDay() + 7) % 7;
  base.setDate(base.getDate() + offset);
  return base;
};

const timeToMinutes = (value) => {
  if (typeof value !== "string") {
    return Number.POSITIVE_INFINITY;
  }
  const match = value.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) {
    return Number.POSITIVE_INFINITY;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return Number.POSITIVE_INFINITY;
  }
  return (hours * 60) + minutes;
};

export const sortAvailabilitySlotsByDayAndTime = (slots = []) => {
  if (!Array.isArray(slots)) {
    return [];
  }

  return [...slots].sort((a, b) => {
    const dayA = normalizeDayToEnglish(a?.day);
    const dayB = normalizeDayToEnglish(b?.day);
    const dayOrderA = dayA == null ? 999 : (DAY_INDEX_BY_EN[dayA] ?? 999);
    const dayOrderB = dayB == null ? 999 : (DAY_INDEX_BY_EN[dayB] ?? 999);
    if (dayOrderA !== dayOrderB) {
      return dayOrderA - dayOrderB;
    }

    const startOrderA = timeToMinutes(a?.startTime);
    const startOrderB = timeToMinutes(b?.startTime);
    if (startOrderA !== startOrderB) {
      return startOrderA - startOrderB;
    }

    const endOrderA = timeToMinutes(a?.endTime);
    const endOrderB = timeToMinutes(b?.endTime);
    if (endOrderA !== endOrderB) {
      return endOrderA - endOrderB;
    }

    return String(a?.id ?? "").localeCompare(String(b?.id ?? ""));
  });
};
