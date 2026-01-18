import React, { useMemo } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useChallengeStore } from "../store/useChallengeStore";
import { useTheme } from "../theme/ThemeProvider";
import {
  buildRange,
  formatDisplayDate,
  getChallengeDayIndex,
  isWithinChallenge,
  todayIso
} from "../utils/dates";
import { isWinDay } from "../utils/challenge";
import { ScreenBackground } from "../components/ScreenBackground";
import { GlassCard } from "../components/GlassCard";

export const ProgressScreen = () => {
  const theme = useTheme();
  const {
    startDateIso,
    selectedDayIso,
    setSelectedDay,
    checksByDay,
    trainingDays,
    strictMode,
    uiVariant,
    pillEnabled
  } = useChallengeStore();
  const today = todayIso();
  const days = useMemo(() => buildRange(startDateIso, 90), [startDateIso]);

  const stats = useMemo(() => {
    const completed = days.filter((iso) =>
      isWinDay(iso, trainingDays, strictMode, uiVariant === "softPastel" && pillEnabled, checksByDay[iso])
    ).length;
    const remaining = Math.max(0, 90 - completed);
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i -= 1) {
      const iso = days[i];
      if (iso > today) continue;
      if (isWinDay(iso, trainingDays, strictMode, uiVariant === "softPastel" && pillEnabled, checksByDay[iso])) {
        streak += 1;
      } else {
        break;
      }
    }
    return { completed, remaining, streak };
  }, [days, trainingDays, strictMode, checksByDay, today]);

  const detailChecks = selectedDayIso ? checksByDay[selectedDayIso] : null;
  const selectedIndex = selectedDayIso ? getChallengeDayIndex(startDateIso, selectedDayIso) : null;
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScreenBackground />
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.display }]}>Fortschritt</Text>
        <Text style={[styles.subtitle, { color: theme.colors.muted }]}>90 Tage im Blick</Text>
      </View>

      <View style={styles.statsRow}>
        <GlassCard style={styles.statCard}>
          <Text style={[styles.statLabel, { color: theme.colors.muted }]}>Erledigt</Text>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.completed}</Text>
        </GlassCard>
        <GlassCard style={styles.statCard}>
          <Text style={[styles.statLabel, { color: theme.colors.muted }]}>Offen</Text>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.remaining}</Text>
        </GlassCard>
        <GlassCard style={styles.statCard}>
          <Text style={[styles.statLabel, { color: theme.colors.muted }]}>Streak</Text>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.streak}</Text>
        </GlassCard>
      </View>

      {selectedDayIso ? (
        <GlassCard style={styles.detailCard}>
          <Text style={[styles.detailTitle, { color: theme.colors.text }]}>
            Tag {selectedIndex} · {formatDisplayDate(selectedDayIso)}
          </Text>
          <Text style={[styles.detailText, { color: theme.colors.muted }]}>Schlaf: {detailChecks?.sleep ? "✓" : "–"}</Text>
          <Text style={[styles.detailText, { color: theme.colors.muted }]}>Ernährung: {detailChecks?.nutrition ? "✓" : "–"}</Text>
          <Text style={[styles.detailText, { color: theme.colors.muted }]}>Training: {detailChecks?.training ? "✓" : "–"}</Text>
          {uiVariant === "softPastel" && pillEnabled ? (
            <Text style={[styles.detailText, { color: theme.colors.muted }]}>Pille: {detailChecks?.pill ? "✓" : "–"}</Text>
          ) : null}
        </GlassCard>
      ) : null}

      <FlatList
        data={days}
        keyExtractor={(item) => item}
        numColumns={6}
        columnWrapperStyle={styles.rowGrid}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => {
          const win = isWinDay(item, trainingDays, strictMode, uiVariant === "softPastel" && pillEnabled, checksByDay[item]);
          const isActive = item === selectedDayIso;
          const inactive = !isWithinChallenge(startDateIso, item);
          return (
            <Pressable
              onPress={() => setSelectedDay(item)}
              style={[
                styles.tile,
                {
                  backgroundColor: isActive ? theme.colors.accentAlt : win ? theme.colors.accent : theme.colors.card,
                  borderColor: isActive ? theme.colors.accent : theme.colors.border,
                  opacity: inactive ? 0.5 : 1
                }
              ]}
            >
              <Text style={[styles.tileText, { color: isActive || win ? theme.colors.background : theme.colors.text }]}>
                {getChallengeDayIndex(startDateIso, item)}
              </Text>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1
  },
  header: {
    padding: 24
  },
  title: {
    fontSize: 28,
    fontWeight: "700"
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16
  },
  statLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8
  },
  statValue: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "700"
  },
  detailCard: {
    marginHorizontal: 24,
    marginTop: 16,
    padding: 14,
    borderRadius: 16
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: "600"
  },
  detailText: {
    marginTop: 6,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.7
  },
  grid: {
    padding: 24,
    paddingTop: 16
  },
  rowGrid: {
    justifyContent: "space-between",
    marginBottom: 10
  },
  tile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  tileText: {
    fontSize: 11,
    fontWeight: "600"
  }
});
