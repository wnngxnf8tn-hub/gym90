import React, { createContext, useContext, useMemo } from "react";
import { Theme, ThemeVariant, themes } from "./themes";
import { useChallengeStore } from "../store/useChallengeStore";

const ThemeContext = createContext<Theme>(themes.premiumDark);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const variant = useChallengeStore((state) => state.uiVariant) as ThemeVariant;
  const value = useMemo(() => themes[variant] || themes.premiumDark, [variant]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
