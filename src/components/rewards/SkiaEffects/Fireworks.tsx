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

type Particle = {
  angle: number;
  distance: number;
  size: number;
  delay: number;
  colorIndex: number;
};

const FireworkParticle = ({
  particle,
  progress,
  centerX,
  centerY,
  color
}: {
  particle: Particle;
  progress: ReturnType<typeof useSkiaProgress>;
  centerX: number;
  centerY: number;
  color: string;
}) => {
  const { angle, delay, distance, size } = particle;
  const cx = useDerivedValue(() => {
    const local = Math.max(0, Math.min(1, (progress.value - delay) / (1 - delay)));
    return centerX + Math.cos(angle) * distance * local;
  }, [angle, centerX, delay, distance, progress]);
  const cy = useDerivedValue(() => {
    const local = Math.max(0, Math.min(1, (progress.value - delay) / (1 - delay)));
    return centerY + Math.sin(angle) * distance * local;
  }, [angle, centerY, delay, distance, progress]);
  const r = useDerivedValue(() => {
    const local = Math.max(0, Math.min(1, (progress.value - delay) / (1 - delay)));
    return size * (1 - 0.35 * local);
  }, [delay, progress, size]);
  return <Circle cx={cx} cy={cy} r={r} color={color} />;
};

export const Fireworks = ({ durationMs, onFinish, seed }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const centerX = width * 0.5;
  const centerY = height * 0.5;
  const rng = useSeededRng(seed);
  const progress = useSkiaProgress(durationMs, onFinish);
  const colors = [theme.colors.accent, theme.colors.accentAlt, theme.colors.text];

  const particles = useMemo(() => {
    return Array.from({ length: 48 }, () => ({
      angle: rng() * Math.PI * 2,
      distance: 120 + rng() * 180,
      size: 2 + rng() * 3.5,
      delay: rng() * 0.4,
      colorIndex: Math.floor(rng() * colors.length)
    }));
  }, [colors.length, rng]);

  const burstOpacity = useDerivedValue(() => 1 - progress.value, [progress]);

  return (
    <Canvas style={styles.canvas}>
      <Group opacity={burstOpacity}>
        {particles.map((particle, index) => (
          <FireworkParticle
            key={`firework-${index}`}
            particle={particle}
            progress={progress}
            centerX={centerX}
            centerY={centerY}
            color={colors[particle.colorIndex]}
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
