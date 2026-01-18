import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ThemeVariant } from "../theme/themes";
import { todayIso } from "../utils/dates";
import { HapticIntensity } from "../utils/haptics";
import { STORAGE_KEYS } from "../utils/storageKeys";
import type { RewardEffect } from "../utils/rewardEngine";
import { PREMIUM_EFFECTS } from "../utils/rewardEngine";
import { buildDefaultRewardDiagnostics, RewardDiagnostics } from "../utils/rewardDiagnostics";

export type DailyChecks = {
  sleep: boolean;
  nutrition: boolean;
  training: boolean;
  pill: boolean;
};

export type BadgeTier = "common" | "rare" | "legendary";

export type Badge = {
  id: string;
  title: string;
  tier: BadgeTier;
  dateIso: string;
};

export type ReminderTime = {
  hour: number;
  minute: number;
};

export type RewardItem = {
  id: string;
  dateIso: string;
  tier: "normal" | "bonus" | "perfect";
  xpGain: number;
  badgeTier?: "common" | "rare" | "legendary" | null;
  message?: string;
  pillChecked?: boolean;
};

export type ChallengeState = {
  startDateIso: string;
  selectedDayIso: string;
  trainingDays: number[];
  checksByDay: Record<string, DailyChecks>;
  celebratedDays: Record<string, boolean>;
  claimedDays: Record<string, boolean>;
  perfectWeekAwarded: Record<string, boolean>;
  rewardQueue: RewardItem[];
  recentRewardEffects: RewardEffect[];
  premiumEffectsEnabled: Record<RewardEffect, boolean>;
  uiVariant: ThemeVariant;
  ringDisplay: "day" | "percent" | "level";
  pillEnabled: boolean;
  girlfriendModeFreche: boolean;
  reminderTime: ReminderTime;
  reminderEnabled: boolean;
  soundEnabled: boolean;
  extraHaptics: boolean;
  hapticsIntensity: HapticIntensity;
  hapticsDuration: number;
  strictMode: boolean;
  xp: number;
  badges: Badge[];
  devSeed?: number;
  showRewardDebug: boolean;
  rewardDiagnostics: RewardDiagnostics;
  lastKnownStreak: number | null;

  setStartDate: (iso: string) => void;
  setSelectedDay: (iso: string) => void;
  setTrainingDays: (days: number[]) => void;
  setUiVariant: (variant: ThemeVariant) => void;
  setRingDisplay: (mode: "day" | "percent" | "level") => void;
  setPillEnabled: (enabled: boolean) => void;
  setGirlfriendModeFreche: (enabled: boolean) => void;
  setReminderTime: (time: ReminderTime) => void;
  setReminderEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setExtraHaptics: (enabled: boolean) => void;
  setHapticsIntensity: (intensity: HapticIntensity) => void;
  setHapticsDuration: (duration: number) => void;
  setStrictMode: (enabled: boolean) => void;
  setDevSeed: (seed?: number) => void;
  setShowRewardDebug: (enabled: boolean) => void;
  setRewardDiagnostics: (partial: Partial<RewardDiagnostics>) => void;
  resetRewardDiagnostics: () => void;
  setLastKnownStreak: (value: number | null) => void;

  setChecksForDate: (iso: string, checks: DailyChecks) => void;
  toggleCheckForDate: (iso: string, key: keyof DailyChecks) => void;
  markCelebrated: (iso: string) => void;
  markClaimed: (iso: string) => void;
  markPerfectWeek: (weekIso: string) => void;
  enqueueReward: (reward: RewardItem) => void;
  dequeueReward: () => void;
  pushRecentRewardEffects: (effects: RewardEffect[]) => void;
  setPremiumEffectEnabled: (effect: RewardEffect, enabled: boolean) => void;
  addXp: (amount: number) => void;
  addBadge: (badge: Badge) => void;
  resetChallenge: () => Promise<void>;
};

