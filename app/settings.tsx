import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View, Linking } from 'react-native';
import { Card, Text, Button, useTheme, Divider, Switch, TextInput } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { performSync, getPendingSyncCount } from '../src/sync/syncService';
import { SYNC_ENABLED } from '../src/config/sheets';

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadPendingCount();
    }, [])
  );

  async function loadPendingCount() {
    const count = await getPendingSyncCount(db);
    setPendingCount(count);
  }

  async function handleSync() {
    setSyncing(true);
    setLastSyncResult(null);
    try {
      const result = await performSync(db);
      if (result.success) {
        setLastSyncResult(`Synced! Pushed ${result.pushed}, pulled ${result.pulled} records.`);
      } else {
        setLastSyncResult(`Sync failed: ${result.error}`);
      }
      loadPendingCount();
    } catch (err) {
      setLastSyncResult('Sync error. Check your internet connection.');
    } finally {
      setSyncing(false);
    }
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Sync Section */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="cloud-sync" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={[styles.sectionTitle, { fontWeight: '700' }]}>
              Google Sheets Sync
            </Text>
          </View>
          <Divider style={{ marginVertical: 12 }} />

          {SYNC_ENABLED ? (
            <>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium">Pending changes:</Text>
                <Text variant="bodyMedium" style={{ fontWeight: '700', color: pendingCount > 0 ? theme.colors.error : theme.colors.tertiary }}>
                  {pendingCount}
                </Text>
              </View>

              <Button
                mode="contained"
                onPress={handleSync}
                loading={syncing}
                disabled={syncing}
                icon="sync"
                style={styles.syncButton}
              >
                Sync Now
              </Button>

              {lastSyncResult ? (
                <Text variant="bodySmall" style={[styles.syncResult, { color: theme.colors.onSurfaceVariant }]}>
                  {lastSyncResult}
                </Text>
              ) : null}
            </>
          ) : (
            <>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
                Sync is not configured yet. To enable family sharing:
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, lineHeight: 20 }}>
                1. Create a Google Sheet named "Family Vehicle Tracker"{'\n'}
                2. Create tabs: Vehicles, Servicing, PartsChanged, Insurance, Reminders{'\n'}
                3. Open Extensions → Apps Script{'\n'}
                4. Paste the code from google-apps-script/Code.gs{'\n'}
                5. Deploy as Web App{'\n'}
                6. Update src/config/sheets.ts with the URL and set SYNC_ENABLED = true{'\n'}
                7. Rebuild the APK
              </Text>
            </>
          )}
        </Card.Content>
      </Card>

      {/* About Section */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="information" size={24} color={theme.colors.primary} />
            <Text variant="titleMedium" style={[styles.sectionTitle, { fontWeight: '700' }]}>
              About
            </Text>
          </View>
          <Divider style={{ marginVertical: 12 }} />
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Service Tracker v1.0.0
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 4 }}>
            Family vehicle service, parts, insurance & reminder tracker.{'\n'}
            All data is stored locally on your device.{'\n'}
            {SYNC_ENABLED ? 'Google Sheets sync is enabled for family sharing.' : 'Google Sheets sync can be enabled for family sharing.'}
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 48 },
  card: { marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionTitle: { flex: 1 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  syncButton: { marginTop: 8 },
  syncResult: { marginTop: 12, textAlign: 'center' },
});
