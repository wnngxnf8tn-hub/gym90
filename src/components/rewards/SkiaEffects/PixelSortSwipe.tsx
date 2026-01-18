import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { Canvas, Rect } from "@shopify/react-native-skia";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSeededRng, useSkiaProgressNumber } from "./shared";

type PixelRow = {
  y: number;
  height: number;
  offset: number;
  segments: number[];
};

const PixelSortSwipe = ({ durationMs, onFinish, seed }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const rng = useSeededRng(seed);
  const progress = useSkiaProgressNumber(durationMs, onFinish);

  const rows = useMemo<PixelRow[]>(() => {
    const count = 10;
    const rowHeight = Math.max(10, Math.floor(height / (count + 4)));
    const startY = height * 0.5 - (count * rowHeight) / 2;
    return Array.from({ length: count }, (_, index) => ({
      y: startY + index * rowHeight,
      height: rowHeight * 0.7,
      offset: (rng() - 0.5) * width * 0.2,
      segments: Array.from({ length: 7 }, () => 0.2 + rng() * 0.8)
    }));
  }, [height, rng, width]);

  const baseShift = -width * 0.35 + progress * width * 0.7;

  return (
    <Canvas style={styles.canvas}>
      {rows.map((row, rowIndex) => {
        const wave = Math.sin(progress * Math.PI * 2 + rowIndex * 0.4) * width * 0.06;
        const shift = baseShift + row.offset + wave;
        const segmentWidth = width * 0.12;
        return row.segments.map((intensity, index) => (
          <Rect
            key={`row-${rowIndex}-${index}`}
            x={shift + index * segmentWidth}
            y={row.y}
            width={segmentWidth * 0.85}
            height={row.height}
            color={index % 2 === 0 ? theme.colors.accent : theme.colors.accentAlt}
            opacity={0.2 + intensity * 0.6}
          />
        ));
      })}
    </Canvas>
  );
};

export default PixelSortSwipe;

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
