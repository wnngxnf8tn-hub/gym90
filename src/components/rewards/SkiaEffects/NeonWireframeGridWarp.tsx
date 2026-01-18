import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { Canvas, Group, Rect } from "@shopify/react-native-skia";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSkiaProgressNumber } from "./shared";

const NeonWireframeGridWarp = ({ durationMs, onFinish }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const progress = useSkiaProgressNumber(durationMs, onFinish);

  const grid = useMemo(() => {
    const step = Math.max(26, Math.floor(Math.min(width, height) / 9));
    const vertical = Array.from({ length: Math.floor(width / step) + 2 }, (_, idx) => idx * step - step);
    const horizontal = Array.from({ length: Math.floor(height / step) + 2 }, (_, idx) => idx * step - step);
    return { vertical, horizontal, step };
  }, [height, width]);

  return (
    <Canvas style={styles.canvas}>
      <Group opacity={0.6}>
        {grid.vertical.map((x, index) => {
          const wobble = Math.sin(progress * Math.PI * 2 + index * 0.4) * grid.step * 0.25;
          return (
            <Rect
              key={`v-${index}`}
              x={x + wobble}
              y={0}
              width={1}
              height={height}
              color={theme.colors.accentAlt}
              opacity={0.15 + 0.2 * Math.sin(progress * Math.PI + index * 0.3)}
            />
          );
        })}
        {grid.horizontal.map((y, index) => {
          const wobble = Math.cos(progress * Math.PI * 2 + index * 0.35) * grid.step * 0.2;
          return (
            <Rect
              key={`h-${index}`}
              x={0}
              y={y + wobble}
              width={width}
              height={1}
              color={theme.colors.accent}
              opacity={0.12 + 0.18 * Math.cos(progress * Math.PI + index * 0.2)}
            />
          );
        })}
      </Group>
    </Canvas>
  );
};

export default NeonWireframeGridWarp;

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
