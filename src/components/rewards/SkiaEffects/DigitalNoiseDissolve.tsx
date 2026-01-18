import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { Canvas, Rect } from "@shopify/react-native-skia";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSeededRng, useSkiaProgressNumber } from "./shared";

type NoiseCell = {
  x: number;
  y: number;
  size: number;
  threshold: number;
};

const DigitalNoiseDissolve = ({ durationMs, onFinish, seed }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const rng = useSeededRng(seed);
  const progress = useSkiaProgressNumber(durationMs, onFinish);

  const cells = useMemo<NoiseCell[]>(() => {
    const cols = 28;
    const rows = 16;
    const size = Math.max(10, Math.floor(Math.min(width / cols, height / rows)));
    const startX = width * 0.5 - (cols * size) / 2;
    const startY = height * 0.5 - (rows * size) / 2;
    const result: NoiseCell[] = [];
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        result.push({
          x: startX + col * size,
          y: startY + row * size,
          size,
          threshold: rng()
        });
      }
    }
    return result;
  }, [height, rng, width]);

  return (
    <Canvas style={styles.canvas}>
      {cells.map((cell, index) => {
        const fade = progress - cell.threshold;
        const opacity = fade <= 0 ? 0.7 : Math.max(0, 0.7 - fade * 2.4);
        if (opacity <= 0) return null;
        return (
          <Rect
            key={`noise-${index}`}
            x={cell.x}
            y={cell.y}
            width={cell.size}
            height={cell.size}
            color={theme.colors.accentAlt}
            opacity={opacity}
          />
        );
      })}
    </Canvas>
  );
};

export default DigitalNoiseDissolve;

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
