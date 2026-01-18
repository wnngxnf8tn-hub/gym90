import React, { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ProgressRing } from "../components/ProgressRing";
import { CheckToggle } from "../components/CheckToggle";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenBackground } from "../components/ScreenBackground";
import { useReward } from "../components/RewardProvider";
import { GlassCard } from "../components/GlassCard";
import { useChallengeStore } from "../store/useChallengeStore";
import { useTheme } from "../theme/ThemeProvider";
import {
  getChallengeDayIndex,
  isWithinChallenge,
  todayIso,
  buildRange,
  getWeekStartIso,
  formatDisplayDate
} from "../utils/dates";
import { computeStreakUpToDate, hasAnyCheck, isRestDay, isWinDay } from "../utils/challenge";
import { createRng, pickWeighted } from "../utils/random";
import { STORAGE_KEYS } from "../utils/storageKeys";

const badgeTitles = [
  "Schwung",
  "Fokusmodus",
  "Disziplin",
  "Nerven aus Stahl",
  "Leise Stärke",
  "Keine Ausreden"
];

export const HomeScreen = () => {
  const theme = useTheme();
  const { triggerReward } = useReward();
  const {
    startDateIso,
    selectedDayIso,
    trainingDays,
    checksByDay,
    celebratedDays,
    claimedDays,
    perfectWeekAwarded,
    rewardQueue,
    ringDisplay,
    strictMode,
    uiVariant,
    pillEnabled,
    devSeed,
    lastKnownStreak,
    setChecksForDate,
    setSelectedDay,
    markCelebrated,
    markPerfectWeek,
    addBadge,
    setLastKnownStreak
  } = useChallengeStore();

  const today = todayIso();
  const dayIndex = getChallengeDayIndex(startDateIso, selectedDayIso);
  const ringMode = ringDisplay === "level" ? "day" : ringDisplay;
  const inChallenge = isWithinChallenge(startDateIso, selectedDayIso);
  const dayBeforeStart = dayIndex <= 0;
  const dayAfterEnd = dayIndex > 90;
  const isViewingToday = selectedDayIso === today;
  const [hasHydrated, setHasHydrated] = useState(useChallengeStore.persist.hasHydrated());
  const [hydrationStreak, setHydrationStreak] = useState<number | null>(null);

  const days = useMemo(() => buildRange(startDateIso, 90), [startDateIso]);
  const selectedChecks = checksByDay[selectedDayIso] || {
    sleep: false,
    nutrition: false,
    training: false,
    pill: false
  };
  const isRest = isRestDay(selectedDayIso, trainingDays);
  const alreadyCelebrated = Boolean(celebratedDays[selectedDayIso]);
  const alreadyClaimed = Boolean(claimedDays[selectedDayIso]);
  const alreadyQueued = rewardQueue.some((reward) => reward.dateIso === selectedDayIso);

  const completedDays = useMemo(() => {
    return days.filter((iso) => celebratedDays[iso]).length;
  }, [celebratedDays, days]);
  const hasCelebratedDays = completedDays > 0;

  const progress = Math.min(1, completedDays / 90);

  const ringLabel = useMemo(() => `Tag ${Math.min(dayIndex, 90)} von 90`, [dayIndex]);
  const streakUpToDateIso = selectedDayIso && selectedDayIso !== today ? selectedDayIso : today;
  const streakLabelPrefix = isViewingToday ? "Streak" : "Streak (Ansichtstag)";
  const currentStreak = useMemo(
    () => computeStreakUpToDate(celebratedDays, streakUpToDateIso),
    [celebratedDays, streakUpToDateIso]
  );
  const streakDisplayValue = hasHydrated
    ? hasCelebratedDays || lastKnownStreak !== null
      ? currentStreak
      : "—"
    : hydrationStreak ?? lastKnownStreak ?? "—";
  const ringSubLabel = useMemo(() => {
    const base = `${streakLabelPrefix}: ${streakDisplayValue}`;
    if (ringMode === "percent") {
      return `${base} \u00b7 Erledigt: ${completedDays}/90`;
    }
    return base;
  }, [ringMode, streakDisplayValue, completedDays, streakLabelPrefix]);

  useEffect(() => {
    if (!__DEV__) return;
    console.log("[HomeScreen] streak", {
      viewDate: selectedDayIso,
      today,
      completedDatesCount: completedDays,
      computedStreak: currentStreak
    });
  }, [selectedDayIso, today, completedDays, currentStreak]);

  useEffect(() => {
    if (useChallengeStore.persist.hasHydrated()) {
      setHasHydrated(true);
      return;
    }
    const unsubscribe = useChallengeStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (hasHydrated) return;
    let active = true;
    const loadHydrationStreak = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.challengeStore);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        const storedState = parsed?.state ?? parsed;
        const storedStreak = storedState?.lastKnownStreak;
        if (active && typeof storedStreak === "number") {
          setHydrationStreak(storedStreak);
        }
      } catch {
        return;
      }
    };
    loadHydrationStreak();
    return () => {
      active = false;
    };
  }, [hasHydrated]);

  useEffect(() => {
    if (!hasHydrated || !hasCelebratedDays) return;
    if (currentStreak === lastKnownStreak) return;
    setLastKnownStreak(currentStreak);
  }, [hasHydrated, hasCelebratedDays, currentStreak, lastKnownStreak, setLastKnownStreak]);

  const [snapTick, setSnapTick] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const canComplete = useMemo(() => {
    if (!inChallenge || dayBeforeStart || dayAfterEnd) return false;
    return hasAnyCheck(selectedChecks, uiVariant === "softPastel" && pillEnabled);
  }, [
    inChallenge,
    dayBeforeStart,
    dayAfterEnd,
    selectedDayIso,
    trainingDays,
    strictMode,
    selectedChecks,
    uiVariant,
    pillEnabled
  ]);

  const completeSelectedDay = async () => {
    if (!inChallenge || dayBeforeStart || dayAfterEnd || alreadyCelebrated) return;
    if (alreadyClaimed || alreadyQueued) return;

    if (!hasAnyCheck(selectedChecks, uiVariant === "softPastel" && pillEnabled)) {
      setError("Bitte mindestens einen Check setzen.");
      return;
    }

    const nextChecks = { ...selectedChecks };
    setChecksForDate(selectedDayIso, nextChecks);

    const nextChecksByDay = { ...checksByDay, [selectedDayIso]: nextChecks };
    const bonusDay = isRest && nextChecks.training;

    const weekStart = getWeekStartIso(selectedDayIso);
    const weekRange = buildRange(weekStart, 7);
    const weekComplete = weekRange.every((iso) => {
      if (!isWithinChallenge(startDateIso, iso)) return false;
      return isWinDay(
        iso,
        trainingDays,
        strictMode,
        uiVariant === "softPastel" && pillEnabled,
        nextChecksByDay[iso]
      );
    });
    const isPerfectWeek = weekComplete && !perfectWeekAwarded[weekStart];

    const rng = createRng(devSeed);

    const xpGain = isPerfectWeek ? 250 : bonusDay ? 150 : 100;

    let badgeTier: "common" | "rare" | "legendary" | null = null;
    const badgeChance = rng();
    const badgeThreshold = isPerfectWeek ? 0.45 : bonusDay ? 0.55 : 0.65;
    if (badgeChance > badgeThreshold) {
      badgeTier = pickWeighted(
        isPerfectWeek
          ? [
              { value: "common", weight: 50 },
              { value: "rare", weight: 32 },
              { value: "legendary", weight: 18 }
            ]
          : bonusDay
          ? [
              { value: "common", weight: 62 },
              { value: "rare", weight: 26 },
              { value: "legendary", weight: 12 }
            ]
          : [
              { value: "common", weight: 72 },
              { value: "rare", weight: 22 },
              { value: "legendary", weight: 6 }
            ],
        rng
      );
      if (badgeTier) {
        const title = badgeTitles[Math.floor(rng() * badgeTitles.length)];
        addBadge({
          id: `${Date.now()}-${Math.floor(rng() * 1000)}`,
          title,
          tier: badgeTier,
          dateIso: selectedDayIso
        });
      }
    }

    if (isPerfectWeek) {
      markPerfectWeek(weekStart);
    }

    markCelebrated(selectedDayIso);

    triggerReward({
      tier: isPerfectWeek ? "perfect" : bonusDay ? "bonus" : "normal",
      xpGain,
      badgeTier,
      isPillMode: uiVariant === "softPastel" && pillEnabled,
      pillChecked: nextChecks.pill,
      source: "completion",
      dateIso: selectedDayIso
    });
    setSnapTick((prev) => prev + 1);

    setError(null);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScreenBackground />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.display }]}>90 Tage</Text>
          <Text style={[styles.viewLabel, { color: theme.colors.muted }]}>
            Ansichtstag: {formatDisplayDate(selectedDayIso)}
          </Text>
          {!isViewingToday ? (
            <Pressable onPress={() => setSelectedDay(today)} style={[styles.viewChip, { borderColor: theme.colors.border }]}>
              <Text style={[styles.viewChipText, { color: theme.colors.text }]}>Heute</Text>
            </Pressable>
          ) : null}
        </View>

        <Pressable onPress={completeSelectedDay} disabled={!canComplete || alreadyCelebrated}>
          <ProgressRing
            progress={progress}
            label={ringLabel}
            subLabel={ringSubLabel}
            snapTrigger={snapTick}
          />
        </Pressable>

        {dayBeforeStart ? (
          <GlassCard style={styles.card}>
            <Text style={[styles.cardText, { color: theme.colors.muted }]}>
              Die Challenge startet am {formatDisplayDate(startDateIso)}.
            </Text>
          </GlassCard>
        ) : null}

        {dayAfterEnd ? (
          <GlassCard style={styles.card}>
            <Text style={[styles.cardText, { color: theme.colors.text }]}>Challenge beendet.</Text>
            <Text style={[styles.cardText, { color: theme.colors.muted }]}>Zur\u00fccksetzen in Einstellungen m\u00f6glich.</Text>
          </GlassCard>
        ) : null}

        <View style={styles.checks}>
          <CheckToggle
            label="Schlaf"
            value={selectedChecks.sleep}
            onToggle={() => setChecksForDate(selectedDayIso, { ...selectedChecks, sleep: !selectedChecks.sleep })}
          />
          <CheckToggle
            label="Ernährung"
            value={selectedChecks.nutrition}
            onToggle={() =>
              setChecksForDate(selectedDayIso, { ...selectedChecks, nutrition: !selectedChecks.nutrition })
            }
          />
          <CheckToggle
            label="Training"
            value={selectedChecks.training}
            onToggle={() => setChecksForDate(selectedDayIso, { ...selectedChecks, training: !selectedChecks.training })}
          />
          {uiVariant === "softPastel" && pillEnabled ? (
            <CheckToggle
              label="Pille"
              value={selectedChecks.pill}
              onToggle={() => setChecksForDate(selectedDayIso, { ...selectedChecks, pill: !selectedChecks.pill })}
            />
          ) : null}
        </View>

        <PrimaryButton
          label={
            alreadyCelebrated
              ? isViewingToday
                ? "Heute schon erledigt ✅"
                : "Tag schon erledigt ✅"
              : "Tag abgeschlossen"
          }
          onPress={completeSelectedDay}
          disabled={alreadyCelebrated || !canComplete}
          textColorDisabled={theme.variant === "premiumDark" || theme.variant === "gamifiedNeon" ? "#FFFFFF" : undefined}
        />

        {error ? <Text style={[styles.error, { color: theme.colors.warning }]}>{error}</Text> : null}
      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1
  },
  scroll: {
    padding: 24,
    alignItems: "center",
    gap: 20
  },
  header: {
    alignItems: "center",
    marginTop: 10,
    gap: 8
  },
  title: {
    fontSize: 32,
    fontWeight: "700"
  },
  checks: {
    width: "100%",
    gap: 12
  },
  viewLabel: {
    fontSize: 13,
    textAlign: "center"
  },
  viewChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "center"
  },
  viewChipText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4
  },
  card: {
    width: "100%",
    padding: 16,
    borderRadius: 16,
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2
  },
  cardText: {
    fontSize: 14
  },
  error: {
    marginTop: 8,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8
  }
});
