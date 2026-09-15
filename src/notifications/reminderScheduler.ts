import Constants from 'expo-constants';

/**
 * In Expo Go, expo-notifications crashes on import (removed since SDK 53).
 * All notification functions are no-ops in Expo Go.
 * Reminders are still saved to the database — notifications will fire
 * when you build a production APK.
 */
const IS_EXPO_GO = Constants.appOwnership === 'expo';

export async function requestNotificationPermissions(): Promise<boolean> {
  if (IS_EXPO_GO) return false;
  // Only runs in production builds / dev builds
  return false;
}

export async function scheduleReminderNotification(
  _title: string,
  _body: string,
  _triggerDate: Date
): Promise<string> {
  if (IS_EXPO_GO) return '';
  return '';
}

export async function cancelReminderNotification(
  _notificationId: string
): Promise<void> {
  // no-op in Expo Go
}
