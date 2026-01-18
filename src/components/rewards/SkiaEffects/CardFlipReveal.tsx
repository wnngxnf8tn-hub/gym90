import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { Canvas, Group, Rect, RoundedRect } from "@shopify/react-native-skia";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSkiaProgressNumber } from "./shared";

export const CardFlipReveal = ({ durationMs, onFinish }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const progress = useSkiaProgressNumber(durationMs, onFinish);
  const cardWidth = Math.min(width * 0.64, 300);
  const cardHeight = Math.min(height * 0.26, 180);
  const cardX = width * 0.5 - cardWidth * 0.5;
  const cardY = height * 0.5 - cardHeight * 0.5;
  const origin = { x: width * 0.5, y: height * 0.5 };

  const scaleX = Math.abs(Math.cos(progress * Math.PI));
  const frontOpacity = progress < 0.5 ? 1 : 0;
  const backOpacity = progress >= 0.5 ? 1 : 0;

  return (
    <Canvas style={styles.canvas}>
      <Group origin={origin} transform={[{ scaleX }]}>
        <Group opacity={frontOpacity}>
          <RoundedRect x={cardX} y={cardY} width={cardWidth} height={cardHeight} r={18} color={theme.colors.cardAlt} />
          <Rect
            x={cardX + 24}
            y={cardY + 36}
            width={cardWidth - 48}
            height={6}
            color={theme.colors.muted}
          />
          <Rect
            x={cardX + 24}
            y={cardY + 56}
            width={cardWidth * 0.45}
            height={6}
            color={theme.colors.muted}
          />
        </Group>
        <Group opacity={backOpacity}>
          <RoundedRect x={cardX} y={cardY} width={cardWidth} height={cardHeight} r={18} color={theme.colors.accent} />
          <Rect
            x={cardX + 24}
            y={cardY + 36}
            width={cardWidth - 48}
            height={8}
            color={theme.colors.buttonText}
          />
          <Rect
            x={cardX + 24}
            y={cardY + 58}
            width={cardWidth * 0.35}
            height={8}
            color={theme.colors.buttonText}
          />
        </Group>
      </Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
