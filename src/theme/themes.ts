import { Platform } from "react-native";

export type ThemeVariant = "premiumDark" | "minimalLight" | "gamifiedNeon" | "softPastel";

export type Theme = {
  variant: ThemeVariant;
  name: string;
  colors: {
    background: string;
    backgroundAlt: string;
    card: string;
    cardAlt: string;
    text: string;
    muted: string;
    accent: string;
    accentAlt: string;
    ringTrack: string;
    ringProgress: string;
    border: string;
    tint: string;
    success: string;
    warning: string;
    buttonText: string;
    buttonTextDisabled: string;
    glow: string;
  };
  typography: {
    display: string;
    heading: string;
    body: string;
    mono: string;
  };
  radius: {
    xl: number;
    lg: number;
    md: number;
    sm: number;
  };
  spacing: {
    xl: number;
    lg: number;
    md: number;
    sm: number;
    xs: number;
  };
};

const font = {
  display: Platform.select({ ios: "Avenir Next", android: "sans-serif-condensed" }) || "Avenir Next",
  heading: Platform.select({ ios: "Avenir Next", android: "sans-serif-medium" }) || "Avenir Next",
  body: Platform.select({ ios: "Avenir Next", android: "sans-serif" }) || "Avenir Next",
  mono: Platform.select({ ios: "Menlo", android: "monospace" }) || "Menlo"
};

export const themes: Record<ThemeVariant, Theme> = {
  premiumDark: {
    variant: "premiumDark",
    name: "Premium Dark",
    colors: {
      background: "#0B1424",
      backgroundAlt: "#111C2E",
      card: "#16233A",
      cardAlt: "#1C2B46",
      text: "#F5F8FF",
      muted: "#A7B3C6",
      accent: "#F4C542",
      accentAlt: "#5FB0FF",
      ringTrack: "#1F2A3C",
      ringProgress: "#F4C542",
      border: "#253349",
      tint: "rgba(244, 197, 66, 0.14)",
      success: "#6EE7B7",
      warning: "#F4C542",
      buttonText: "#0B1424",
      buttonTextDisabled: "#FFFFFF",
      glow: "rgba(244, 197, 66, 0.2)"
    },
    typography: font,
    radius: { xl: 28, lg: 20, md: 14, sm: 10 },
    spacing: { xl: 28, lg: 22, md: 16, sm: 12, xs: 8 }
  },
  minimalLight: {
    variant: "minimalLight",
    name: "Minimal Light",
    colors: {
      background: "#F6F5F2",
      backgroundAlt: "#FFFFFF",
      card: "#FFFFFF",
      cardAlt: "#F1F2F4",
      text: "#101214",
      muted: "#6B7280",
      accent: "#1C7CF2",
      accentAlt: "#0F4C99",
      ringTrack: "#E3E6EB",
      ringProgress: "#1C7CF2",
      border: "#E5E7EB",
      tint: "rgba(28, 124, 242, 0.08)",
      success: "#16A34A",
      warning: "#E09F3E",
      buttonText: "#FFFFFF",
      buttonTextDisabled: "#101214",
      glow: "rgba(28, 124, 242, 0.08)"
    },
    typography: font,
    radius: { xl: 28, lg: 20, md: 14, sm: 10 },
    spacing: { xl: 28, lg: 22, md: 16, sm: 12, xs: 8 }
  },
  gamifiedNeon: {
    variant: "gamifiedNeon",
    name: "Gamified Neon",
    colors: {
      background: "#0B0A12",
      backgroundAlt: "#141323",
      card: "#161427",
      cardAlt: "#1D1A36",
      text: "#F4F7FF",
      muted: "#8B88A2",
      accent: "#6DFFB5",
      accentAlt: "#FF8BF7",
      ringTrack: "#26233F",
      ringProgress: "#6DFFB5",
      border: "#272441",
      tint: "rgba(109, 255, 181, 0.12)",
      success: "#6DFFB5",
      warning: "#FFCC66",
      buttonText: "#0B0A12",
      buttonTextDisabled: "#FFFFFF",
      glow: "rgba(109, 255, 181, 0.2)"
    },
    typography: font,
    radius: { xl: 28, lg: 20, md: 14, sm: 10 },
    spacing: { xl: 28, lg: 22, md: 16, sm: 12, xs: 8 }
  },
  softPastel: {
    variant: "softPastel",
    name: "Soft Pastel",
    colors: {
      background: "#FDF7F5",
      backgroundAlt: "#FFF2EE",
      card: "#FFFFFF",
      cardAlt: "#FFEFE8",
      text: "#3B2F3A",
      muted: "#8B7A88",
      accent: "#F2A7C6",
      accentAlt: "#94C9F9",
      ringTrack: "#F0E1EA",
      ringProgress: "#F2A7C6",
      border: "#F2D8E3",
      tint: "rgba(242, 167, 198, 0.15)",
      success: "#6FCF97",
      warning: "#F2A65A",
      buttonText: "#3B2F3A",
      buttonTextDisabled: "#3B2F3A",
      glow: "rgba(242, 167, 198, 0.2)"
    },
    typography: font,
    radius: { xl: 28, lg: 20, md: 14, sm: 10 },
    spacing: { xl: 28, lg: 22, md: 16, sm: 12, xs: 8 }
  }
};
