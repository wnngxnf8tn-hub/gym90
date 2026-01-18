import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Slider from "@react-native-community/slider";
import { useChallengeStore } from "../store/useChallengeStore";
import { useTheme } from "../theme/ThemeProvider";
import { formatDisplayDate, parseIsoToDate, todayIso, toLocalIso } from "../utils/dates";
import { requestNotificationPermission, scheduleDailyReminder, cancelAllReminders } from "../utils/notifications";
import { ScreenBackground } from "../components/ScreenBackground";
import { useReward } from "../components/RewardProvider";
import { RewardEffect } from "../utils/rewardEngine";
import { skiaEffectNames } from "../components/rewards/SkiaEffects/registry";
import { GlassCard } from "../components/GlassCard";
import { useNavigation } from "@react-navigation/native";

const dayLabels = [
  { id: 1, label: "Mo" },
  { id: 2, label: "Di" },
  { id: 3, label: "Mi" },
  { id: 4, label: "Do" },
  { id: 5, label: "Fr" },
  { id: 6, label: "Sa" },
  { id: 7, label: "So" }
];

const premiumLabels: Record<string, string> = {
  matrixRainDepthSweep: "Matrix-Regen Tiefe",
  glitchScanlineSweep: "Glitch-Scanline",
  neonWireframeGridWarp: "Neon-Drahtgitter",
  terminalTypewriterBurst: "Terminal-Schreibmaschine",
  digitalNoiseDissolve: "Digitalrauschen",
  pixelSortSwipe: "Pixel-Sortierung",
  hologramFlicker: "Hologramm-Flackern",
  dataStreamRibbons: "Datenstrom-B\u00e4nder",
  metaballBlobMorph: "Metaball-Blob-Morph",
  metaballTypographyReveal: "Metaball-Typo"
};

