import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Canvas,
  Group,
  Rect
} from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSeededRng, useSkiaProgress } from "./shared";

type ConfettiPiece = {
  x: number;
  size: number;
  delay: number;
  colorIndex: number;
};

const ConfettiPieceSprite = ({
  piece,
  progress,
  height,
  color
}: {
  piece: ConfettiPiece;
  progress: ReturnType<typeof useSkiaProgress>;
  height: number;
  color: string;
}) => {
  const { x, size, delay } = piece;
  const y = useDerivedValue(() => {
    const local = Math.max(0, Math.min(1, (progress.value - delay) / (1 - delay)));
    return -height * 0.2 + local * height * 1.3;
  }, [delay, height, progress]);

  return <Rect x={x} y={y} width={size} height={size * 0.6} color={color} />;
};

export const ConfettiSkia = ({ durationMs, onFinish, seed }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const rng = useSeededRng(seed);
  const progress = useSkiaProgress(durationMs, onFinish);
  const colors = [theme.colors.accentAlt, theme.colors.accent, theme.colors.text];

  const pieces = useMemo(
    () =>
      Array.from({ length: 50 }, () => ({
        x: rng() * width,
        size: 6 + rng() * 6,
        delay: rng() * 0.4,
        colorIndex: Math.floor(rng() * colors.length)
      })),
    [colors.length, rng, width]
  );

  const opacity = useDerivedValue(() => 0.2 + 0.8 * (1 - progress.value), [progress]);

  return (
    <Canvas style={styles.canvas}>
      <Group opacity={opacity}>
        {pieces.map((piece, index) => (
          <ConfettiPieceSprite
            key={`confetti-${index}`}
            piece={piece}
            progress={progress}
            height={height}
            color={colors[piece.colorIndex]}
          />
        ))}
      </Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
