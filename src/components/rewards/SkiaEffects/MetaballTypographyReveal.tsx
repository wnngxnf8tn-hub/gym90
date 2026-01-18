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

const MetaballTypographyReveal = ({ durationMs, onFinish }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const progress = useSkiaProgressNumber(durationMs, onFinish);
  const centerX = width * 0.5;
  const centerY = height * 0.5;

  const dots = useMemo<Dot[]>(
    () => [
      { x: -90, y: -28, radius: 16, phase: 0.2 },
      { x: -90, y: 0, radius: 16, phase: 0.8 },
      { x: -90, y: 28, radius: 16, phase: 1.4 },
      { x: -32, y: -12, radius: 18, phase: 2.1 },
      { x: -2, y: -12, radius: 18, phase: 2.7 },
      { x: -32, y: 18, radius: 18, phase: 3.3 },
      { x: -2, y: 18, radius: 18, phase: 3.9 },
      { x: 48, y: -30, radius: 16, phase: 4.4 },
      { x: 72, y: 0, radius: 18, phase: 4.9 },
      { x: 48, y: 30, radius: 16, phase: 5.5 }
    ],
    []
  );

  const visibleCount = Math.floor(progress * dots.length);

  return (
    <Canvas style={styles.canvas}>
      <Group opacity={0.92}>
        {dots.slice(0, visibleCount).map((dot, index) => {
          const wobbleX = Math.sin(progress * Math.PI * 2 + dot.phase) * 6;
          const wobbleY = Math.cos(progress * Math.PI * 2 + dot.phase) * 6;
          const cx = centerX + dot.x + wobbleX;
          const cy = centerY + dot.y + wobbleY;
          return (
            <Circle key={`dot-${index}`} cx={cx} cy={cy} r={dot.radius} color={theme.colors.accentAlt}>
              <BlurMask blur={14} style="solid" />
            </Circle>
          );
        })}
      </Group>
    </Canvas>
  );
};

export default MetaballTypographyReveal;

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
