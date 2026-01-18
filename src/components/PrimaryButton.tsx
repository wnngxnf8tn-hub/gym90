import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useTheme } from "../theme/ThemeProvider";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  textColor?: string;
  textColorDisabled?: string;
};

export const PrimaryButton = ({ label, onPress, disabled, textColor, textColorDisabled }: PrimaryButtonProps) => {
  const theme = useTheme();
  const resolvedTextColor = disabled
    ? textColorDisabled ?? theme.colors.buttonTextDisabled
    : textColor ?? theme.colors.buttonText;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: disabled ? theme.colors.cardAlt : theme.colors.accent,
          opacity: pressed ? 0.92 : 1,
          shadowColor: theme.colors.glow
        }
      ]}
    >
      <Text style={[styles.label, { color: resolvedTextColor, fontFamily: theme.typography.heading }]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase"
  }
});
