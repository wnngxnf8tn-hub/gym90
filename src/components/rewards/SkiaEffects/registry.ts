import type { ComponentType } from "react";
import type { SkiaEffectProps } from "./shared";
import * as SkiaEffects from "./index";

export type SkiaEffectComponent = ComponentType<SkiaEffectProps>;
export type SkiaEffectName = keyof typeof SkiaEffects;

export const skiaEffectRegistry = SkiaEffects as Record<SkiaEffectName, SkiaEffectComponent>;

export const skiaEffectNames = Object.keys(skiaEffectRegistry) as SkiaEffectName[];
