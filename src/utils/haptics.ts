import * as Haptics from "expo-haptics";

export type HapticIntensity = "low" | "medium" | "high";

const intensityMap: Record<HapticIntensity, Haptics.ImpactFeedbackStyle> = {
  low: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  high: Haptics.ImpactFeedbackStyle.Heavy
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const triggerCelebrationHaptics = async (
  enabled: boolean,
  intensity: HapticIntensity,
  durationMs: number
) => {
  if (!enabled) return;
  const safeDuration = Math.max(5000, durationMs);
  const loops = Math.max(6, Math.floor(safeDuration / 420));
  const style = intensityMap[intensity] ?? Haptics.ImpactFeedbackStyle.Heavy;

  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    for (let i = 0; i < loops; i += 1) {
      await delay(140);
      await Haptics.impactAsync(style);
      await delay(260);
    }
  } catch {
    // Haptics can be throttled or unavailable; fail silently.
  }
};
