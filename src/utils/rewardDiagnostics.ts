import type { RewardEffect } from "./rewardEngine";

export type RewardFallbackReason =
  | "PLATFORM_WEB"
  | "SKIA_HOOK_MISSING"
  | "EFFECT_CRASHED"
  | "EFFECT_NOT_FOUND"
  | "CANVAS_ZERO"
  | "OTHER";

export type RewardRendererPath = "skia" | "fallback" | "errorBoundary";

export type RewardDiagnostics = {
  selectedEffect: RewardEffect | null;
  rendererPath: RewardRendererPath | null;
  skiaAvailable: boolean;
  skiaVersion: string | null;
  canvasSize: {
    width: number;
    height: number;
  };
  lastError: { message: string; stack?: string } | null;
  fallbackReason: RewardFallbackReason | null;
  payloadId: string | null;
  selection?: {
    seed?: number;
    pool?: RewardEffect[];
    filtered?: RewardEffect[];
    selected?: RewardEffect[];
    weights?: string;
  };
};

export const buildDefaultRewardDiagnostics = (): RewardDiagnostics => ({
  selectedEffect: null,
  rendererPath: null,
  skiaAvailable: false,
  skiaVersion: null,
  canvasSize: { width: 0, height: 0 },
  lastError: null,
  fallbackReason: null,
  payloadId: null,
  selection: undefined
});
