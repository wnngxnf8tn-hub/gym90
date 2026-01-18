import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { Canvas, Group, Rect } from "@shopify/react-native-skia";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSeededRng, useSkiaProgressNumber } from "./shared";

type RainGlyphColumn = {
  x: number;
  width: number;
  speed: number;
  offset: number;
  glyphs: number[];
};

type RainLayer = {
  columns: RainGlyphColumn[];
  color: string;
  opacity: number;
};

const buildLayer = (
  width: number,
  height: number,
  density: number,
  speedRange: [number, number],
  rng: () => number
): RainGlyphColumn[] => {
  const columnWidth = Math.max(10, Math.floor(width / density));
  const count = Math.max(10, Math.floor(width / columnWidth));
  const rowCount = Math.ceil(height / (columnWidth * 1.9)) + 6;
  return Array.from({ length: count }, (_, index) => {
    const glyphs = Array.from({ length: rowCount }, (_, row) => row * columnWidth * 1.9 - height);
    const speed = speedRange[0] + rng() * (speedRange[1] - speedRange[0]);
    return {
      x: index * columnWidth + rng() * columnWidth * 0.4,
      width: columnWidth * 0.6,
      speed,
      offset: rng(),
      glyphs
    };
  });
};

const MatrixLayer = ({
  columns,
  progress,
  height,
  color,
  opacity
}: {
  columns: RainGlyphColumn[];
  progress: number;
  height: number;
  color: string;
  opacity: number;
}) => {
  return (
    <Group opacity={opacity}>
      {columns.map((column, index) => {
        const travel = (progress * column.speed + column.offset) % 1;
        const translateY = travel * height * 2 - height;
        return (
          <Group key={`matrix-layer-${index}`}>
            {column.glyphs.map((y, glyphIndex) => (
              <Rect
                key={`matrix-${index}-${glyphIndex}`}
                x={column.x}
                y={y + translateY}
                width={column.width}
                height={column.width * 1.6}
                color={color}
                opacity={0.08 + (glyphIndex % 6) * 0.08}
              />
            ))}
          </Group>
        );
      })}
    </Group>
  );
};

const MatrixRainDepthSweep = ({ durationMs, onFinish, seed }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const rng = useSeededRng(seed);
  const progress = useSkiaProgressNumber(durationMs, onFinish);

  const layers = useMemo<RainLayer[]>(() => {
    return [
      {
        columns: buildLayer(width, height, 18, [0.5, 0.9], rng),
        color: theme.colors.accentAlt,
        opacity: 0.35
      },
      {
        columns: buildLayer(width, height, 22, [0.8, 1.3], rng),
        color: theme.colors.accent,
        opacity: 0.55
      },
      {
        columns: buildLayer(width, height, 26, [1.1, 1.7], rng),
        color: theme.colors.accentAlt,
        opacity: 0.7
      }
    ];
  }, [height, rng, theme.colors.accent, theme.colors.accentAlt, width]);

  return (
    <Canvas style={styles.canvas}>
      {layers.map((layer, index) => (
        <MatrixLayer
          key={`matrix-depth-${index}`}
          columns={layer.columns}
          progress={progress}
          height={height}
          color={layer.color}
          opacity={layer.opacity}
        />
      ))}
    </Canvas>
  );
};

export default MatrixRainDepthSweep;

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
