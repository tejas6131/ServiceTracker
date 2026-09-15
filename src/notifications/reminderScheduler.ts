import { Platform } from 'react-native';

/**
 * Lazy-load expo-notifications to avoid crashing in Expo Go
 * (push notification support was removed from Expo Go in SDK 53).
 * Notifications will work in development builds and production APKs.
 */
let Notifications: typeof import('expo-notifications') | null = null;

async function getNotifications() {
  if (Notifications) return Notifications;
  try {
    Notifications = await import('expo-notifications');
    // Configure how notifications appear when app is in foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    return Notifications;
  } catch {
    console.warn('expo-notifications is not available (Expo Go limitation). Reminders will be saved but notifications won\'t fire.');
    return null;
  }
}

/**
 * Request notification permissions. Must be called once before scheduling.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const notif = await getNotifications();
  if (!notif) return false;

  try {
    if (Platform.OS === 'android') {
      await notif.setNotificationChannelAsync('reminders', {
        name: 'Service Reminders',
        importance: notif.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1565C0',
      });
    }

    const { status: existingStatus } = await notif.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await notif.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch {
    console.warn('Failed to request notification permissions');
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
  // Don't schedule if the date is in the past
  if (triggerDate.getTime() <= Date.now()) {
    return '';
  }

  const notif = await getNotifications();
  if (!notif) return '';

  try {
    const id = await notif.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: notif.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: notif.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: 'reminders',
      },
    });
    return id;
  } catch {
    console.warn('Failed to schedule notification');
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

  const notif = await getNotifications();
  if (!notif) return;

  try {
    await notif.cancelScheduledNotificationAsync(notificationId);
  } catch {
    console.warn('Failed to cancel notification');
  }
}
