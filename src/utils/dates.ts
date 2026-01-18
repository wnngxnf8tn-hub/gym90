export const toLocalIso = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const todayIso = () => toLocalIso(new Date());

export const parseIsoToDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDaysIso = (iso: string, delta: number) => {
  const date = parseIsoToDate(iso);
  date.setDate(date.getDate() + delta);
  return toLocalIso(date);
};

export const diffInDays = (fromIso: string, toIso: string) => {
  const from = parseIsoToDate(fromIso);
  const to = parseIsoToDate(toIso);
  const diff = to.getTime() - from.getTime();
  return Math.floor(diff / (24 * 60 * 60 * 1000));
};

export const getDayOfWeek = (iso: string) => {
  const date = parseIsoToDate(iso);
  const day = date.getDay();
  return day === 0 ? 7 : day;
};

export const formatDisplayDate = (iso: string) => {
  const date = parseIsoToDate(iso);
  return date.toLocaleDateString("de-DE", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

export const getWeekStartIso = (iso: string) => {
  const date = parseIsoToDate(iso);
  const day = getDayOfWeek(iso);
  date.setDate(date.getDate() - (day - 1));
  return toLocalIso(date);
};

export const getWeekEndIso = (iso: string) => {
  const date = parseIsoToDate(iso);
  const day = getDayOfWeek(iso);
  date.setDate(date.getDate() + (7 - day));
  return toLocalIso(date);
};

export const buildRange = (startIso: string, days: number) => {
  return Array.from({ length: days }, (_, idx) => addDaysIso(startIso, idx));
};

export const isWithinChallenge = (startIso: string, iso: string) => {
  const dayIndex = diffInDays(startIso, iso);
  return dayIndex >= 0 && dayIndex < 90;
};

export const getChallengeDayIndex = (startIso: string, iso: string) => {
  return diffInDays(startIso, iso) + 1;
};
