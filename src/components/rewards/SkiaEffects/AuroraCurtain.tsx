import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { Canvas, Group, LinearGradient, Rect, vec } from "@shopify/react-native-skia";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSeededRng, useSkiaProgressNumber } from "./shared";

type AuroraBand = {
  offset: number;
  width: number;
  speed: number;
  phase: number;
  opacity: number;
};

const AuroraCurtain = ({ durationMs, onFinish, seed }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const rng = useSeededRng(seed);
  const progress = useSkiaProgressNumber(durationMs, onFinish);

  const bands = useMemo<AuroraBand[]>(
    () =>
      Array.from({ length: 7 }, () => ({
        offset: rng(),
        width: 0.16 + rng() * 0.18,
        speed: 0.4 + rng() * 0.8,
        phase: rng() * Math.PI * 2,
        opacity: 0.4 + rng() * 0.4
      })),
    [rng]
  );

  return (
    <Canvas style={styles.canvas}>
      <Rect x={0} y={0} width={width} height={height} color="rgba(0,0,0,0.2)">
        <LinearGradient
          start={vec(0, 0)}
          end={vec(width, height)}
          colors={[theme.colors.backgroundAlt, theme.colors.background]}
        />
      </Rect>
      <Group opacity={0.85}>
        {bands.map((band, index) => {
          const drift = (progress * band.speed + band.offset) % 1;
          const bandWidth = width * band.width;
          const x = -bandWidth + drift * (width + bandWidth * 2);
          const wave = Math.sin(progress * Math.PI * 2 + band.phase) * height * 0.04;
          return (
            <Rect key={`aurora-${index}`} x={x} y={wave} width={bandWidth} height={height} opacity={band.opacity}>
              <LinearGradient
                start={vec(x, 0)}
                end={vec(x + bandWidth, height)}
                colors={["rgba(120,255,220,0.05)", theme.colors.accentAlt, theme.colors.accent, "rgba(80,120,255,0.04)"]}
              />
            </Rect>
          );
        })}
      </Group>
    </Canvas>
  );
};

export default AuroraCurtain;

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
