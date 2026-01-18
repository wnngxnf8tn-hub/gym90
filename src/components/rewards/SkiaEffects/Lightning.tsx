import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Canvas,
  Path,
  Skia
} from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSkiaProgress } from "./shared";

export const Lightning = ({ durationMs, onFinish }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const progress = useSkiaProgress(durationMs, onFinish);

  const bolt = useMemo(() => {
    const path = Skia.Path.Make();
    path.moveTo(width * 0.55, height * 0.12);
    path.lineTo(width * 0.45, height * 0.46);
    path.lineTo(width * 0.58, height * 0.46);
    path.lineTo(width * 0.42, height * 0.85);
    path.lineTo(width * 0.6, height * 0.5);
    path.lineTo(width * 0.47, height * 0.5);
    path.close();
    return path;
  }, [height, width]);

  const opacity = useDerivedValue(() => {
    const flash = Math.sin(progress.value * Math.PI * 2);
    return 0.3 + 0.7 * Math.abs(flash);
  }, [progress]);

  return (
    <Canvas style={styles.canvas}>
      <Path path={bolt} color={theme.colors.accent} opacity={opacity} />
      <Path path={bolt} color={theme.colors.accentAlt} opacity={opacity} />
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
