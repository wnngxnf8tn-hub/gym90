import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "../theme/ThemeProvider";

export const GlassCard = ({
  children,
  style
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) => {
  const theme = useTheme();
  const isDark = theme.variant === "premiumDark" || theme.variant === "gamifiedNeon";

  if (!isDark) {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }, style]}>
        <View style={styles.inner}>{children}</View>
      </View>
    );
  }

  return (
    <BlurView intensity={30} tint="dark" style={[styles.card, { borderColor: theme.colors.border }, style]}>
      <View style={[styles.inner, { backgroundColor: theme.colors.card }]}>{children}</View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  inner: {
    padding: 16
  }
});
