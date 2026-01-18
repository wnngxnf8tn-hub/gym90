import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../theme/ThemeProvider";

export const ScreenBackground = () => {
  const theme = useTheme();

  return (
    <View pointerEvents="none" style={[styles.base, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.background, theme.colors.backgroundAlt]}
        style={styles.gradient}
      />
      <View
        style={[
          styles.glow,
          {
            backgroundColor: theme.colors.glow
          }
        ]}
      />
      <View
        style={[
          styles.panel,
          {
            backgroundColor: theme.colors.backgroundAlt
          }
        ]}
      />
      {theme.variant === "softPastel" ? (
        <>
          <View style={[styles.blob, styles.blobLeft, { backgroundColor: theme.colors.accentAlt }]} />
          <View style={[styles.blob, styles.blobRight, { backgroundColor: theme.colors.accent }]} />
        </>
      ) : null}
      {theme.variant === "premiumDark" ? <View style={styles.dust} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    ...StyleSheet.absoluteFillObject
  },
  gradient: {
    ...StyleSheet.absoluteFillObject
  },
  glow: {
    position: "absolute",
    top: -120,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.8
  },
  panel: {
    position: "absolute",
    bottom: -120,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    opacity: 0.6
  },
  blob: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.12
  },
  blobLeft: {
    left: -40,
    top: 140
  },
  blobRight: {
    right: -40,
    bottom: 100
  },
  dust: {
    position: "absolute",
    top: 40,
    right: 80,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.25)"
  }
});
