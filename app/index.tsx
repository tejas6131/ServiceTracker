import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { FAB, Appbar, useTheme, Searchbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { getAllVehicles } from '../src/database/operations';
import type { Vehicle } from '../src/types';
import VehicleCard from '../src/components/VehicleCard';
import EmptyState from '../src/components/EmptyState';

export default function DashboardScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const theme = useTheme();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadVehicles();
    }, [])
  );

  async function loadVehicles() {
    const data = await getAllVehicles(db);
    setVehicles(data);
  }

  const filtered = vehicles.filter(
    (v) =>
      v.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.registrationNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {vehicles.length > 0 && (
        <Searchbar
          placeholder="Search vehicles..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          elevation={0}
        />
      )}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VehicleCard
            vehicle={item}
            onPress={() => router.push(`/vehicle/${item.id}`)}
          />
        )}
        contentContainerStyle={vehicles.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="car-off"
            title="No Vehicles Yet"
            subtitle="Tap the + button to add your first vehicle"
          />
        }
      />
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => router.push('/vehicle/add')}
        label="Add Vehicle"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  list: {
    paddingTop: 8,
    paddingBottom: 96,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
  },
});
