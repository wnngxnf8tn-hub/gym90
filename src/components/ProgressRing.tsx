import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  withSequence,
  Easing
} from "react-native-reanimated";
import { useTheme } from "../theme/ThemeProvider";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type ProgressRingProps = {
  progress: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  subLabel?: string;
  snapTrigger?: number;
};

export const ProgressRing = ({
  progress,
  size = 240,
  strokeWidth = 14,
  label,
  subLabel,
  snapTrigger = 0
}: ProgressRingProps) => {
  const theme = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedProgress = useSharedValue(progress);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [progress, animatedProgress]);

  useEffect(() => {
    if (!snapTrigger) return;
    const overshoot = Math.min(1, progress + 0.04);
    animatedProgress.value = withSequence(
      withTiming(overshoot, { duration: 180, easing: Easing.out(Easing.cubic) }),
      withTiming(progress, { duration: 420, easing: Easing.out(Easing.exp) })
    );
  }, [snapTrigger, progress, animatedProgress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
    strokeLinecap: "butt"
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.ringTrack}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.ringProgress}
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          fill="transparent"
        />
      </Svg>
      <View style={styles.labelWrap}>
        <Text style={[styles.label, { color: theme.colors.text, fontFamily: theme.typography.display }]}>
          {label}
        </Text>
        {subLabel ? (
          <Text style={[styles.subLabel, { color: theme.colors.muted, fontFamily: theme.typography.body }]}>
            {subLabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center"
  },
  labelWrap: {
    position: "absolute",
    alignItems: "center"
  },
  label: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 0.4
  },
  subLabel: {
    marginTop: 4,
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: "uppercase"
  }
});
