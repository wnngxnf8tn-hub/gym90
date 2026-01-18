import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { BlurMask, Canvas, Circle, Group } from "@shopify/react-native-skia";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSeededRng, useSkiaProgressNumber } from "./shared";

type Blob = {
  radius: number;
  amplitude: number;
  speed: number;
  phase: number;
  drift: number;
};

const MetaballBlobMorph = ({ durationMs, onFinish, seed }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const rng = useSeededRng(seed);
  const progress = useSkiaProgressNumber(durationMs, onFinish);
  const centerX = width * 0.5;
  const centerY = height * 0.5;

  const blobs = useMemo<Blob[]>(
    () =>
      Array.from({ length: 5 }, () => ({
        radius: 34 + rng() * 24,
        amplitude: 26 + rng() * 48,
        speed: 0.6 + rng() * 0.8,
        phase: rng() * Math.PI * 2,
        drift: (rng() - 0.5) * 18
      })),
    [rng]
  );

  return (
    <Canvas style={styles.canvas}>
      <Group opacity={0.9}>
        {blobs.map((blob, index) => {
          const t = progress * Math.PI * 2 * blob.speed + blob.phase;
          const wobble = Math.sin(progress * Math.PI * 3 + blob.phase) * blob.drift;
          const cx = centerX + Math.cos(t) * blob.amplitude + wobble;
          const cy = centerY + Math.sin(t) * blob.amplitude * 0.6 - wobble;
          const radius = blob.radius * (0.8 + 0.35 * Math.sin(t));
          return (
            <Circle key={`blob-${index}`} cx={cx} cy={cy} r={radius} color={theme.colors.accent}>
              <BlurMask blur={18} style="solid" />
            </Circle>
          );
        })}
      </Group>
    </Canvas>
  );
};

export default MetaballBlobMorph;

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
