import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Canvas,
  Group,
  LinearGradient,
  Path,
  Skia,
  vec
} from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSkiaProgress } from "./shared";

export const RibbonSweep = ({ durationMs, onFinish }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const progress = useSkiaProgress(durationMs, onFinish);

  const ribbonPaths = useMemo(() => {
    const createRibbon = (offsetY: number) => {
      const path = Skia.Path.Make();
      path.moveTo(-width * 0.2, height * 0.3 + offsetY);
      path.cubicTo(width * 0.1, height * 0.2 + offsetY, width * 0.4, height * 0.45 + offsetY, width * 0.8, height * 0.35 + offsetY);
      path.cubicTo(width * 1.1, height * 0.25 + offsetY, width * 1.2, height * 0.5 + offsetY, width * 1.4, height * 0.4 + offsetY);
      return path;
    };
    return [createRibbon(-40), createRibbon(20), createRibbon(80)];
  }, [width, height]);

  const translate = useDerivedValue(() => {
    const x = -width * 0.3 + progress.value * width * 0.6;
    return [{ translateX: x }];
  }, [progress, width]);
  const opacity = useDerivedValue(
    () => 0.1 + 0.9 * (1 - Math.abs(progress.value - 0.5) * 1.6),
    [progress]
  );

  return (
    <Canvas style={styles.canvas}>
      <Group transform={translate} opacity={opacity}>
        {ribbonPaths.map((path, index) => (
          <Path
            key={`ribbon-${index}`}
            path={path}
            style="stroke"
            strokeWidth={24 - index * 4}
            color={theme.colors.accent}
          >
            <LinearGradient
              start={vec(0, 0)}
              end={vec(width, height)}
              colors={[theme.colors.accentAlt, theme.colors.accent, theme.colors.accentAlt]}
            />
          </Path>
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
