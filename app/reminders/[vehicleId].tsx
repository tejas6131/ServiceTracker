import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { FAB, useTheme, Chip } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import {
  getReminders,
  deleteReminder,
  markReminderCompleted,
} from '../../src/database/operations';
import { cancelReminderNotification } from '../../src/notifications/reminderScheduler';
import type { Reminder } from '../../src/types';
import RecordCard from '../../src/components/RecordCard';
import EmptyState from '../../src/components/EmptyState';
import ConfirmDialog from '../../src/components/ConfirmDialog';

export default function RemindersListScreen() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const theme = useTheme();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadReminders();
    }, [vehicleId])
  );

  async function loadReminders() {
    if (!vehicleId) return;
    const data = await getReminders(db, vehicleId);
    setReminders(data);
  }

  async function handleComplete(reminder: Reminder) {
    if (reminder.notificationId) {
      await cancelReminderNotification(reminder.notificationId);
    }
    await markReminderCompleted(db, reminder.id);
    loadReminders();
  }

  async function handleDelete() {
    if (!deleteId) return;
    const reminder = reminders.find((r) => r.id === deleteId);
    if (reminder?.notificationId) {
      await cancelReminderNotification(reminder.notificationId);
    }
    await deleteReminder(db, deleteId);
    setDeleteId(null);
    loadReminders();
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <RecordCard
              icon={item.reminderType === 'servicing' ? 'wrench-clock' : 'shield-alert'}
              iconColor={item.isCompleted ? theme.colors.outline : theme.colors.error}
              title={item.title}
              subtitle={item.reminderDate}
              rows={[
                { label: 'Type', value: item.reminderType === 'servicing' ? '🔧 Servicing' : '🛡️ Insurance' },
                { label: 'Description', value: item.description },
                { label: 'Status', value: item.isCompleted ? '✅ Completed' : '⏰ Pending' },
              ]}
              onDelete={() => setDeleteId(item.id)}
            />
            {!item.isCompleted && (
              <View style={styles.completeRow}>
                <Chip
                  icon="check"
                  onPress={() => handleComplete(item)}
                  style={styles.completeChip}
                  textStyle={{ color: theme.colors.primary }}
                >
                  Mark as Done
                </Chip>
              </View>
            )}
          </View>
        )}
        contentContainerStyle={reminders.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="bell-off"
            title="No Reminders"
            subtitle="Tap the + button to set a service or insurance reminder"
          />
        }
      />
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.error }]}
        color="#fff"
        onPress={() =>
          router.push({ pathname: '/reminders/add', params: { vehicleId } })
        }
      />
      <ConfirmDialog
        visible={!!deleteId}
        title="Delete Reminder"
        message="Are you sure you want to delete this reminder?"
        onConfirm={handleDelete}
        onDismiss={() => setDeleteId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingTop: 8, paddingBottom: 96 },
  emptyContainer: { flexGrow: 1 },
  fab: { position: 'absolute', right: 16, bottom: 24 },
  completeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: -4,
  },
  completeChip: {
    backgroundColor: 'transparent',
  },
});
