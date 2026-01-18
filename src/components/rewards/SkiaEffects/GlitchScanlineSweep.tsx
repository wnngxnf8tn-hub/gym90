import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { Canvas, Group, Rect } from "@shopify/react-native-skia";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSeededRng, useSkiaProgressNumber } from "./shared";

type GlitchSlice = {
  y: number;
  height: number;
  drift: number;
  strength: number;
};

const GlitchScanlineSweep = ({ durationMs, onFinish, seed }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const rng = useSeededRng(seed);
  const progress = useSkiaProgressNumber(durationMs, onFinish);

  const slices = useMemo<GlitchSlice[]>(
    () =>
      Array.from({ length: 14 }, () => ({
        y: rng() * height,
        height: 6 + rng() * 18,
        drift: (rng() - 0.5) * width * 0.12,
        strength: 0.2 + rng() * 0.6
      })),
    [height, rng, width]
  );

  const sweepX = -width * 0.2 + progress * width * 1.4;
  const glowOpacity = 0.2 + 0.6 * (1 - Math.abs(progress - 0.5) * 2);

  return (
    <Canvas style={styles.canvas}>
      <Rect x={0} y={0} width={width} height={height} color="rgba(0,0,0,0.2)" />
      <Group opacity={glowOpacity}>
        <Rect x={sweepX} y={0} width={width * 0.12} height={height} color={theme.colors.accentAlt} />
      </Group>
      {slices.map((slice, index) => {
        const jitter = Math.sin((progress + index * 0.12) * Math.PI * 4) * slice.drift;
        return (
          <Group key={`slice-${index}`}>
            <Rect
              x={jitter}
              y={slice.y}
              width={width}
              height={slice.height}
              color={theme.colors.accent}
              opacity={0.08 + slice.strength * 0.25}
            />
            <Rect
              x={jitter * 0.6}
              y={slice.y + slice.height * 0.35}
              width={width}
              height={slice.height * 0.4}
              color={theme.colors.accentAlt}
              opacity={0.08 + slice.strength * 0.2}
            />
          </Group>
        );
      })}
    </Canvas>
  );
};

export default GlitchScanlineSweep;

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
