import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { BlurMask, Canvas, Group, LinearGradient, Rect, vec } from "@shopify/react-native-skia";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSkiaProgressNumber } from "./shared";

const GlowEdgeTrace = ({ durationMs, onFinish }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const progress = useSkiaProgressNumber(durationMs, onFinish);
  const edgeThickness = Math.max(6, Math.min(width, height) * 0.015);
  const traceLength = Math.min(width, height) * 0.18;
  const perimeter = 2 * (width + height);
  const travel = progress * perimeter;

  let traceX = 0;
  let traceY = 0;
  let traceW = 0;
  let traceH = 0;
  let horizontal = true;

  if (travel < width) {
    traceX = Math.max(0, travel - traceLength * 0.5);
    traceY = 0;
    traceW = traceLength;
    traceH = edgeThickness;
    horizontal = true;
  } else if (travel < width + height) {
    traceX = width - edgeThickness;
    traceY = Math.max(0, travel - width - traceLength * 0.5);
    traceW = edgeThickness;
    traceH = traceLength;
    horizontal = false;
  } else if (travel < width * 2 + height) {
    traceX = Math.max(0, width - (travel - width - height) - traceLength * 0.5);
    traceY = height - edgeThickness;
    traceW = traceLength;
    traceH = edgeThickness;
    horizontal = true;
  } else {
    traceX = 0;
    traceY = Math.max(0, height - (travel - width * 2 - height) - traceLength * 0.5);
    traceW = edgeThickness;
    traceH = traceLength;
    horizontal = false;
  }

  return (
    <Canvas style={styles.canvas}>
      <Group opacity={0.5}>
        <Rect x={0} y={0} width={width} height={edgeThickness} color={theme.colors.accentAlt} opacity={0.25} />
        <Rect x={0} y={height - edgeThickness} width={width} height={edgeThickness} color={theme.colors.accentAlt} opacity={0.25} />
        <Rect x={0} y={0} width={edgeThickness} height={height} color={theme.colors.accent} opacity={0.2} />
        <Rect x={width - edgeThickness} y={0} width={edgeThickness} height={height} color={theme.colors.accent} opacity={0.2} />
      </Group>
      <Rect x={traceX} y={traceY} width={traceW} height={traceH} opacity={0.7}>
        <LinearGradient
          start={vec(traceX, traceY)}
          end={horizontal ? vec(traceX + traceW, traceY) : vec(traceX, traceY + traceH)}
          colors={["rgba(255,255,255,0.0)", theme.colors.accentAlt, "rgba(255,255,255,0.0)"]}
        />
        <BlurMask blur={18} style="normal" />
      </Rect>
    </Canvas>
  );
};

export default GlowEdgeTrace;

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
