import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { FAB, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { getPartRecords, deletePartRecord } from '../../src/database/operations';
import type { PartRecord } from '../../src/types';
import RecordCard from '../../src/components/RecordCard';
import EmptyState from '../../src/components/EmptyState';
import ConfirmDialog from '../../src/components/ConfirmDialog';

export default function PartsListScreen() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const theme = useTheme();
  const [records, setRecords] = useState<PartRecord[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [vehicleId])
  );

  async function loadRecords() {
    if (!vehicleId) return;
    const data = await getPartRecords(db, vehicleId);
    setRecords(data);
  }

  async function handleDelete() {
    if (!deleteId) return;
    await deletePartRecord(db, deleteId);
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
            icon="cog"
            iconColor={theme.colors.tertiary}
            title={item.partName || `Part #${item.srNo}`}
            subtitle={item.dateOfReplacement}
            rows={[
              { label: 'Category', value: item.partCategory },
              { label: 'Odometer', value: item.odometerReading },
              { label: 'Replaced At', value: item.replacedAt },
              { label: 'Cost', value: item.cost ? `₹${item.cost}` : '' },
              { label: 'Warranty', value: item.warranty },
              { label: 'Notes', value: item.notes },
            ]}
            onDelete={() => setDeleteId(item.id)}
          />
        )}
        contentContainerStyle={records.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="cog"
            title="No Parts Changed"
            subtitle="Tap the + button to record a part replacement"
          />
        }
      />
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.tertiary }]}
        color="#fff"
        onPress={() =>
          router.push({ pathname: '/parts/add', params: { vehicleId } })
        }
      />
      <ConfirmDialog
        visible={!!deleteId}
        title="Delete Part Record"
        message="Are you sure you want to delete this part record?"
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
