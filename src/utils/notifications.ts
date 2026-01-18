import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

export const requestNotificationPermission = async () => {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED) {
    return true;
  }
  const result = await Notifications.requestPermissionsAsync();
  return result.granted || result.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED;
};

export const scheduleDailyReminder = async (hour: number, minute: number) => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("daily", {
      name: "T\u00e4gliche Erinnerung",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 150, 250]
    });
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
  return Notifications.scheduleNotificationAsync({
    content: {
      title: "90 Tage Check-in",
      body: "Kurz abhaken, Fortschritt sichern.",
      sound: false
    },
    trigger: {
      hour,
      minute,
      repeats: true,
      channelId: "daily"
    }
  });
};

export const cancelAllReminders = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
