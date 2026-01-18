import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { Canvas, Group, LinearGradient, Rect, vec } from "@shopify/react-native-skia";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSkiaProgressNumber } from "./shared";

const PrismaticRefraction = ({ durationMs, onFinish }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const progress = useSkiaProgressNumber(durationMs, onFinish);
  const bandWidth = width * 0.7;
  const sweepX = -bandWidth * 0.6 + progress * width * 1.6;
  const shimmer = 0.4 + 0.6 * Math.sin(progress * Math.PI * 2);

  return (
    <Canvas style={styles.canvas}>
      <Rect x={0} y={0} width={width} height={height} color="rgba(0,0,0,0.18)">
        <LinearGradient
          start={vec(0, 0)}
          end={vec(width, height)}
          colors={[theme.colors.backgroundAlt, theme.colors.background]}
        />
      </Rect>
      <Group opacity={0.7 * shimmer}>
        <Rect x={sweepX - bandWidth * 0.06} y={-height * 0.1} width={bandWidth} height={height * 1.2} opacity={0.5}>
          <LinearGradient
            start={vec(sweepX, 0)}
            end={vec(sweepX + bandWidth, height)}
            colors={["rgba(255,120,180,0.05)", "rgba(255,180,110,0.22)", "rgba(255,255,255,0.02)"]}
          />
        </Rect>
        <Rect x={sweepX} y={-height * 0.1} width={bandWidth} height={height * 1.2} opacity={0.55}>
          <LinearGradient
            start={vec(sweepX, 0)}
            end={vec(sweepX + bandWidth, height)}
            colors={["rgba(120,220,255,0.04)", theme.colors.accentAlt, "rgba(255,255,255,0.02)"]}
          />
        </Rect>
        <Rect x={sweepX + bandWidth * 0.05} y={-height * 0.1} width={bandWidth} height={height * 1.2} opacity={0.45}>
          <LinearGradient
            start={vec(sweepX, 0)}
            end={vec(sweepX + bandWidth, height)}
            colors={["rgba(255,255,255,0.02)", theme.colors.accent, "rgba(140,255,200,0.06)"]}
          />
        </Rect>
      </Group>
    </Canvas>
  );
};

export default PrismaticRefraction;

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
