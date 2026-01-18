import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Canvas,
  Circle,
  RadialGradient,
  vec
} from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSkiaProgress } from "./shared";

export const GlowBurst = ({ durationMs, onFinish }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const progress = useSkiaProgress(durationMs, onFinish);
  const radius = useDerivedValue(() => width * 0.1 + progress.value * width * 0.55, [progress, width]);
  const opacity = useDerivedValue(() => 0.9 * (1 - progress.value), [progress]);
  const center = vec(width * 0.5, height * 0.5);

  return (
    <Canvas style={styles.canvas}>
      <Circle cx={center.x} cy={center.y} r={radius} opacity={opacity}>
        <RadialGradient
          c={center}
          r={width * 0.7}
          colors={[theme.colors.accentAlt, theme.colors.accent, "transparent"]}
        />
      </Circle>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
