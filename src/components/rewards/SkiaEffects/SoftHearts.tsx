import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Canvas,
  Group,
  Path,
  Skia
} from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSeededRng, useSkiaProgress } from "./shared";

type Heart = {
  x: number;
  y: number;
  size: number;
  drift: number;
  delay: number;
};

const HeartSprite = ({
  heart,
  progress,
  color,
  path
}: {
  heart: Heart;
  progress: ReturnType<typeof useSkiaProgress>;
  color: string;
  path: ReturnType<typeof Skia.Path.Make>;
}) => {
  const { x, y, size, drift, delay } = heart;
  const transform = useDerivedValue(() => {
    const local = Math.max(0, Math.min(1, (progress.value - delay) / (1 - delay)));
    return [
      { translateX: x },
      { translateY: y - drift * local },
      { scale: size / 24 }
    ];
  }, [delay, drift, progress, size, x, y]);
  return (
    <Group transform={transform}>
      <Path path={path} color={color} />
    </Group>
  );
};

export const SoftHearts = ({ durationMs, onFinish, seed }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const rng = useSeededRng(seed);
  const progress = useSkiaProgress(durationMs, onFinish);

  const heartPath = useMemo(() => {
    const path = Skia.Path.Make();
    path.moveTo(0, 8);
    path.cubicTo(0, -4, 16, -4, 16, 8);
    path.cubicTo(16, 16, 8, 22, 8, 26);
    path.cubicTo(8, 22, 0, 16, 0, 8);
    path.close();
    return path;
  }, []);

  const hearts = useMemo(
    () =>
      Array.from({ length: 12 }, () => ({
        x: width * (0.2 + rng() * 0.6),
        y: height * (0.3 + rng() * 0.4),
        size: 10 + rng() * 16,
        drift: 40 + rng() * 80,
        delay: rng() * 0.5
      })),
    [height, rng, width]
  );

  const opacity = useDerivedValue(() => 0.2 + 0.8 * (1 - progress.value), [progress]);

  return (
    <Canvas style={styles.canvas}>
      <Group opacity={opacity}>
        {hearts.map((heart, index) => (
          <HeartSprite key={`heart-${index}`} heart={heart} progress={progress} color={theme.colors.accent} path={heartPath} />
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
