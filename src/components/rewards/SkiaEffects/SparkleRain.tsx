import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Canvas,
  Group,
  Circle
} from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSeededRng, useSkiaProgress } from "./shared";

type Drop = {
  x: number;
  size: number;
  delay: number;
  colorIndex: number;
};

const SparkleDrop = ({
  drop,
  progress,
  height,
  color
}: {
  drop: Drop;
  progress: ReturnType<typeof useSkiaProgress>;
  height: number;
  color: string;
}) => {
  const { x, size, delay } = drop;
  const cy = useDerivedValue(() => {
    const local = Math.max(0, Math.min(1, (progress.value - delay) / (1 - delay)));
    return -height * 0.2 + local * height * 1.4;
  }, [delay, height, progress]);

  return <Circle cx={x} cy={cy} r={size} color={color} />;
};

export const SparkleRain = ({ durationMs, onFinish, seed }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const rng = useSeededRng(seed);
  const progress = useSkiaProgress(durationMs, onFinish);
  const colors = [theme.colors.accentAlt, theme.colors.accent, theme.colors.text];

  const drops = useMemo(
    () =>
      Array.from({ length: 60 }, () => ({
        x: rng() * width,
        size: 2 + rng() * 3.5,
        delay: rng() * 0.6,
        colorIndex: Math.floor(rng() * colors.length)
      })),
    [colors.length, rng, width]
  );

  const opacity = useDerivedValue(() => 0.2 + 0.8 * (1 - progress.value), [progress]);

  return (
    <Canvas style={styles.canvas}>
      <Group opacity={opacity}>
        {drops.map((drop, index) => (
          <SparkleDrop
            key={`sparkle-${index}`}
            drop={drop}
            progress={progress}
            height={height}
            color={colors[drop.colorIndex]}
          />
        ))}
      </Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
