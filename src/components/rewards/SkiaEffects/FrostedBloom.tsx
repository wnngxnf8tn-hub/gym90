import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { BlurMask, Canvas, Circle, Group, LinearGradient, Rect, vec } from "@shopify/react-native-skia";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSkiaProgressNumber } from "./shared";

const FrostedBloom = ({ durationMs, onFinish }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const progress = useSkiaProgressNumber(durationMs, onFinish);
  const minDim = Math.min(width, height);
  const centerX = width * 0.5;
  const centerY = height * 0.5;
  const bloomRadius = minDim * (0.18 + progress * 0.35);
  const glowRadius = bloomRadius * (1.15 + 0.1 * Math.sin(progress * Math.PI * 2));

  return (
    <Canvas style={styles.canvas}>
      <Rect x={0} y={0} width={width} height={height} color="rgba(255,255,255,0.02)">
        <LinearGradient
          start={vec(0, 0)}
          end={vec(width, height)}
          colors={[theme.colors.backgroundAlt, theme.colors.background]}
        />
      </Rect>
      <Group opacity={0.5 + 0.3 * (1 - progress)}>
        <Circle cx={centerX} cy={centerY} r={glowRadius} color="rgba(255,255,255,0.2)">
          <BlurMask blur={36} style="normal" />
        </Circle>
      </Group>
      <Group opacity={0.7}>
        <Circle cx={centerX} cy={centerY} r={bloomRadius} color="rgba(255,255,255,0.12)">
          <BlurMask blur={22} style="normal" />
        </Circle>
        <Circle cx={centerX} cy={centerY} r={bloomRadius * 0.6} color={theme.colors.accentAlt} opacity={0.25}>
          <BlurMask blur={18} style="normal" />
        </Circle>
      </Group>
    </Canvas>
  );
};

export default FrostedBloom;

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
