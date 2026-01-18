import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { Canvas, Group, Rect } from "@shopify/react-native-skia";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSeededRng, useSkiaProgressNumber } from "./shared";

type MatrixColumn = {
  x: number;
  width: number;
  speed: number;
  offset: number;
  glyphs: number[];
};

const MatrixRainColumn = ({
  column,
  progress,
  height,
  color
}: {
  column: MatrixColumn;
  progress: number;
  height: number;
  color: string;
}) => {
  const travel = (progress * column.speed + column.offset) % 1;
  const translateY = travel * height * 2 - height;

  return (
    <Group>
      {column.glyphs.map((y, index) => (
        <Rect
          key={`matrix-${column.x}-${index}`}
          x={column.x}
          y={y + translateY}
          width={column.width}
          height={column.width * 1.6}
          color={color}
          opacity={0.08 + (index % 6) * 0.08}
        />
      ))}
    </Group>
  );
};

export const MatrixSweep = ({ durationMs, onFinish, seed }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const rng = useSeededRng(seed);
  const progress = useSkiaProgressNumber(durationMs, onFinish);

  const columns = useMemo(() => {
    const columnWidth = Math.max(10, Math.floor(width / 24));
    const count = Math.max(10, Math.floor(width / columnWidth));
    const rowCount = Math.ceil(height / (columnWidth * 1.8)) + 6;
    return Array.from({ length: count }, (_, index) => {
      const glyphs = Array.from({ length: rowCount }, (_, row) => row * columnWidth * 1.8 - height);
      return {
        x: index * columnWidth + rng() * columnWidth * 0.4,
        width: columnWidth * 0.7,
        speed: 0.6 + rng() * 1.3,
        offset: rng(),
        glyphs
      };
    });
  }, [height, rng, width]);

  return (
    <Canvas style={styles.canvas}>
      {columns.map((column, index) => (
        <MatrixRainColumn
          key={`matrix-col-${index}`}
          column={column}
          progress={progress}
          height={height}
          color={theme.colors.accentAlt}
        />
      ))}
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
