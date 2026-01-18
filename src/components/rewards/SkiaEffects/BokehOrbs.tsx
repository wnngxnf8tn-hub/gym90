import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  BlurMask,
  Canvas,
  Circle
} from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSeededRng, useSkiaProgress } from "./shared";

type Orb = {
  x: number;
  y: number;
  size: number;
  drift: number;
  colorIndex: number;
};

const BokehOrb = ({
  orb,
  progress,
  colors
}: {
  orb: Orb;
  progress: ReturnType<typeof useSkiaProgress>;
  colors: string[];
}) => {
  const { x, y, drift, size, colorIndex } = orb;
  const cy = useDerivedValue(() => y - drift * progress.value, [drift, progress, y]);
  const opacity = useDerivedValue(() => 0.08 + 0.22 * (1 - progress.value), [progress]);
  return (
    <Circle cx={x} cy={cy} r={size} color={colors[colorIndex]} opacity={opacity}>
      <BlurMask blur={24} style="normal" />
    </Circle>
  );
};

export const BokehOrbs = ({ durationMs, onFinish, seed }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const rng = useSeededRng(seed);
  const progress = useSkiaProgress(durationMs, onFinish);
  const colors = [theme.colors.accentAlt, theme.colors.accent, theme.colors.text];

  const orbs = useMemo(
    () =>
      Array.from({ length: 8 }, () => ({
        x: rng() * width,
        y: height * (0.2 + rng() * 0.6),
        size: 50 + rng() * 120,
        drift: 40 + rng() * 80,
        colorIndex: Math.floor(rng() * colors.length)
      })),
    [colors.length, height, rng, width]
  );

  return (
    <Canvas style={styles.canvas}>
      {orbs.map((orb, index) => (
        <BokehOrb key={`bokeh-${index}`} orb={orb} progress={progress} colors={colors} />
      ))}
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
