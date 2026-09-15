import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { FAB, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import {
  getServiceRecords,
  deleteServiceRecord,
  getVehicleById,
} from '../../src/database/operations';
import type { ServiceRecord } from '../../src/types';
import RecordCard from '../../src/components/RecordCard';
import EmptyState from '../../src/components/EmptyState';
import ConfirmDialog from '../../src/components/ConfirmDialog';

export default function ServicingListScreen() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const theme = useTheme();
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [vehicleId])
  );

  async function loadRecords() {
    if (!vehicleId) return;
    const data = await getServiceRecords(db, vehicleId);
    setRecords(data);
  }

  async function handleDelete() {
    if (!deleteId) return;
    await deleteServiceRecord(db, deleteId);
    setDeleteId(null);
    loadRecords();
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecordCard
            icon="wrench"
            iconColor={theme.colors.primary}
            title={`Service #${item.srNo}`}
            subtitle={item.serviceDate}
            rows={[
              { label: 'Registration No.', value: item.registrationNo },
              { label: 'Odometer', value: item.odometerReading },
              { label: 'Service Type', value: item.serviceType },
              { label: 'Service Center', value: item.serviceCenter },
              { label: 'Work Done', value: item.workDone },
              { label: 'Next Service At', value: item.nextServiceAt },
            ]}
            onDelete={() => setDeleteId(item.id)}
          />
        )}
        contentContainerStyle={records.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="wrench"
            title="No Service Records"
            subtitle="Tap the + button to add a service record"
          />
        }
      />
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() =>
          router.push({ pathname: '/servicing/add', params: { vehicleId } })
        }
      />
      <ConfirmDialog
        visible={!!deleteId}
        title="Delete Service Record"
        message="Are you sure you want to delete this service record?"
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
});