const buildDefaultState = () => ({
  startDateIso: todayIso(),
  selectedDayIso: todayIso(),
  trainingDays: [1, 2, 3, 4],
  checksByDay: {},
  celebratedDays: {},
  claimedDays: {},
  perfectWeekAwarded: {},
  rewardQueue: [],
  recentRewardEffects: [] as RewardEffect[],
  premiumEffectsEnabled: PREMIUM_EFFECTS.reduce<Record<RewardEffect, boolean>>((map, effect) => {
    map[effect] = true;
    return map;
  }, {} as Record<RewardEffect, boolean>),
  uiVariant: "premiumDark" as ThemeVariant,
  ringDisplay: "day" as "day" | "percent" | "level",
  pillEnabled: true,
  girlfriendModeFreche: true,
  reminderTime: { hour: 21, minute: 30 },
  reminderEnabled: false,
  soundEnabled: true,
  extraHaptics: true,
  hapticsIntensity: "high" as HapticIntensity,
  hapticsDuration: 5000,
  strictMode: false,
  xp: 0,
  badges: [],
  devSeed: undefined as number | undefined,
  showRewardDebug: false,
  rewardDiagnostics: buildDefaultRewardDiagnostics(),
  lastKnownStreak: null
});

export const useChallengeStore = create<ChallengeState>()(
  persist(
    (set) => ({
      ...buildDefaultState(),
      setStartDate: (iso) =>
        set(() => ({
          startDateIso: iso
        })),
      setSelectedDay: (iso) =>
        set(() => ({
          selectedDayIso: iso
        })),
      setTrainingDays: (days) => set({ trainingDays: days }),
      setUiVariant: (variant) => set({ uiVariant: variant }),
      setRingDisplay: (mode) => set({ ringDisplay: mode }),
      setPillEnabled: (enabled) => set({ pillEnabled: enabled }),
      setGirlfriendModeFreche: (enabled) => set({ girlfriendModeFreche: enabled }),
      setReminderTime: (time) => set({ reminderTime: time }),
      setReminderEnabled: (enabled) => set({ reminderEnabled: enabled }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setExtraHaptics: (enabled) => set({ extraHaptics: enabled }),
      setHapticsIntensity: (intensity) => set({ hapticsIntensity: intensity }),
      setHapticsDuration: (duration) => set({ hapticsDuration: duration }),
      setStrictMode: (enabled) => set({ strictMode: enabled }),
      setDevSeed: (seed) => set({ devSeed: seed }),
      setShowRewardDebug: (enabled) => set({ showRewardDebug: enabled }),
      setRewardDiagnostics: (partial) =>
        set((state) => ({
          rewardDiagnostics: {
            ...state.rewardDiagnostics,
            ...partial
          }
        })),
      resetRewardDiagnostics: () => set({ rewardDiagnostics: buildDefaultRewardDiagnostics() }),
      setLastKnownStreak: (value) => set({ lastKnownStreak: value }),
      setChecksForDate: (iso, checks) =>
        set((state) => ({
          checksByDay: {
            ...state.checksByDay,
            [iso]: checks
          }
        })),
      toggleCheckForDate: (iso, key) =>
        set((state) => {
          const current = state.checksByDay[iso] || {
            sleep: false,
            nutrition: false,
            training: false,
            pill: false
          };
          return {
            checksByDay: {
              ...state.checksByDay,
              [iso]: { ...current, [key]: !current[key] }
            }
          };
        }),
      markCelebrated: (iso) =>
        set((state) => ({
          celebratedDays: {
            ...state.celebratedDays,
            [iso]: true
          }
        })),
      markClaimed: (iso) =>
        set((state) => ({
          claimedDays: {
            ...state.claimedDays,
            [iso]: true
          }
        })),
      markPerfectWeek: (weekIso) =>
        set((state) => ({
          perfectWeekAwarded: {
            ...state.perfectWeekAwarded,
            [weekIso]: true
          }
        })),
      enqueueReward: (reward) =>
        set((state) => ({
          rewardQueue: [...state.rewardQueue, reward]
        })),
      dequeueReward: () =>
        set((state) => ({
          rewardQueue: state.rewardQueue.slice(1)
        })),
      pushRecentRewardEffects: (effects) =>
        set((state) => {
          const next = [...effects, ...state.recentRewardEffects];
          const unique: RewardEffect[] = [];
          for (const effect of next) {
            if (!unique.includes(effect)) unique.push(effect);
          }
          return { recentRewardEffects: unique.slice(0, 3) };
        }),
      setPremiumEffectEnabled: (effect, enabled) =>
        set((state) => ({
          premiumEffectsEnabled: {
            ...state.premiumEffectsEnabled,
            [effect]: enabled
          }
        })),
      addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
      addBadge: (badge) => set((state) => ({ badges: [badge, ...state.badges] })),
      resetChallenge: async () => {
        await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
        set(buildDefaultState());
      }
    }),
    {
      name: STORAGE_KEYS.challengeStore,
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
