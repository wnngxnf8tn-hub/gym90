import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { RewardModal } from "./rewards/RewardModal";
import { useChallengeStore } from "../store/useChallengeStore";
import { buildReward, RewardEffect, RewardPayload, RewardTier } from "../utils/rewardEngine";
import { skiaEffectNames } from "./rewards/SkiaEffects/registry";
import { triggerCelebrationHaptics } from "../utils/haptics";
import { configureAudio, playSound } from "../utils/audio";

type RewardRequest = {
  tier: RewardTier;
  xpGain: number;
  badgeTier?: "common" | "rare" | "legendary" | null;
  isPillMode?: boolean;
  pillChecked?: boolean;
  source?: "completion" | "dev";
  dateIso?: string;
  message?: string;
};

type RewardContextValue = {
  triggerReward: (request: RewardRequest) => void;
};

const RewardContext = createContext<RewardContextValue>({
  triggerReward: () => undefined
});

export const RewardProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    uiVariant,
    soundEnabled,
    extraHaptics,
    hapticsIntensity,
    hapticsDuration,
    devSeed,
    showRewardDebug,
    girlfriendModeFreche,
    pillEnabled,
    premiumEffectsEnabled,
    rewardQueue,
    enqueueReward,
    dequeueReward,
    addXp,
    markCelebrated,
    markClaimed,
    recentRewardEffects,
    pushRecentRewardEffects
  } = useChallengeStore();
  const current = rewardQueue[0] ?? null;
  const lastRewardIdRef = useRef<string | null>(null);
  const recentEffectsSnapshot = useMemo(() => recentRewardEffects, [current?.id]);
  const enabledPremiumEffects = useMemo(() => {
    const enabled = skiaEffectNames.filter((effect) => premiumEffectsEnabled[effect] !== false) as RewardEffect[];
    return enabled.length ? enabled : undefined;
  }, [premiumEffectsEnabled]);

  const payload = useMemo<RewardPayload | null>(() => {
    if (!current) return null;
    return buildReward({
      id: current.id,
      tier: current.tier,
      uiVariant,
      xpGain: current.xpGain,
      badgeTier: current.badgeTier ?? undefined,
      isPillMode: uiVariant === "softPastel" && pillEnabled,
      pillChecked: current.pillChecked,
      girlfriendModeFreche,
      seed: devSeed,
      recentEffects: recentEffectsSnapshot,
      enabledEffects: enabledPremiumEffects
    });
  }, [
    current?.id,
    current?.tier,
    current?.xpGain,
    current?.badgeTier,
    current?.pillChecked,
    uiVariant,
    pillEnabled,
    girlfriendModeFreche,
    devSeed,
    recentEffectsSnapshot,
    enabledPremiumEffects
  ]);

  const resolvedPayload = payload
    ? {
        ...payload,
        message: current?.message ?? payload.message
      }
    : null;

  const triggerReward = useCallback(
    (request: RewardRequest) => {
      const id = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      enqueueReward({
        id,
        dateIso: request.dateIso ?? "",
        tier: request.tier === "normal" ? "normal" : request.tier,
        xpGain: request.xpGain,
        badgeTier: request.badgeTier ?? null,
        pillChecked: request.pillChecked,
        message: request.message
      });
    },
    [enqueueReward]
  );

  const value = useMemo(() => ({ triggerReward }), [triggerReward]);

  useEffect(() => {
    configureAudio();
  }, []);

  useEffect(() => {
    if (!payload || !current?.id) return;
    if (lastRewardIdRef.current === current.id) return;
    lastRewardIdRef.current = current.id;
    playSound(payload.sound, soundEnabled);
    triggerCelebrationHaptics(extraHaptics, hapticsIntensity, hapticsDuration);
    pushRecentRewardEffects(payload.effects);
  }, [
    current?.id,
    payload?.effects,
    payload?.sound,
    soundEnabled,
    extraHaptics,
    hapticsIntensity,
    hapticsDuration,
    pushRecentRewardEffects
  ]);

  return (
    <RewardContext.Provider value={value}>
      {children}
      <RewardModal
        visible={Boolean(resolvedPayload)}
        payload={
          resolvedPayload
            ? {
                ...resolvedPayload,
                subtitle: showRewardDebug ? `${resolvedPayload.subtitle ?? ""}` : resolvedPayload.subtitle
              }
            : null
        }
        debug={showRewardDebug}
        onClaim={() => {
          if (!current) return;
          addXp(current.xpGain);
          if (current.dateIso) {
            markCelebrated(current.dateIso);
            markClaimed(current.dateIso);
          }
          dequeueReward();
        }}
        onClose={() => {
          // Modal should not dismiss without claim.
        }}
      />
    </RewardContext.Provider>
  );
};

export const useReward = () => useContext(RewardContext);
