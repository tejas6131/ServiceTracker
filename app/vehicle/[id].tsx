import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text, useTheme, Button, Divider } from 'react-native-paper';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  getVehicleById,
  deleteVehicle,
  getServiceRecords,
  getPartRecords,
  getInsuranceRecords,
  getReminders,
} from '../../src/database/operations';
import type { Vehicle } from '../../src/types';
import ConfirmDialog from '../../src/components/ConfirmDialog';

interface QuickStat {
  label: string;
  value: string;
  color: string;
}

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const theme = useTheme();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [stats, setStats] = useState<QuickStat[]>([]);
  const [showDelete, setShowDelete] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  async function loadData() {
    if (!id) return;
    const v = await getVehicleById(db, id);
    setVehicle(v);

    const services = await getServiceRecords(db, id);
    const parts = await getPartRecords(db, id);
    const insurances = await getInsuranceRecords(db, id);
    const reminders = await getReminders(db, id);
    const upcomingReminders = reminders.filter((r) => !r.isCompleted);

    setStats([
      { label: 'Services', value: String(services.length), color: theme.colors.primary },
      { label: 'Parts Changed', value: String(parts.length), color: theme.colors.tertiary },
      { label: 'Insurance', value: String(insurances.length), color: '#FF8F00' },
      { label: 'Reminders', value: String(upcomingReminders.length), color: theme.colors.error },
    ]);
  }

  async function handleDelete() {
    if (!id) return;
    await deleteVehicle(db, id);
    setShowDelete(false);
    router.back();
  }

  if (!vehicle) return null;

  const menuItems = [
    {
      icon: 'wrench' as const,
      label: 'Servicing',
      description: 'View service history',
      route: `/servicing/${id}`,
      color: theme.colors.primary,
    },
    {
      icon: 'cog' as const,
      label: 'Parts Changed',
      description: 'View replaced parts',
      route: `/parts/${id}`,
      color: theme.colors.tertiary,
    },
    {
      icon: 'shield-car' as const,
      label: 'Insurance',
      description: 'View insurance policies',
      route: `/insurance/${id}`,
      color: '#FF8F00',
    },
    {
      icon: 'bell-ring' as const,
      label: 'Reminders',
      description: 'Service & insurance reminders',
      route: `/reminders/${id}`,
      color: theme.colors.error,
    },
  ];

  return (
    <>
      <Stack.Screen options={{ title: vehicle.vehicleName }} />
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
      >
        {/* Vehicle Info Header */}
        <Card style={styles.infoCard} mode="elevated">
          <Card.Content>
            <View style={styles.headerRow}>
              <View style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}>
                <MaterialCommunityIcons name="car" size={36} color={theme.colors.primary} />
              </View>
              <View style={styles.headerInfo}>
                <Text variant="headlineSmall" style={{ fontWeight: '700' }}>
                  {vehicle.vehicleName}
                </Text>
                <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                  {vehicle.registrationNo}
                </Text>
              </View>
            </View>
            <Divider style={{ marginVertical: 12 }} />
            <View style={styles.detailsGrid}>
              {vehicle.makeModel ? (
                <DetailItem label="Make & Model" value={vehicle.makeModel} />
              ) : null}
              {vehicle.year ? <DetailItem label="Year" value={vehicle.year} /> : null}
              {vehicle.fuelType ? (
                <DetailItem label="Fuel Type" value={vehicle.fuelType} />
              ) : null}
              {vehicle.currentOdometer ? (
                <DetailItem label="Odometer" value={vehicle.currentOdometer} />
              ) : null}
            </View>
          </Card.Content>
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          {stats.map((stat, i) => (
            <Card key={i} style={styles.statCard} mode="elevated">
              <Card.Content style={styles.statContent}>
                <Text variant="headlineMedium" style={{ fontWeight: '700', color: stat.color }}>
                  {stat.value}
                </Text>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {stat.label}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Navigation Menu */}
        {menuItems.map((item, i) => (
          <Card
            key={i}
            style={styles.menuCard}
            mode="elevated"
            onPress={() => router.push(item.route as any)}
          >
            <Card.Content style={styles.menuContent}>
              <View style={[styles.menuIcon, { backgroundColor: `${item.color}18` }]}>
                <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
              </View>
              <View style={styles.menuText}>
                <Text variant="titleMedium" style={{ fontWeight: '600' }}>
                  {item.label}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {item.description}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={theme.colors.onSurfaceVariant}
              />
            </Card.Content>
          </Card>
        ))}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            mode="outlined"
            icon="pencil"
            onPress={() => router.push({ pathname: '/vehicle/edit', params: { id } })}
            style={styles.actionBtn}
          >
            Edit Vehicle
          </Button>
          <Button
            mode="outlined"
            icon="delete"
            textColor={theme.colors.error}
            onPress={() => setShowDelete(true)}
            style={styles.actionBtn}
          >
            Delete
          </Button>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={showDelete}
        title="Delete Vehicle"
        message={`Are you sure you want to delete "${vehicle.vehicleName}"? All service records, parts, insurance, and reminders for this vehicle will be permanently deleted.`}
        onConfirm={handleDelete}
        onDismiss={() => setShowDelete(false)}
      />
    </>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text variant="labelSmall" style={{ opacity: 0.6 }}>
        {label}
      </Text>
      <Text variant="bodyMedium">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 48 },
  infoCard: { marginBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: { flex: 1 },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: { minWidth: '40%' },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  statCard: { flex: 1, minWidth: '45%' },
  statContent: { alignItems: 'center', paddingVertical: 12 },
  menuCard: { marginBottom: 8 },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: { flex: 1 },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  actionBtn: { flex: 1 },
});
