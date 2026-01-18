import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Canvas,
  Group,
  Path,
  Circle,
  Skia
} from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSeededRng, useSkiaProgress } from "./shared";

type Particle = {
  angle: number;
  distance: number;
  size: number;
  delay: number;
};

const CrownParticle = ({
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
  return <Circle cx={cx} cy={cy} r={size} color={color} />;
};

export const CrownCombo = ({ durationMs, onFinish, seed }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const centerX = width * 0.5;
  const centerY = height * 0.5;
  const rng = useSeededRng(seed);
  const progress = useSkiaProgress(durationMs, onFinish);

  const crown = useMemo(() => {
    const path = Skia.Path.Make();
    path.moveTo(centerX - 80, centerY + 30);
    path.lineTo(centerX - 60, centerY - 40);
    path.lineTo(centerX - 20, centerY + 10);
    path.lineTo(centerX, centerY - 50);
    path.lineTo(centerX + 20, centerY + 10);
    path.lineTo(centerX + 60, centerY - 40);
    path.lineTo(centerX + 80, centerY + 30);
    path.close();
    return path;
  }, [centerX, centerY]);

  const particles = useMemo(
    () =>
      Array.from({ length: 26 }, () => ({
        angle: rng() * Math.PI * 2,
        distance: 80 + rng() * 140,
        size: 2 + rng() * 3.5,
        delay: rng() * 0.35
      })),
    [rng]
  );

  const crownOpacity = useDerivedValue(() => 0.5 + 0.5 * (1 - progress.value), [progress]);

  return (
    <Canvas style={styles.canvas}>
      <Group opacity={crownOpacity}>
        {particles.map((particle, index) => (
          <CrownParticle
            key={`crown-fire-${index}`}
            particle={particle}
            progress={progress}
            centerX={centerX}
            centerY={centerY}
            color={theme.colors.accentAlt}
          />
        ))}
        <Path path={crown} color={theme.colors.accent} />
      </Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
