import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { BlurMask, Canvas, Circle, Group, LinearGradient, Rect, vec } from "@shopify/react-native-skia";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSeededRng, useSkiaProgressNumber } from "./shared";

type InkBlob = {
  angle: number;
  distance: number;
  radius: number;
  wobble: number;
  speed: number;
};

const InkSpread = ({ durationMs, onFinish, seed }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const rng = useSeededRng(seed);
  const progress = useSkiaProgressNumber(durationMs, onFinish);
  const centerX = width * 0.5;
  const centerY = height * 0.52;
  const minDim = Math.min(width, height);

  const blobs = useMemo<InkBlob[]>(
    () =>
      Array.from({ length: 8 }, () => ({
        angle: rng() * Math.PI * 2,
        distance: minDim * (0.12 + rng() * 0.22),
        radius: minDim * (0.08 + rng() * 0.07),
        wobble: (rng() - 0.5) * minDim * 0.08,
        speed: 0.6 + rng() * 0.8
      })),
    [minDim, rng]
  );

  const spread = Math.min(1, progress * 1.05);
  const fade = progress > 0.82 ? Math.max(0, 1 - (progress - 0.82) / 0.18) : 1;

  return (
    <Canvas style={styles.canvas}>
      <Rect x={0} y={0} width={width} height={height} color="rgba(0,0,0,0.15)">
        <LinearGradient
          start={vec(0, 0)}
          end={vec(width, height)}
          colors={[theme.colors.backgroundAlt, "rgba(0,0,0,0.25)"]}
        />
      </Rect>
      <Group opacity={0.9 * fade}>
        {blobs.map((blob, index) => {
          const drift = Math.sin(progress * Math.PI * 2 * blob.speed + blob.angle) * blob.wobble;
          const travel = blob.distance * spread;
          const cx = centerX + Math.cos(blob.angle) * travel + drift;
          const cy = centerY + Math.sin(blob.angle) * travel * 0.7 - drift * 0.3;
          const radius = blob.radius * (0.35 + spread);
          return (
            <Circle key={`ink-${index}`} cx={cx} cy={cy} r={radius} color={theme.colors.accentAlt} opacity={0.5}>
              <BlurMask blur={18} style="normal" />
            </Circle>
          );
        })}
      </Group>
      <Group opacity={0.6 * fade}>
        {blobs.map((blob, index) => {
          const travel = blob.distance * spread * 0.85;
          const cx = centerX + Math.cos(blob.angle) * travel;
          const cy = centerY + Math.sin(blob.angle) * travel * 0.65;
          const radius = blob.radius * (0.2 + spread * 0.7);
          return (
            <Circle key={`ink-core-${index}`} cx={cx} cy={cy} r={radius} color={theme.colors.accent} opacity={0.35}>
              <BlurMask blur={12} style="normal" />
            </Circle>
          );
        })}
      </Group>
    </Canvas>
  );
};

export default InkSpread;

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
