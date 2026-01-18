import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Canvas,
  Circle
} from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSeededRng, useSkiaProgress } from "./shared";

type Orb = {
  angle: number;
  radius: number;
  size: number;
};

const OrbitOrb = ({
  orb,
  progress,
  centerX,
  centerY,
  color,
  opacity
}: {
  orb: Orb;
  progress: ReturnType<typeof useSkiaProgress>;
  centerX: number;
  centerY: number;
  color: string;
  opacity: SharedValue<number>;
}) => {
  const { angle, radius, size } = orb;
  const cx = useDerivedValue(() => {
    const spin = progress.value * Math.PI * 2;
    const spinAngle = angle + spin;
    return centerX + Math.cos(spinAngle) * radius;
  }, [angle, centerX, progress, radius]);
  const cy = useDerivedValue(() => {
    const spin = progress.value * Math.PI * 2;
    const spinAngle = angle + spin;
    return centerY + Math.sin(spinAngle) * radius * 0.7;
  }, [angle, centerY, progress, radius]);
  return <Circle cx={cx} cy={cy} r={size} color={color} opacity={opacity} />;
};

export const OrbitRing = ({ durationMs, onFinish, seed }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const centerX = width * 0.5;
  const centerY = height * 0.5;
  const rng = useSeededRng(seed);
  const progress = useSkiaProgress(durationMs, onFinish);

  const orbs = useMemo(
    () =>
      Array.from({ length: 18 }, () => ({
        angle: rng() * Math.PI * 2,
        radius: 80 + rng() * 140,
        size: 2 + rng() * 4
      })),
    [rng]
  );

  const opacity = useDerivedValue(() => 0.3 + 0.7 * (1 - progress.value), [progress]);

  return (
    <Canvas style={styles.canvas}>
      {orbs.map((orb, index) => (
        <OrbitOrb
          key={`orbit-${index}`}
          orb={orb}
          progress={progress}
          centerX={centerX}
          centerY={centerY}
          color={theme.colors.accentAlt}
          opacity={opacity}
        />
      ))}
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
