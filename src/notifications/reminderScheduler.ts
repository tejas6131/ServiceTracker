import { Platform } from 'react-native';

let _notifications: typeof import('expo-notifications') | null = null;

async function getNotifications() {
  if (_notifications) return _notifications;
  try {
    _notifications = await import('expo-notifications');
    _notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    return _notifications;
  } catch {
    console.warn('expo-notifications not available in Expo Go. Reminders saved but notifications disabled.');
    return null;
  }
}

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
    return false;
  }
}

export async function scheduleReminderNotification(
  title: string,
  body: string,
  triggerDate: Date
): Promise<string> {
  if (triggerDate.getTime() <= Date.now()) return '';
  const notif = await getNotifications();
  if (!notif) return '';
  try {
    return await notif.scheduleNotificationAsync({
      content: { title, body, sound: true, priority: notif.AndroidNotificationPriority.HIGH },
      trigger: { type: notif.SchedulableTriggerInputTypes.DATE, date: triggerDate, channelId: 'reminders' },
    });
  } catch {
    return '';
  }
}

export async function cancelReminderNotification(notificationId: string): Promise<void> {
  if (!notificationId) return;
  const notif = await getNotifications();
  if (!notif) return;
  try {
    await notif.cancelScheduledNotificationAsync(notificationId);
  } catch {}
}
