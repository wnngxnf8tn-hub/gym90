import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { Canvas, Group, LinearGradient, Rect, vec } from "@shopify/react-native-skia";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSeededRng, useSkiaProgressNumber } from "./shared";

type SlickBand = {
  offset: number;
  width: number;
  speed: number;
  opacity: number;
};

const OilSlickFilm = ({ durationMs, onFinish, seed }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const rng = useSeededRng(seed);
  const progress = useSkiaProgressNumber(durationMs, onFinish);

  const bands = useMemo<SlickBand[]>(
    () =>
      Array.from({ length: 6 }, () => ({
        offset: rng(),
        width: 0.18 + rng() * 0.25,
        speed: 0.4 + rng() * 0.7,
        opacity: 0.35 + rng() * 0.35
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
      <Group opacity={0.9}>
        {bands.map((band, index) => {
          const drift = (progress * band.speed + band.offset) % 1;
          const bandWidth = width * band.width;
          const x = -bandWidth * 0.6 + drift * width * 1.6;
          const shimmer = 0.4 + 0.6 * Math.sin((progress + band.offset) * Math.PI * 2);
          return (
            <Rect key={`slick-${index}`} x={x} y={0} width={bandWidth} height={height} opacity={band.opacity * shimmer}>
              <LinearGradient
                start={vec(x, 0)}
                end={vec(x + bandWidth, height)}
                colors={[
                  "rgba(255,255,255,0.08)",
                  theme.colors.accentAlt,
                  theme.colors.accent,
                  "rgba(255,255,255,0.05)"
                ]}
              />
            </Rect>
          );
        })}
      </Group>
    </Canvas>
  );
};

export default OilSlickFilm;

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
