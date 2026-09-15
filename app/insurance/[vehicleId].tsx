import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { FAB, useTheme, Chip } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import {
  getInsuranceRecords,
  deleteInsuranceRecord,
} from '../../src/database/operations';
import type { InsuranceRecord } from '../../src/types';
import RecordCard from '../../src/components/RecordCard';
import EmptyState from '../../src/components/EmptyState';
import ConfirmDialog from '../../src/components/ConfirmDialog';

function isExpired(expiryDate: string): boolean {
  if (!expiryDate) return false;
  try {
    const parts = expiryDate.split('-');
    if (parts.length !== 3) return false;
    const parsed = new Date(expiryDate);
    if (isNaN(parsed.getTime())) {
      // Try DD-MMM-YYYY format
      const months: Record<string, number> = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
      };
      const [day, mon, yr] = parts;
      const monthNum = months[mon];
      if (monthNum === undefined) return false;
      const d = new Date(Number(yr), monthNum, Number(day));
      return d < new Date();
    }
    return parsed < new Date();
  } catch {
    return false;
  }
}

export default function InsuranceListScreen() {
  const { vehicleId } = useLocalSearchParams<{ vehicleId: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const theme = useTheme();
  const [records, setRecords] = useState<InsuranceRecord[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [vehicleId])
  );

  async function loadRecords() {
    if (!vehicleId) return;
    const data = await getInsuranceRecords(db, vehicleId);
    setRecords(data);
  }

  async function handleDelete() {
    if (!deleteId) return;
    await deleteInsuranceRecord(db, deleteId);
    setDeleteId(null);
    loadRecords();
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const expired = isExpired(item.expiryDate);
          return (
            <RecordCard
              icon="shield-car"
              iconColor={expired ? theme.colors.error : '#FF8F00'}
              title={item.insuranceProvider || `Policy #${item.srNo}`}
              subtitle={expired ? '⚠️ EXPIRED' : `Valid till ${item.expiryDate}`}
              rows={[
                { label: 'Policy No.', value: item.policyNo },
                { label: 'Policy Type', value: item.policyType },
                { label: 'Issue Date', value: item.policyIssueDate },
                { label: 'Start Date', value: item.startDate },
                { label: 'Expiry Date', value: item.expiryDate },
                {
                  label: 'Premium',
                  value: item.premiumAmount ? `₹${item.premiumAmount}` : '',
                },
              ]}
              onDelete={() => setDeleteId(item.id)}
            />
          );
        }}
        contentContainerStyle={records.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="shield-car"
            title="No Insurance Records"
            subtitle="Tap the + button to add an insurance policy"
          />
        }
      />
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: '#FF8F00' }]}
        color="#fff"
        onPress={() =>
          router.push({ pathname: '/insurance/add', params: { vehicleId } })
        }
      />
      <ConfirmDialog
        visible={!!deleteId}
        title="Delete Insurance Record"
        message="Are you sure you want to delete this insurance record?"
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
