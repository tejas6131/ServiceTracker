import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Vehicle } from '../types';

interface Props {
  vehicle: Vehicle;
  onPress: () => void;
}

export default function VehicleCard({ vehicle, onPress }: Props) {
  const theme = useTheme();

  return (
    <Card style={styles.card} onPress={onPress} mode="elevated">
      <Card.Content style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
          <MaterialCommunityIcons name="car" size={32} color={theme.colors.primary} />
        </View>
        <View style={styles.info}>
          <Text variant="titleMedium" style={styles.name}>
            {vehicle.vehicleName}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {vehicle.registrationNo}
          </Text>
          {vehicle.makeModel ? (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {vehicle.makeModel} {vehicle.year ? `• ${vehicle.year}` : ''}
            </Text>
          ) : null}
          {vehicle.currentOdometer ? (
            <Text variant="bodySmall" style={{ color: theme.colors.tertiary }}>
              🛣️ {vehicle.currentOdometer}
            </Text>
          ) : null}
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={theme.colors.onSurfaceVariant}
        />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: '700',
  },
});
