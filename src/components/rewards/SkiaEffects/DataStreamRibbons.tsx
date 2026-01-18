import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import { useTheme } from "../../../theme/ThemeProvider";
import { SkiaEffectProps, useSeededRng, useSkiaProgressNumber } from "./shared";

type RibbonDef = {
  offset: number;
  amplitude: number;
  phase: number;
  stroke: number;
};

const buildRibbonPath = (width: number, height: number, def: RibbonDef, progress: number) => {
  const path = Skia.Path.Make();
  const centerY = height * 0.5 + def.offset;
  const wave = def.amplitude;
  const shift = (progress * 2 - 1) * width * 0.2;
  path.moveTo(-width * 0.1 + shift, centerY);
  const points = 6;
  for (let i = 1; i <= points; i += 1) {
    const x = (width / points) * i + shift;
    const t = (i / points) * Math.PI * 2 + def.phase + progress * Math.PI;
    const y = centerY + Math.sin(t) * wave;
    path.lineTo(x, y);
  }
  return path;
};

const DataStreamRibbons = ({ durationMs, onFinish, seed }: SkiaEffectProps) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const rng = useSeededRng(seed);
  const progress = useSkiaProgressNumber(durationMs, onFinish);

  const ribbons = useMemo<RibbonDef[]>(
    () =>
      Array.from({ length: 3 }, (_, index) => ({
        offset: (index - 1) * 36 + (rng() - 0.5) * 18,
        amplitude: 18 + rng() * 22,
        phase: rng() * Math.PI * 2,
        stroke: 3 + rng() * 2
      })),
    [rng]
  );

  return (
    <Canvas style={styles.canvas}>
      {ribbons.map((def, index) => {
        const path = buildRibbonPath(width, height, def, progress);
        return (
          <Path
            key={`ribbon-${index}`}
            path={path}
            color={index % 2 === 0 ? theme.colors.accentAlt : theme.colors.accent}
            style="stroke"
            strokeWidth={def.stroke}
            opacity={0.5 + index * 0.15}
          />
        );
      })}
    </Canvas>
  );
};

export default DataStreamRibbons;

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject
  }
});
