import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { BlurMask, Canvas, Group, LinearGradient, Rect, vec } from "@shopify/react-native-skia";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSkiaProgressNumber } from "./shared";

const GlassRevealSweep = ({ durationMs, onFinish }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const progress = useSkiaProgressNumber(durationMs, onFinish);
  const sweepWidth = width * 0.4;
  const sweepX = -sweepWidth + progress * (width + sweepWidth * 1.4);
  const sweepOpacity = 0.25 + 0.5 * (1 - Math.abs(progress - 0.5) * 1.8);

  return (
    <Canvas style={styles.canvas}>
      <Rect x={0} y={0} width={width} height={height} color="rgba(255,255,255,0.02)">
        <LinearGradient
          start={vec(0, 0)}
          end={vec(width, height)}
          colors={["rgba(255,255,255,0.08)", theme.colors.background]}
        />
      </Rect>
      <Group opacity={0.4}>
        <Rect x={0} y={0} width={width} height={height} color="rgba(255,255,255,0.06)">
          <BlurMask blur={16} style="normal" />
        </Rect>
      </Group>
      <Group opacity={sweepOpacity}>
        <Rect x={sweepX} y={0} width={sweepWidth} height={height}>
          <LinearGradient
            start={vec(sweepX, 0)}
            end={vec(sweepX + sweepWidth, height)}
            colors={["rgba(255,255,255,0.0)", "rgba(255,255,255,0.28)", "rgba(255,255,255,0.0)"]}
          />
          <BlurMask blur={22} style="normal" />
        </Rect>
      </Group>
    </Canvas>
  );
};

export default GlassRevealSweep;

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
