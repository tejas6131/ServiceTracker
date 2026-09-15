import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  TextInput,
  Button,
  useTheme,
  HelperText,
  SegmentedButtons,
  Text,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { insertReminder } from '../../src/database/operations';
import {
  requestNotificationPermissions,
  scheduleReminderNotification,
} from '../../src/notifications/reminderScheduler';
import type { ReminderType } from '../../src/types';

export default function AddReminderScreen() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const theme = useTheme();

  const [reminderType, setReminderType] = useState<ReminderType>('servicing');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!reminderDate.trim()) e.reminderDate = 'Reminder date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function parseDate(dateStr: string): Date | null {
    // Try DD-MMM-YYYY format (e.g. 15-Aug-2026)
    const months: Record<string, number> = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
    };
    const parts = dateStr.trim().split('-');
    if (parts.length === 3) {
      const [day, mon, yr] = parts;
      const monthNum = months[mon];
      if (monthNum !== undefined) {
        return new Date(Number(yr), monthNum, Number(day), 9, 0, 0); // 9 AM
      }
    }
    // Try YYYY-MM-DD format
    const isoDate = new Date(dateStr);
    if (!isNaN(isoDate.getTime())) {
      isoDate.setHours(9, 0, 0, 0);
      return isoDate;
    }
    // Try DD/MM/YYYY
    if (parts.length === 3) {
      const [day, month, yr] = dateStr.split('/');
      const d = new Date(Number(yr), Number(month) - 1, Number(day), 9, 0, 0);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  }

  async function handleSave() {
    if (!validate() || !vehicleId) return;
    setSaving(true);
    try {
      // Request notification permissions
      const granted = await requestNotificationPermissions();

      let notificationId: string | undefined;

      if (granted) {
        const triggerDate = parseDate(reminderDate);
        if (triggerDate && triggerDate.getTime() > Date.now()) {
          const body =
            reminderType === 'servicing'
              ? `Service reminder: ${description || title}`
              : `Insurance reminder: ${description || title}`;
          notificationId = await scheduleReminderNotification(
            `🚗 ${title}`,
            body,
            triggerDate
          );
        }
      }

      await insertReminder(db, {
        vehicleId,
        reminderType,
        title: title.trim(),
        description: description.trim(),
        reminderDate: reminderDate.trim(),
        notificationId,
      });

      router.back();
    } catch (err) {
      console.error('Failed to save reminder:', err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text variant="labelLarge" style={styles.label}>
        Reminder Type
      </Text>
      <SegmentedButtons
        value={reminderType}
        onValueChange={(v) => setReminderType(v as ReminderType)}
        buttons={[
          { value: 'servicing', label: '🔧 Servicing', style: styles.segBtn },
          { value: 'insurance', label: '🛡️ Insurance', style: styles.segBtn },
        ]}
        style={styles.segmented}
      />

      <TextInput
        label="Title *"
        placeholder="e.g. Next Service Due, Insurance Renewal"
        value={title}
        onChangeText={setTitle}
        mode="outlined"
        style={styles.input}
        error={!!errors.title}
      />
      {errors.title ? <HelperText type="error">{errors.title}</HelperText> : null}

      <TextInput
        label="Description"
        placeholder="Any details about this reminder"
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        style={styles.input}
        multiline
        numberOfLines={3}
      />

      <TextInput
        label="Reminder Date *"
        placeholder="e.g. 15-Aug-2026 or 2026-08-15"
        value={reminderDate}
        onChangeText={setReminderDate}
        mode="outlined"
        style={styles.input}
        error={!!errors.reminderDate}
      />
      {errors.reminderDate ? (
        <HelperText type="error">{errors.reminderDate}</HelperText>
      ) : null}

      <Text variant="bodySmall" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
        A notification will be sent at 9:00 AM on the reminder date. Supported formats: DD-MMM-YYYY (e.g. 15-Aug-2026), YYYY-MM-DD, or DD/MM/YYYY.
      </Text>

      <View style={styles.buttons}>
        <Button mode="outlined" onPress={() => router.back()} style={styles.button}>
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.button}
        >
          Save Reminder
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 48 },
  label: { marginBottom: 8, marginTop: 4 },
  segmented: { marginBottom: 16 },
  segBtn: { flex: 1 },
  input: { marginBottom: 12 },
  hint: { marginBottom: 8, marginTop: -4, paddingHorizontal: 4 },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  button: { flex: 1 },
});
