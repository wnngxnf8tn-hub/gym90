import React, { useMemo } from "react";
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

const HologramFlicker = ({ durationMs, onFinish }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const progress = useSkiaProgressNumber(durationMs, onFinish);
  const cardWidth = Math.min(width * 0.7, 320);
  const cardHeight = Math.min(height * 0.36, 240);
  const cardX = width * 0.5 - cardWidth * 0.5;
  const cardY = height * 0.5 - cardHeight * 0.5;

  const scanlines = useMemo(
    () => Array.from({ length: 10 }, (_, index) => cardY + (index / 10) * cardHeight),
    [cardHeight, cardY]
  );

  const flicker = 0.35 + 0.45 * Math.abs(Math.sin(progress * Math.PI * 5));
  const sweep = -cardWidth * 0.4 + progress * cardWidth * 1.4;

  return (
    <Canvas style={styles.canvas}>
      <RoundedRect x={cardX} y={cardY} width={cardWidth} height={cardHeight} r={24} color="rgba(255,255,255,0.08)">
        <BlurMask blur={16} style="normal" />
        <LinearGradient
          start={vec(cardX, cardY)}
          end={vec(cardX + cardWidth, cardY + cardHeight)}
          colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0.02)"]}
        />
      </RoundedRect>
      <Group opacity={flicker}>
        {scanlines.map((y, index) => (
          <Rect key={`line-${index}`} x={cardX} y={y} width={cardWidth} height={2} color={theme.colors.accentAlt} />
        ))}
      </Group>
      <Group opacity={0.6}>
        <Rect x={cardX + sweep} y={cardY} width={cardWidth * 0.2} height={cardHeight} color={theme.colors.accent} />
      </Group>
    </Canvas>
  );
};

export default HologramFlicker;

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
