import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Canvas,
  Circle,
  Group,
  Rect
} from "@shopify/react-native-skia";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSkiaProgressNumber } from "./shared";

export const CoinBurst = ({ durationMs, onFinish }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const progress = useSkiaProgressNumber(durationMs, onFinish);
  const centerX = width * 0.5;
  const centerY = height * 0.5;
  const transform = [{ scale: 0.6 + 0.5 * progress }];
  const opacity = 0.9 * (1 - progress);
  const rays = Array.from({ length: 8 }, (_, idx) => idx);

  return (
    <Canvas style={styles.canvas}>
      <Group origin={{ x: centerX, y: centerY }} transform={transform} opacity={opacity}>
        {rays.map((ray) => {
          const rotate = (Math.PI * 2 * ray) / rays.length;
          return (
            <Group key={`ray-${ray}`} origin={{ x: centerX, y: centerY }} transform={[{ rotate }]}>
              <Rect
                x={centerX - 3}
                y={centerY - height * 0.18}
                width={6}
                height={height * 0.08}
                color={theme.colors.accentAlt}
              />
            </Group>
          );
        })}
        <Circle cx={centerX} cy={centerY} r={48} color={theme.colors.accent} />
        <Circle cx={centerX} cy={centerY} r={36} color={theme.colors.accentAlt} />
      </Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
