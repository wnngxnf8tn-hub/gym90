import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useTheme } from "../theme/ThemeProvider";

type CheckToggleProps = {
  label: string;
  value: boolean;
  onToggle: () => void;
  note?: string;
  disabled?: boolean;
};

export const CheckToggle = ({ label, value, onToggle, note, disabled }: CheckToggleProps) => {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        scale.value = withSpring(0.98, { damping: 15, stiffness: 220 }, () => {
          scale.value = withSpring(1, { damping: 18, stiffness: 180 });
        });
        onToggle();
      }}
      style={({ pressed }) => [
        styles.pressable,
        {
          opacity: disabled ? 0.5 : pressed ? 0.92 : 1
        }
      ]}
    >
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: value ? theme.colors.cardAlt : theme.colors.card,
            borderColor: value ? theme.colors.accent : theme.colors.border,
            shadowColor: theme.colors.glow
          },
          animatedStyle
        ]}
      >
        <View>
          <Text style={[styles.label, { color: theme.colors.text, fontFamily: theme.typography.heading }]}>
            {label}
          </Text>
          {note ? (
            <Text style={[styles.note, { color: theme.colors.muted, fontFamily: theme.typography.body }]}>
              {note}
            </Text>
          ) : null}
        </View>
        <View
          style={[
            styles.indicator,
            {
              backgroundColor: value ? theme.colors.accent : "transparent",
              borderColor: value ? theme.colors.accent : theme.colors.border
            }
          ]}
        >
          {value ? (
            <Text style={[styles.check, { color: theme.colors.background }]}>✓</Text>
          ) : null}
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    width: "100%"
  },
  container: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2
  },
  label: {
    fontSize: 16,
    fontWeight: "600"
  },
  note: {
    marginTop: 4,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.7
  },
  indicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  check: {
    fontSize: 16,
    fontWeight: "700"
  }
});
