import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeScreen } from "../screens/HomeScreen";
import { ProgressScreen } from "../screens/ProgressScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { useTheme } from "../theme/ThemeProvider";

const Tab = createBottomTabNavigator();

export const RootTabs = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.backgroundAlt,
          borderTopColor: theme.colors.border,
          height: 64
        },
        tabBarLabelStyle: {
          fontFamily: theme.typography.heading,
          fontSize: 12,
          letterSpacing: 0.6,
          textTransform: "uppercase"
        },
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.muted
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: "Start" }} />
      <Tab.Screen name="Progress" component={ProgressScreen} options={{ tabBarLabel: "Fortschritt" }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: "Einstellungen" }} />
    </Tab.Navigator>
  );
};
