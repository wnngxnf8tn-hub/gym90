import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { Canvas, Circle, LinearGradient, RadialGradient, Rect, vec } from "@shopify/react-native-skia";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSkiaProgressNumber } from "./shared";

const SoftSpotlightSweep = ({ durationMs, onFinish }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const progress = useSkiaProgressNumber(durationMs, onFinish);
  const minDim = Math.min(width, height);
  const cx = width * (0.2 + 0.6 * progress);
  const cy = height * (0.35 + 0.2 * Math.sin(progress * Math.PI * 2));
  const radius = minDim * (0.55 + 0.05 * Math.sin(progress * Math.PI));
  const glowOpacity = 0.2 + 0.5 * (1 - Math.abs(progress - 0.5) * 1.6);

  return (
    <Canvas style={styles.canvas}>
      <Rect x={0} y={0} width={width} height={height} color="rgba(0,0,0,0.25)">
        <LinearGradient
          start={vec(0, 0)}
          end={vec(width, height)}
          colors={[theme.colors.backgroundAlt, theme.colors.background]}
        />
      </Rect>
      <Circle cx={cx} cy={cy} r={radius} opacity={glowOpacity}>
        <RadialGradient c={vec(cx, cy)} r={radius} colors={["rgba(255,255,255,0.28)", "rgba(255,255,255,0.04)", "transparent"]} />
      </Circle>
      <Circle cx={width * 0.5} cy={height * 0.55} r={minDim * 0.2} opacity={0.35}>
        <RadialGradient c={vec(width * 0.5, height * 0.55)} r={minDim * 0.2} colors={[theme.colors.accentAlt, "transparent"]} />
      </Circle>
    </Canvas>
  );
};

export default SoftSpotlightSweep;

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
