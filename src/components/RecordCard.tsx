import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, useTheme, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface InfoRow {
  label: string;
  value: string;
}

interface Props {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
  rows: InfoRow[];
  onDelete?: () => void;
}

export default function RecordCard({
  icon,
  iconColor,
  title,
  subtitle,
  rows,
  onDelete,
}: Props) {
  const theme = useTheme();
  const color = iconColor ?? theme.colors.primary;

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <View style={styles.header}>
          <MaterialCommunityIcons name={icon} size={24} color={color} />
          <View style={styles.headerText}>
            <Text variant="titleSmall" style={{ fontWeight: '700' }}>
              {title}
            </Text>
            {subtitle ? (
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {onDelete ? (
            <IconButton
              icon="delete-outline"
              size={20}
              onPress={onDelete}
              iconColor={theme.colors.error}
            />
          ) : null}
        </View>
        {rows
          .filter((r) => r.value)
          .map((row, i) => (
            <View key={i} style={styles.row}>
              <Text variant="bodySmall" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
                {row.label}
              </Text>
              <Text variant="bodyMedium" style={styles.value}>
                {row.value}
              </Text>
            </View>
          ))}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 3,
  },
  label: {
    width: 130,
    fontWeight: '500',
  },
  value: {
    flex: 1,
  },
});
