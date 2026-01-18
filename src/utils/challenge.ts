import { DailyChecks } from "../store/useChallengeStore";
import { addDaysIso, getChallengeDayIndex, getDayOfWeek, todayIso } from "./dates";

export const isRestDay = (iso: string, trainingDays: number[]) => {
  const day = getDayOfWeek(iso);
  return !trainingDays.includes(day);
};

export const getRequiredChecks = (
  iso: string,
  trainingDays: number[],
  strictMode: boolean,
  pillEnabled: boolean
) => {
  if (strictMode) {
    return (["sleep", "nutrition", "training", pillEnabled ? "pill" : null].filter(Boolean) ??
      []) as Array<keyof DailyChecks>;
  }
  const restDay = isRestDay(iso, trainingDays);
  if (restDay) {
    return (["sleep", "nutrition", pillEnabled ? "pill" : null].filter(Boolean) ??
      []) as Array<keyof DailyChecks>;
  }
  return (["sleep", "nutrition", "training", pillEnabled ? "pill" : null].filter(Boolean) ??
    []) as Array<keyof DailyChecks>;
};

export const isWinDay = (
  iso: string,
  trainingDays: number[],
  strictMode: boolean,
  pillEnabled: boolean,
  checks?: DailyChecks
) => {
  if (!checks) return false;
  return hasAnyCheck(checks, pillEnabled);
};

export const hasAnyCheck = (checks: DailyChecks | undefined, pillEnabled = true) => {
  if (!checks) return false;
  if (checks.sleep || checks.nutrition || checks.training) return true;
  return pillEnabled ? Boolean(checks.pill) : false;
};

export const areChecksComplete = (checks: DailyChecks | undefined) => {
  return hasAnyCheck(checks);
};

export const computeStreak = (
  completedDaysByDate: Record<string, boolean>,
  startDateIso: string,
  endDateIso: string
) => {
  if (!startDateIso || !endDateIso) return 0;
  if (getChallengeDayIndex(startDateIso, endDateIso) <= 0) return 0;
  let cursor = endDateIso;
  if (!completedDaysByDate[cursor]) {
    if (cursor !== todayIso()) return 0;
    const previousIso = addDaysIso(cursor, -1);
    if (getChallengeDayIndex(startDateIso, previousIso) <= 0) return 0;
    cursor = previousIso;
  }
  let streak = 0;
  while (completedDaysByDate[cursor]) {
    streak += 1;
    if (getChallengeDayIndex(startDateIso, cursor) <= 1) break;
    cursor = addDaysIso(cursor, -1);
  }
  return streak;
};

export const computeStreakUpToDate = (
  completedDaysByDate: Record<string, boolean>,
  upToDateIso: string
) => {
  if (!upToDateIso) return 0;
  let cursor = upToDateIso;
  if (!completedDaysByDate[cursor]) {
    if (cursor !== todayIso()) return 0;
    cursor = addDaysIso(cursor, -1);
  }
  let streak = 0;
  while (completedDaysByDate[cursor]) {
    streak += 1;
    cursor = addDaysIso(cursor, -1);
  }
  return streak;
};
