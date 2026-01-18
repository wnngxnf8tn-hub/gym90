import { useEffect, useMemo, useState } from "react";
import {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { createRng } from "../../../utils/random";

export type SkiaEffectProps = {
  durationMs: number;
  onFinish?: () => void;
  seed?: number;
};

export const useSkiaProgress = (durationMs: number, onFinish?: () => void) => {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: durationMs, easing: Easing.out(Easing.cubic) });
    const timer = onFinish ? setTimeout(onFinish, durationMs) : null;
    return () => {
      cancelAnimation(progress);
      if (timer) clearTimeout(timer);
    };
  }, [durationMs, onFinish, progress]);
  return progress;
};

export const useSkiaProgressNumber = (durationMs: number, onFinish?: () => void) => {
  const progress = useSharedValue(0);
  const [progressNumber, setProgressNumber] = useState(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: durationMs, easing: Easing.out(Easing.cubic) });
    const timer = onFinish ? setTimeout(onFinish, durationMs) : null;
    return () => {
      cancelAnimation(progress);
      if (timer) clearTimeout(timer);
    };
  }, [durationMs, onFinish, progress]);

  useAnimatedReaction(
    () => progress.value,
    (value, prev) => {
      if (value === prev) return;
      runOnJS(setProgressNumber)(value);
    },
    []
  );

  return progressNumber;
};

export const useSeededRng = (seed?: number) => {
  return useMemo(() => createRng(seed), [seed]);
};
