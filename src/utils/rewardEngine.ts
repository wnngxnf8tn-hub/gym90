import { ThemeVariant } from "../theme/themes";
import { createRng } from "./random";
import { SoundCue } from "./audio";
import { skiaEffectNames, SkiaEffectName } from "../components/rewards/SkiaEffects/registry";

export type RewardTier = "normal" | "bonus" | "perfect";

export type RewardEffect =
  | SkiaEffectName
  | "glitterParticles"
  | "ringGlowSurge"
  | "progressSnap"
  | "doneStamp"
  | "trophyPop"
  | "fireworkTrails"
  | "starburstRays"
  | "floatingOrbs"
  | "gradientFlash"
  | "checkmarkDraw"
  | "cardFlip"
  | "particleHalo"
  | "shimmerOverlay"
  | "streakFlame"
  | "crownPop"
  | "bonusLightning"
  | "pulseGrid";

export type RewardPayload = {
  id: string;
  effects: RewardEffect[];
  title: string;
  subtitle?: string;
  message?: string;
  sound: SoundCue;
  badgeTier?: "common" | "rare" | "legendary";
  xpGain: number;
  debug?: {
    tier: RewardTier;
    seed?: number;
    effects: RewardEffect[];
    pool?: RewardEffect[];
    filtered?: RewardEffect[];
    weights?: string;
  };
};

export type RewardContext = {
  id: string;
  tier: RewardTier;
  uiVariant: ThemeVariant;
  xpGain: number;
  badgeTier?: "common" | "rare" | "legendary" | null;
  isStreak?: boolean;
  isPillMode?: boolean;
  pillChecked?: boolean;
  girlfriendModeFreche?: boolean;
  seed?: number;
  recentEffects?: RewardEffect[];
  enabledEffects?: RewardEffect[];
};

export const PREMIUM_EFFECTS: RewardEffect[] = [...skiaEffectNames];

export const rewardEffectCatalog = {
  premium: PREMIUM_EFFECTS,
  claim: ["coinBurst"] as RewardEffect[]
};

export const rewardEffectList = Array.from(new Set([...rewardEffectCatalog.premium, ...rewardEffectCatalog.claim]));

export const rewardVariantCount = rewardEffectCatalog.premium.length;

const pastelPillTexts = [
  "Wuhuuu, nicht schwanger 😎"
];

const pastelNeutralTexts = ["Wuhuuu, nicht schwanger 😎"];

const pickSoundCue = (tier: RewardTier, uiVariant: ThemeVariant) => {
  if (tier === "perfect") return "perfect";
  if (tier === "bonus") return "bonus";
  if (uiVariant === "gamifiedNeon") return "neon";
  if (uiVariant === "softPastel") return "pastel";
  return "success";
};

export const buildReward = (context: RewardContext): RewardPayload => {
  const rng = createRng(context.seed);
  const recentEffects = (context.recentEffects ?? []).slice(0, 3);
  const pool = context.enabledEffects?.length ? context.enabledEffects : PREMIUM_EFFECTS;
  const filtered = pool.filter((effect) => !recentEffects.includes(effect));
  const source = filtered.length ? filtered : pool;
  const effects = [source[Math.floor(rng() * source.length)]];

  const badgeTier = context.badgeTier ?? undefined;

  const title =
    context.tier === "perfect"
      ? "Perfekte Woche"
      : context.tier === "bonus"
      ? "Bonus-Tag"
      : badgeTier === "legendary"
      ? "Legendäres Abzeichen"
      : badgeTier === "rare"
      ? "Seltenes Abzeichen"
      : "Tageserfolg";

  const subtitle = "Streak +1";

  let message: string | undefined;
  if (context.uiVariant === "softPastel" && context.isPillMode && context.pillChecked) {
    const poolTexts = context.girlfriendModeFreche ? pastelPillTexts : pastelNeutralTexts;
    message = poolTexts[Math.floor(rng() * poolTexts.length)];
  }

  const sound = badgeTier ? "badge" : pickSoundCue(context.tier, context.uiVariant);
  if (__DEV__) {
    console.info("[RewardEngine] selection", {
      seed: context.seed,
      pool,
      filtered,
      selected: effects,
      weights: "uniform"
    });
  }

  return {
    id: context.id,
    effects,
    title,
    subtitle,
    message,
    sound,
    badgeTier,
    xpGain: context.xpGain,
    debug: {
      tier: context.tier,
      seed: context.seed,
      effects,
      pool,
      filtered,
      weights: "uniform"
    }
  };
};
