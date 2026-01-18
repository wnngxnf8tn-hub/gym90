import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Canvas,
  Group,
  Rect
} from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSkiaProgress } from "./shared";

export const Starburst = ({ durationMs, onFinish }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const progress = useSkiaProgress(durationMs, onFinish);
  const rays = Array.from({ length: 16 }, (_, idx) => idx);
  const centerX = width * 0.5;
  const centerY = height * 0.5;
  const transform = useDerivedValue(() => [{ scale: 0.6 + 0.6 * progress.value }], [progress]);
  const opacity = useDerivedValue(() => 0.9 * (1 - progress.value), [progress]);

  return (
    <Canvas style={styles.canvas}>
      <Group origin={{ x: centerX, y: centerY }} transform={transform} opacity={opacity}>
        {rays.map((ray) => {
          const rotate = (Math.PI * 2 * ray) / rays.length;
          return (
            <Group key={`ray-${ray}`} origin={{ x: centerX, y: centerY }} transform={[{ rotate }]}>
              <Rect
                x={centerX - 4}
                y={centerY - height * 0.5}
                width={8}
                height={height * 0.35}
                color={theme.colors.accentAlt}
              />
            </Group>
          );
        })}
      </Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
