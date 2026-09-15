import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions. Must be called once before scheduling.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Service Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1565C0',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (err) {
    console.warn('Failed to request notification permissions:', err);
    return false;
  }
}

/**
 * Schedule a local notification for a reminder.
 * Returns the notification identifier string.
 */
export async function scheduleReminderNotification(
  title: string,
  body: string,
  triggerDate: Date
): Promise<string> {
  if (triggerDate.getTime() <= Date.now()) {
    return '';
  }

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: 'reminders',
      },
    });
    return id;
  } catch (err) {
    console.warn('Failed to schedule notification:', err);
    return '';
  }
}

/**
 * Cancel a previously scheduled notification.
 */
export async function cancelReminderNotification(
  notificationId: string
): Promise<void> {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (err) {
    console.warn('Failed to cancel notification:', err);
  }
}
