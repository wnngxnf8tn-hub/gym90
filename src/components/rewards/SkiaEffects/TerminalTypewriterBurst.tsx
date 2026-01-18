import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { Canvas, Rect } from "@shopify/react-native-skia";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSeededRng, useSkiaProgressNumber } from "./shared";

type Glyph = {
  x: number;
  y: number;
  width: number;
  height: number;
  intensity: number;
};

const TerminalTypewriterBurst = ({ durationMs, onFinish, seed }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const rng = useSeededRng(seed);
  const progress = useSkiaProgressNumber(durationMs, onFinish);

  const glyphs = useMemo<Glyph[]>(() => {
    const columns = 16;
    const rows = 8;
    const cellW = Math.min(26, Math.floor(width / (columns + 2)));
    const cellH = Math.min(18, Math.floor(height / (rows + 3)));
    const startX = width * 0.5 - (columns * cellW) / 2;
    const startY = height * 0.5 - (rows * cellH) / 2;
    const result: Glyph[] = [];
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < columns; col += 1) {
        if (rng() < 0.55) {
          result.push({
            x: startX + col * cellW,
            y: startY + row * cellH,
            width: cellW * (0.5 + rng() * 0.45),
            height: cellH * 0.45,
            intensity: 0.2 + rng() * 0.8
          });
        }
      }
    }
    return result;
  }, [height, rng, width]);

  const visibleCount = Math.floor(progress * glyphs.length);

  return (
    <Canvas style={styles.canvas}>
      {glyphs.slice(0, visibleCount).map((glyph, index) => (
        <Rect
          key={`glyph-${index}`}
          x={glyph.x}
          y={glyph.y}
          width={glyph.width}
          height={glyph.height}
          color={theme.colors.accentAlt}
          opacity={0.2 + glyph.intensity * 0.6}
        />
      ))}
    </Canvas>
  );
};

export default TerminalTypewriterBurst;

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
