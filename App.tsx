import "react-native-reanimated";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, useTheme } from "./src/theme/ThemeProvider";
import { RootTabs } from "./src/navigation/RootTabs";
import { View } from "react-native";
import { RewardProvider } from "./src/components/RewardProvider";

const AppShell = () => {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.variant === "minimalLight" ? "dark" : "light"} />
      <NavigationContainer>
        <RootTabs />
      </NavigationContainer>
    </View>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <RewardProvider>
        <AppShell />
      </RewardProvider>
    </ThemeProvider>
  );
}
