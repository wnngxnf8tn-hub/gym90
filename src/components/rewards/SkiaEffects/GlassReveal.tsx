import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  BlurMask,
  Canvas,
  Group,
  LinearGradient,
  Rect,
  RoundedRect,
  vec
} from "@shopify/react-native-skia";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSkiaProgressNumber } from "./shared";

export const GlassReveal = ({ durationMs, onFinish }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const progress = useSkiaProgressNumber(durationMs, onFinish);
  const cardWidth = Math.min(width * 0.72, 320);
  const cardHeight = Math.min(height * 0.32, 220);
  const cardX = width * 0.5 - cardWidth * 0.5;
  const cardY = height * 0.5 - cardHeight * 0.5;

  const sweepX = -cardWidth * 0.6 + progress * cardWidth * 1.6;
  const glowOpacity = 0.2 + 0.5 * (1 - Math.abs(progress - 0.5) * 1.8);

  return (
    <Canvas style={styles.canvas}>
      <RoundedRect x={cardX} y={cardY} width={cardWidth} height={cardHeight} r={24} color="rgba(255,255,255,0.08)">
        <BlurMask blur={18} style="normal" />
        <LinearGradient
          start={vec(cardX, cardY)}
          end={vec(cardX + cardWidth, cardY + cardHeight)}
          colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0.02)"]}
        />
      </RoundedRect>
      <Group opacity={glowOpacity} transform={[{ translateX: sweepX }]}>
        <Rect
          x={cardX - cardWidth * 0.2}
          y={cardY}
          width={cardWidth * 0.2}
          height={cardHeight}
          color={theme.colors.accentAlt}
        >
          <BlurMask blur={24} style="normal" />
        </Rect>
      </Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
