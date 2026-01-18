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
};

const Metaball = ({
  blob,
  progress,
  centerX,
  centerY,
  color
}: {
  blob: Blob;
  progress: number;
  centerX: number;
  centerY: number;
  color: string;
}) => {
  const t = progress * Math.PI * 2 * blob.speed + blob.phase;
  const cx = centerX + Math.cos(t) * blob.amplitude;
  const cy = centerY + Math.sin(t) * blob.amplitude * 0.6;
  return (
    <Circle cx={cx} cy={cy} r={blob.radius} color={color}>
      <BlurMask blur={18} style="solid" />
    </Circle>
  );
};

export const MetaballBlob = ({ durationMs, onFinish, seed }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const rng = useSeededRng(seed);
  const progress = useSkiaProgressNumber(durationMs, onFinish);
  const centerX = width * 0.5;
  const centerY = height * 0.5;

  const blobs = useMemo(
    () =>
      Array.from({ length: 4 }, () => ({
        radius: 40 + rng() * 30,
        amplitude: 30 + rng() * 50,
        speed: 0.7 + rng() * 0.7,
        phase: rng() * Math.PI * 2
      })),
    [rng]
  );

  return (
    <Canvas style={styles.canvas}>
      <Group opacity={0.9}>
        {blobs.map((blob, index) => (
          <Metaball
            key={`blob-${index}`}
            blob={blob}
            progress={progress}
            centerX={centerX}
            centerY={centerY}
            color={theme.colors.accent}
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
