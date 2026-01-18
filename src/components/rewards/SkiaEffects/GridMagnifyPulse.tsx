import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { BlurMask, Canvas, Circle, Group, Rect } from "@shopify/react-native-skia";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSkiaProgressNumber } from "./shared";

export const GridMagnifyPulse = ({ durationMs, onFinish }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const progress = useSkiaProgressNumber(durationMs, onFinish);
  const centerX = width * 0.5;
  const centerY = height * 0.5;

  const grid = useMemo(() => {
    const step = Math.max(28, Math.floor(Math.min(width, height) / 10));
    const vertical = Array.from({ length: Math.floor(width / step) + 2 }, (_, idx) => idx * step - step);
    const horizontal = Array.from({ length: Math.floor(height / step) + 2 }, (_, idx) => idx * step - step);
    return { vertical, horizontal, step };
  }, [height, width]);

  const scale = 0.96 + 0.08 * Math.sin(progress * Math.PI);
  const opacity = 0.12 + 0.22 * (1 - Math.abs(progress - 0.5) * 2);
  const pulseRadius = Math.min(width, height) * (0.12 + 0.18 * progress);

  return (
    <Canvas style={styles.canvas}>
      <Group origin={{ x: centerX, y: centerY }} transform={[{ scale }]} opacity={opacity}>
        {grid.vertical.map((x, index) => (
          <Rect key={`v-${index}`} x={x} y={0} width={1} height={height} color={theme.colors.accentAlt} />
        ))}
        {grid.horizontal.map((y, index) => (
          <Rect key={`h-${index}`} x={0} y={y} width={width} height={1} color={theme.colors.accentAlt} />
        ))}
      </Group>
      <Circle cx={centerX} cy={centerY} r={pulseRadius} color={theme.colors.accent}>
        <BlurMask blur={24} style="normal" />
      </Circle>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
