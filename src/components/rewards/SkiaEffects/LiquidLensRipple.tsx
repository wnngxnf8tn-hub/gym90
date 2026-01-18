import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  LinearGradient,
  RadialGradient,
  Rect,
  vec
} from "@shopify/react-native-skia";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSeededRng, useSkiaProgressNumber } from "./shared";

type RippleRing = {
  start: number;
  strength: number;
  blur: number;
};

const LiquidLensRipple = ({ durationMs, onFinish, seed }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const rng = useSeededRng(seed);
  const progress = useSkiaProgressNumber(durationMs, onFinish);
  const minDim = Math.min(width, height);
  const centerX = width * 0.5 + Math.sin(progress * Math.PI * 2) * minDim * 0.02;
  const centerY = height * 0.5 + Math.cos(progress * Math.PI * 2) * minDim * 0.02;
  const lensRadius = minDim * (0.2 + 0.05 * Math.sin(progress * Math.PI));

  const rings = useMemo<RippleRing[]>(
    () =>
      Array.from({ length: 4 }, (_, index) => ({
        start: 0.08 + index * 0.18,
        strength: 0.25 + rng() * 0.35,
        blur: 10 + rng() * 10
      })),
    [rng]
  );

  return (
    <Canvas style={styles.canvas}>
      <Rect x={0} y={0} width={width} height={height} color="rgba(0,0,0,0.35)">
        <LinearGradient
          start={vec(0, 0)}
          end={vec(width, height)}
          colors={[theme.colors.backgroundAlt, theme.colors.background]}
        />
      </Rect>
      <Circle cx={centerX} cy={centerY} r={lensRadius} opacity={0.85}>
        <RadialGradient
          c={vec(centerX, centerY)}
          r={lensRadius * 1.2}
          colors={["rgba(255,255,255,0.35)", "rgba(255,255,255,0.08)", "transparent"]}
        />
      </Circle>
      <Circle cx={centerX + lensRadius * 0.25} cy={centerY - lensRadius * 0.2} r={lensRadius * 0.35} opacity={0.6}>
        <RadialGradient
          c={vec(centerX + lensRadius * 0.25, centerY - lensRadius * 0.2)}
          r={lensRadius * 0.45}
          colors={["rgba(255,255,255,0.5)", "transparent"]}
        />
      </Circle>
      <Group opacity={0.7}>
        {rings.map((ring, index) => {
          if (progress < ring.start) return null;
          const ringProgress = Math.min(1, (progress - ring.start) / (1 - ring.start));
          const radius = lensRadius + ringProgress * minDim * 0.35;
          const opacity = ring.strength * (1 - ringProgress);
          if (opacity <= 0) return null;
          return (
            <Circle key={`ripple-${index}`} cx={centerX} cy={centerY} r={radius} opacity={opacity} color={theme.colors.accentAlt}>
              <BlurMask blur={ring.blur} style="normal" />
            </Circle>
          );
        })}
      </Group>
    </Canvas>
  );
};

export default LiquidLensRipple;

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
