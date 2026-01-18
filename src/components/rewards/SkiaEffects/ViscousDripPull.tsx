import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { BlurMask, Canvas, Circle, Group, LinearGradient, Rect, vec } from "@shopify/react-native-skia";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSeededRng, useSkiaProgressNumber } from "./shared";

type Drip = {
  x: number;
  width: number;
  maxLength: number;
  delay: number;
};

const ViscousDripPull = ({ durationMs, onFinish, seed }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const rng = useSeededRng(seed);
  const progress = useSkiaProgressNumber(durationMs, onFinish);
  const bandHeight = height * (0.12 + 0.06 * Math.sin(progress * Math.PI));

  const drips = useMemo<Drip[]>(
    () =>
      Array.from({ length: 6 }, () => ({
        x: rng() * width,
        width: 14 + rng() * 22,
        maxLength: height * (0.22 + rng() * 0.25),
        delay: 0.08 + rng() * 0.25
      })),
    [height, rng, width]
  );

  return (
    <Canvas style={styles.canvas}>
      <Rect x={0} y={0} width={width} height={height} color="rgba(0,0,0,0.2)">
        <LinearGradient start={vec(0, 0)} end={vec(width, height)} colors={[theme.colors.background, "rgba(0,0,0,0.25)"]} />
      </Rect>
      <Rect x={0} y={0} width={width} height={bandHeight} color={theme.colors.accentAlt} opacity={0.45}>
        <BlurMask blur={18} style="normal" />
      </Rect>
      <Group opacity={0.9}>
        {drips.map((drip, index) => {
          const local = Math.max(0, (progress - drip.delay) / (1 - drip.delay));
          const length = drip.maxLength * Math.min(1, local);
          if (length <= 0) return null;
          const headY = bandHeight + length;
          return (
            <Group key={`drip-${index}`}>
              <Rect x={drip.x} y={bandHeight} width={drip.width} height={length} color={theme.colors.accent} opacity={0.55}>
                <BlurMask blur={12} style="normal" />
              </Rect>
              <Circle cx={drip.x + drip.width * 0.5} cy={headY} r={drip.width * 0.6} color={theme.colors.accentAlt} opacity={0.6}>
                <BlurMask blur={10} style="normal" />
              </Circle>
            </Group>
          );
        })}
      </Group>
    </Canvas>
  );
};

export default ViscousDripPull;

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