export const SettingsScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { triggerReward } = useReward();
  const [previewEffect, setPreviewEffect] = useState<RewardEffect | null>(null);
  const {
    startDateIso,
    selectedDayIso,
    trainingDays,
    uiVariant,
    ringDisplay,
    pillEnabled,
    girlfriendModeFreche,
    reminderTime,
    reminderEnabled,
    soundEnabled,
    extraHaptics,
    hapticsIntensity,
    hapticsDuration,
    strictMode,
    devSeed,
    showRewardDebug,
    recentRewardEffects,
    premiumEffectsEnabled,
    rewardDiagnostics,
    setPremiumEffectEnabled,
    setStartDate,
    setSelectedDay,
    setTrainingDays,
    setUiVariant,
    setRingDisplay,
    setPillEnabled,
    setGirlfriendModeFreche,
    setReminderTime,
    setReminderEnabled,
    setSoundEnabled,
    setExtraHaptics,
    setHapticsIntensity,
    setHapticsDuration,
    setStrictMode,
    setDevSeed,
    setShowRewardDebug,
    resetChallenge
  } = useChallengeStore();

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showSelectedPicker, setShowSelectedPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isIos = Platform.OS === "ios";
  const ringDisplayMode = ringDisplay === "level" ? "day" : ringDisplay;

  const reminderLabel = useMemo(() => {
    const hour = String(reminderTime.hour).padStart(2, "0");
    const minute = String(reminderTime.minute).padStart(2, "0");
    return `${hour}:${minute}`;
  }, [reminderTime]);

  const registeredEffects = skiaEffectNames as RewardEffect[];
  const enabledRegisteredEffects = useMemo(
    () => registeredEffects.filter((effect) => premiumEffectsEnabled[effect] !== false),
    [premiumEffectsEnabled, registeredEffects]
  );
  const notRegisteredEffects = useMemo(() => {
    const registeredSet = new Set(registeredEffects);
    return Object.keys(premiumEffectsEnabled).filter((effect) => !registeredSet.has(effect as RewardEffect));
  }, [premiumEffectsEnabled, registeredEffects]);
  const disabledEffects = useMemo(
    () => registeredEffects.filter((effect) => premiumEffectsEnabled[effect] === false),
    [premiumEffectsEnabled, registeredEffects]
  );

  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 1200);
  };

  const toggleReminder = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setReminderEnabled(false);
        return;
      }
      await scheduleDailyReminder(reminderTime.hour, reminderTime.minute);
      setReminderEnabled(true);
      showToast("Gespeichert");
    } else {
      await cancelAllReminders();
      setReminderEnabled(false);
      showToast("Gespeichert");
    }
  };

  const updateReminderTime = async (date: Date) => {
    const nextTime = { hour: date.getHours(), minute: date.getMinutes() };
    setReminderTime(nextTime);
    if (reminderEnabled) {
      await scheduleDailyReminder(nextTime.hour, nextTime.minute);
    }
    showToast("Gespeichert");
  };

  const toggleTrainingDay = (id: number) => {
    const next = trainingDays.includes(id)
      ? trainingDays.filter((day) => day !== id)
      : [...trainingDays, id].sort();
    setTrainingDays(next);
  };

  const startDate = parseIsoToDate(startDateIso);
  const selectedDate = parseIsoToDate(selectedDayIso);
  const today = todayIso();

  const runDevReward = () => {
    triggerReward({
      tier: "normal",
      xpGain: 100,
      badgeTier: null,
      isPillMode: uiVariant === "softPastel" && pillEnabled,
      pillChecked: true,
      source: "dev"
    });
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      <ScreenBackground />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.typography.display }]}>Einstellungen</Text>
          <Pressable
            onPress={() => setShowSelectedPicker(true)}
            style={[styles.dateButton, { borderColor: theme.colors.border }]}
          >
            <Text style={[styles.dateLabel, { color: theme.colors.muted }]}>Datum</Text>
            <Text style={[styles.dateValue, { color: theme.colors.text }]}>{formatDisplayDate(selectedDayIso)}</Text>
          </Pressable>
        </View>

        {toastMessage ? <Text style={[styles.toast, { color: theme.colors.text }]}>{toastMessage}</Text> : null}

        <GlassCard style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Startdatum</Text>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.colors.muted }]}>Aktuell</Text>
            <Pressable onPress={() => setShowStartPicker(true)}>
              <Text style={[styles.rowValue, { color: theme.colors.text }]}>{formatDisplayDate(startDateIso)}</Text>
            </Pressable>
          </View>
          <Pressable
            onPress={() => {
              setStartDate(today);
              showToast("Gespeichert");
            }}
            style={styles.actionButton}
          >
            <Text style={[styles.actionText, { color: theme.colors.accent }]}>Heute setzen</Text>
          </Pressable>
        </GlassCard>

        <GlassCard style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Ansichtstag</Text>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.colors.muted }]}>Aktuell</Text>
            <Pressable onPress={() => setShowSelectedPicker(true)}>
              <Text style={[styles.rowValue, { color: theme.colors.text }]}>{formatDisplayDate(selectedDayIso)}</Text>
            </Pressable>
          </View>
          <Pressable
            onPress={() => {
              setSelectedDay(today);
              showToast("Gespeichert");
            }}
            style={styles.actionButton}
          >
            <Text style={[styles.actionText, { color: theme.colors.accent }]}>Heute</Text>
          </Pressable>
        </GlassCard>

        <GlassCard style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Erinnerung</Text>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.colors.muted }]}>Aktiv</Text>
            <Switch value={reminderEnabled} onValueChange={toggleReminder} />
          </View>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.colors.muted }]}>Uhrzeit</Text>
            <Pressable onPress={() => setShowTimePicker(true)}>
              <Text style={[styles.rowValue, { color: theme.colors.text }]}>{reminderLabel}</Text>
            </Pressable>
          </View>
        </GlassCard>

        <GlassCard style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>UI-Stil</Text>
          <View style={styles.chipRow}>
            {([
              { id: "premiumDark", label: "Premium" },
              { id: "minimalLight", label: "Minimal" },
              { id: "gamifiedNeon", label: "Neon" },
              { id: "softPastel", label: "Soft-Pastell" }
            ] as const).map((option) => (
              <Pressable
                key={option.id}
                onPress={() => setUiVariant(option.id)}
                style={[
                  styles.chip,
                  {
                    borderColor: uiVariant === option.id ? theme.colors.accent : theme.colors.border,
                    backgroundColor: uiVariant === option.id ? theme.colors.cardAlt : "transparent"
                  }
                ]}
              >
                <Text style={[styles.chipText, { color: theme.colors.text }]}>{option.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 16 }]}>Ring-Anzeige</Text>
          <View style={styles.chipRow}>
            {([
              { id: "day", label: "Tag" },
              { id: "percent", label: "Erledigt" }
            ] as const).map((option) => (
              <Pressable
                key={option.id}
                onPress={() => setRingDisplay(option.id)}
                style={[
                  styles.chip,
                  {
                    borderColor: ringDisplayMode === option.id ? theme.colors.accent : theme.colors.border,
                    backgroundColor: ringDisplayMode === option.id ? theme.colors.cardAlt : "transparent"
                  }
                ]}
              >
                <Text style={[styles.chipText, { color: theme.colors.text }]}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </GlassCard>

        <GlassCard style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Haptik</Text>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.colors.muted }]}>Extra-Haptik</Text>
            <Switch value={extraHaptics} onValueChange={setExtraHaptics} />
          </View>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.colors.muted }]}>Intensität</Text>
            <View style={styles.chipRow}>
              {([
                { id: "low", label: "Niedrig" },
                { id: "medium", label: "Mittel" },
                { id: "high", label: "Hoch" }
              ] as const).map((option) => (
                <Pressable
                  key={option.id}
                  onPress={() => setHapticsIntensity(option.id)}
                  style={[
                    styles.chip,
                    {
                      borderColor: hapticsIntensity === option.id ? theme.colors.accent : theme.colors.border,
                      backgroundColor: hapticsIntensity === option.id ? theme.colors.cardAlt : "transparent"
                    }
                  ]}
                >
                  <Text style={[styles.chipText, { color: theme.colors.text }]}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <Text style={[styles.rowLabel, { color: theme.colors.muted, marginTop: 10 }]}>Dauer (ms)</Text>
          <Slider
            minimumValue={5000}
            maximumValue={9000}
            step={250}
            value={hapticsDuration}
            onValueChange={setHapticsDuration}
            minimumTrackTintColor={theme.colors.accent}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.accent}
          />
          <Text style={[styles.sliderValue, { color: theme.colors.text }]}>{hapticsDuration} ms</Text>
        </GlassCard>

        <GlassCard style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Regeln</Text>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.colors.muted }]}>Strenger Modus</Text>
            <Switch value={strictMode} onValueChange={setStrictMode} />
          </View>
          {uiVariant === "softPastel" ? (
            <>
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: theme.colors.muted }]}>Pille anzeigen</Text>
                <Switch value={pillEnabled} onValueChange={setPillEnabled} />
              </View>
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: theme.colors.muted }]}>Freundin-Mode: freche Texte</Text>
                <Switch value={girlfriendModeFreche} onValueChange={setGirlfriendModeFreche} />
              </View>
            </>
          ) : null}
          <Text style={[styles.rowLabel, { color: theme.colors.muted, marginTop: 10 }]}>Trainingstage</Text>
          <View style={styles.chipRow}>
            {dayLabels.map((day) => (
              <Pressable
                key={day.id}
                onPress={() => toggleTrainingDay(day.id)}
                style={[
                  styles.chip,
                  {
                    borderColor: trainingDays.includes(day.id) ? theme.colors.accent : theme.colors.border,
                    backgroundColor: trainingDays.includes(day.id) ? theme.colors.cardAlt : "transparent"
                  }
                ]}
              >
                <Text style={[styles.chipText, { color: theme.colors.text }]}>{day.label}</Text>
              </Pressable>
            ))}
          </View>
        </GlassCard>

        <GlassCard style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Audio</Text>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.colors.muted }]}>Ton</Text>
            <Switch value={soundEnabled} onValueChange={setSoundEnabled} />
          </View>
        </GlassCard>

        <GlassCard style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Zurücksetzen</Text>
          <Pressable
            onPress={() =>
              Alert.alert("Challenge zurücksetzen?", "Alle Daten werden gelöscht.", [
                { text: "Abbrechen", style: "cancel" },
                {
                  text: "Zurücksetzen",
                  style: "destructive",
                  onPress: async () => {
                    await resetChallenge();
                    navigation.navigate("Home" as never);
                  }
                }
              ])
            }
            style={styles.actionButton}
          >
            <Text style={[styles.actionText, { color: theme.colors.warning }]}>Challenge zurücksetzen</Text>
          </Pressable>
        </GlassCard>

        {__DEV__ ? (
          <GlassCard style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Entwickler</Text>
            <Pressable onPress={runDevReward} style={styles.actionButton}>
              <Text style={[styles.actionText, { color: theme.colors.accent }]}>Belohnung testen</Text>
            </Pressable>
            <Pressable
              onPress={() =>
                triggerReward({
                  tier: "normal",
                  xpGain: 120,
                  badgeTier: null,
                  isPillMode: uiVariant === "softPastel" && pillEnabled,
                  pillChecked: true,
                  source: "dev",
                  message: "Vorschau"
                })
              }
              style={styles.actionButton}
            >
              <Text style={[styles.actionText, { color: theme.colors.accentAlt }]}>Belohnungs-Modal Vorschau</Text>
            </Pressable>
            <Text style={[styles.rowLabel, { color: theme.colors.muted, marginTop: 12 }]}>Seed</Text>
            <TextInput
              value={devSeed?.toString() ?? ""}
              onChangeText={(value) => setDevSeed(value ? Number(value) : undefined)}
              placeholder="optional, für Debug"
              placeholderTextColor={theme.colors.muted}
              keyboardType="number-pad"
              style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
            />
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: theme.colors.muted }]}>Belohnungs-Debug</Text>
              <Switch value={showRewardDebug} onValueChange={setShowRewardDebug} />
            </View>
            <View style={{ marginTop: 10 }}>
              <Text style={[styles.effectList, { color: theme.colors.text }]}>Ausgew\u00e4hlter Effekt: {rewardDiagnostics.selectedEffect ?? "-"}</Text>
              <Text style={[styles.effectList, { color: theme.colors.text }]}>Renderer-Pfad: {rewardDiagnostics.rendererPath ?? "-"}</Text>
              <Text style={[styles.effectList, { color: theme.colors.text }]}>
                Skia verf\u00fcgbar: {String(rewardDiagnostics.skiaAvailable)}
                {rewardDiagnostics.skiaVersion ? ` (v${rewardDiagnostics.skiaVersion})` : ""}
              </Text>
              <Text style={[styles.effectList, { color: theme.colors.text }]}>Canvas-Gr\u00f6\u00dfe: {rewardDiagnostics.canvasSize.width} x {rewardDiagnostics.canvasSize.height}</Text>
              <Text style={[styles.effectList, { color: theme.colors.text }]}>Fallback-Grund: {rewardDiagnostics.fallbackReason ?? "-"}</Text>
              <Text style={[styles.effectList, { color: theme.colors.text }]}>Letzter Fehler: {rewardDiagnostics.lastError?.message ?? "-"}</Text>
              <Text style={[styles.effectList, { color: theme.colors.text }]}>Stack: {rewardDiagnostics.lastError?.stack ?? "-"}</Text>
              <Text style={[styles.effectList, { color: theme.colors.text }]}>Seed: {rewardDiagnostics.selection?.seed ?? "-"}</Text>
              <Text style={[styles.effectList, { color: theme.colors.text }]}>Gewichte: {rewardDiagnostics.selection?.weights ?? "-"}</Text>
            </View>
            <Text style={[styles.rowLabel, { color: theme.colors.muted, marginTop: 12 }]}>
              Premium-Effekte verf\u00fcgbar: {registeredEffects.length}
            </Text>
            <Text style={[styles.rowLabel, { color: theme.colors.muted, marginTop: 6 }]}>
              Registrierte Effekte: {registeredEffects.length}
            </Text>
            <Text style={[styles.rowLabel, { color: theme.colors.muted, marginTop: 6 }]}>
              Aktive Effekte: {enabledRegisteredEffects.length}
            </Text>
            {notRegisteredEffects.length ? (
              <Text style={[styles.rowLabel, { color: theme.colors.warning, marginTop: 6 }]}>
                NICHT_REGISTRIERT: {notRegisteredEffects.join(", ")}
              </Text>
            ) : null}
            {disabledEffects.length ? (
              <Text style={[styles.rowLabel, { color: theme.colors.warning, marginTop: 6 }]}>
                DEAKTIVIERT: {disabledEffects.join(", ")}
              </Text>
            ) : null}
            <Text style={[styles.rowLabel, { color: theme.colors.muted, marginTop: 8 }]}>Premium-Effekt-Galerie</Text>
            <View style={styles.effectGallery}>
              {registeredEffects.map((effect) => (
                <Pressable
                  key={effect}
                  onPress={() => setPreviewEffect(effect)}
                  style={[styles.effectRow, { borderColor: theme.colors.border }]}
                >
                  <Text style={[styles.effectName, { color: theme.colors.text }]}>
                    {premiumLabels[effect] ?? effect}
                  </Text>
                  <Switch
                    value={premiumEffectsEnabled[effect] !== false}
                    onValueChange={(value) => setPremiumEffectEnabled(effect, value)}
                  />
                </Pressable>
              ))}
            </View>
            <Text style={[styles.rowLabel, { color: theme.colors.muted, marginTop: 8 }]}>Letzte Effekte</Text>
            <Text style={[styles.effectList, { color: theme.colors.text }]}>
              {recentRewardEffects.length ? recentRewardEffects.join(", ") : "-"}
            </Text>
          </GlassCard>
        ) : null}
      </ScrollView>

      {showStartPicker ? (
        <>
          <DateTimePicker
            value={startDate}
            mode="date"
            display={isIos ? "inline" : "default"}
            onChange={(_, date) => {
              if (!isIos) setShowStartPicker(false);
              if (date) {
                const nextIso = toLocalIso(date);
                setStartDate(nextIso);
                showToast("Gespeichert");
              }
            }}
          />
          {isIos ? (
            <Pressable onPress={() => setShowStartPicker(false)} style={styles.pickerDone}>
              <Text style={[styles.pickerDoneText, { color: theme.colors.accent }]}>Fertig</Text>
            </Pressable>
          ) : null}
        </>
      ) : null}

      {previewEffect ? (
        <Modal visible transparent animationType="fade" onRequestClose={() => setPreviewEffect(null)}>
          <View style={styles.previewOverlay}>
            <View style={styles.previewBackdrop} />
            <View style={styles.previewLayer} pointerEvents="none">
              {(() => {
                const { EffectRenderer } = require("../components/rewards/EffectRenderer");
                return (
                  <EffectRenderer
                    effects={[previewEffect]}
                    title="Vorschau"
                    durationMs={3200}
                    onEffectDone={() => undefined}
                  />
                );
              })()}
            </View>
            <Pressable style={[styles.previewClose, { borderColor: theme.colors.border }]} onPress={() => setPreviewEffect(null)}>
              <Text style={[styles.previewCloseText, { color: theme.colors.text }]}>Schlie\u00dfen</Text>
            </Pressable>
          </View>
        </Modal>
      ) : null}

      {showSelectedPicker ? (
        <>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={isIos ? "inline" : "default"}
            onChange={(_, date) => {
              if (!isIos) setShowSelectedPicker(false);
              if (date) {
                const pickedIso = toLocalIso(date);
                setSelectedDay(pickedIso);
                showToast("Gespeichert");
              }
            }}
          />
          {isIos ? (
            <Pressable onPress={() => setShowSelectedPicker(false)} style={styles.pickerDone}>
              <Text style={[styles.pickerDoneText, { color: theme.colors.accent }]}>Fertig</Text>
            </Pressable>
          ) : null}
        </>
      ) : null}

      {showTimePicker ? (
        <>
          <DateTimePicker
            value={new Date(0, 0, 0, reminderTime.hour, reminderTime.minute)}
            mode="time"
            is24Hour
            display={isIos ? "spinner" : "default"}
            onChange={(_, date) => {
              if (!isIos) setShowTimePicker(false);
              if (date) updateReminderTime(date);
            }}
          />
          {isIos ? (
            <Pressable onPress={() => setShowTimePicker(false)} style={styles.pickerDone}>
              <Text style={[styles.pickerDoneText, { color: theme.colors.accent }]}>Fertig</Text>
            </Pressable>
          ) : null}
        </>
      ) : null}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1
  },
  scroll: {
    padding: 24,
    gap: 16
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  title: {
    fontSize: 28,
    fontWeight: "700"
  },
  dateButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "flex-end"
  },
  dateLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.7
  },
  dateValue: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600"
  },
  toast: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    opacity: 0.6
  },
  section: {
    padding: 16,
    borderRadius: 18
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6
  },
  rowLabel: {
    fontSize: 13
  },
  rowValue: {
    fontSize: 13,
    fontWeight: "600"
  },
  actionButton: {
    marginTop: 10,
    paddingVertical: 6
  },
  actionText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1
  },
  chipText: {
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase"
  },
  sliderValue: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600"
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    fontSize: 13
  },
  effectList: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16
  },
  effectGallery: {
    marginTop: 6,
    gap: 8
  },
  effectRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1
  },
  effectName: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.4
  },
  previewOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  previewBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)"
  },
  previewLayer: {
    ...StyleSheet.absoluteFillObject
  },
  previewClose: {
    position: "absolute",
    bottom: 48,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: "rgba(0,0,0,0.2)"
  },
  previewCloseText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.6
  },
  pickerDone: {
    alignSelf: "flex-end",
    marginRight: 20,
    marginTop: 8
  },
  pickerDoneText: {
    fontSize: 14,
    fontWeight: "600"
  }
});
