import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { BlurMask, Canvas, Circle, Group } from "@shopify/react-native-skia";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSkiaProgressNumber } from "./shared";

type Dot = {
  x: number;
  y: number;
  radius: number;
  phase: number;
};

const LetterDot = ({
  dot,
  progress,
  centerX,
  centerY,
  color
}: {
  dot: Dot;
  progress: number;
  centerX: number;
  centerY: number;
  color: string;
}) => {
  const wobbleX = Math.sin(progress * Math.PI * 2 + dot.phase) * 6;
  const wobbleY = Math.cos(progress * Math.PI * 2 + dot.phase) * 6;
  const cx = centerX + dot.x + wobbleX;
  const cy = centerY + dot.y + wobbleY;
  return (
    <Circle cx={cx} cy={cy} r={dot.radius} color={color}>
      <BlurMask blur={14} style="solid" />
    </Circle>
  );
};

export const TypographyMetaball = ({ durationMs, onFinish }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const progress = useSkiaProgressNumber(durationMs, onFinish);
  const centerX = width * 0.5;
  const centerY = height * 0.5;

  const dots = useMemo<Dot[]>(
    () => [
      { x: -70, y: -24, radius: 16, phase: 0.2 },
      { x: -70, y: 0, radius: 16, phase: 0.8 },
      { x: -70, y: 24, radius: 16, phase: 1.4 },
      { x: -20, y: -12, radius: 18, phase: 2.1 },
      { x: 10, y: -12, radius: 18, phase: 2.7 },
      { x: -20, y: 18, radius: 18, phase: 3.3 },
      { x: 10, y: 18, radius: 18, phase: 3.9 },
      { x: 50, y: -24, radius: 16, phase: 4.4 },
      { x: 70, y: 0, radius: 18, phase: 4.9 },
      { x: 50, y: 24, radius: 16, phase: 5.5 }
    ],
    []
  );

  return (
    <Canvas style={styles.canvas}>
      <Group opacity={0.92}>
        {dots.map((dot, index) => (
          <LetterDot
            key={`dot-${index}`}
            dot={dot}
            progress={progress}
            centerX={centerX}
            centerY={centerY}
            color={theme.colors.accentAlt}
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
