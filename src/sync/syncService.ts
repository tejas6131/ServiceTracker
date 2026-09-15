import type { SQLiteDatabase } from 'expo-sqlite';
import { SYNC_ENABLED, APPS_SCRIPT_URL } from '../config/sheets';

/**
 * Sync service that pushes pending local changes to Google Sheets
 * and pulls remote changes from the shared sheet.
 *
 * Sync strategy:
 *  - Each table has a syncStatus column: 'pending' or 'synced'
 *  - On push: send all pending records to the sheet, then mark as synced
 *  - On pull: fetch all records from the sheet and upsert into local DB
 *  - Conflict resolution: last-write-wins based on updatedAt timestamp
 */

const TABLES = ['vehicles', 'service_records', 'part_records', 'insurance_records', 'reminders'] as const;

// Map local table names to Google Sheet tab names
const TABLE_TO_SHEET: Record<string, string> = {
  vehicles: 'Vehicles',
  service_records: 'Servicing',
  part_records: 'PartsChanged',
  insurance_records: 'Insurance',
  reminders: 'Reminders',
};

interface SyncResult {
  success: boolean;
  pushed: number;
  pulled: number;
  error?: string;
}

/**
 * Perform a full sync: push local pending changes, then pull remote changes.
 */
export async function performSync(db: SQLiteDatabase): Promise<SyncResult> {
  if (!SYNC_ENABLED || !APPS_SCRIPT_URL) {
    return { success: false, pushed: 0, pulled: 0, error: 'Sync not configured' };
  }

  let totalPushed = 0;
  let totalPulled = 0;

  try {
    // ── Push pending records ──
    for (const table of TABLES) {
      const pendingRows = await db.getAllAsync<Record<string, unknown>>(
        `SELECT * FROM ${table} WHERE syncStatus = 'pending'`
      );

      if (pendingRows.length > 0) {
        const response = await fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'push',
            sheet: TABLE_TO_SHEET[table],
            records: pendingRows,
          }),
        });

        if (response.ok) {
          // Mark pushed records as synced
          const ids = pendingRows.map((r) => r.id as string);
          for (const id of ids) {
            await db.runAsync(
              `UPDATE ${table} SET syncStatus = 'synced' WHERE id = ?`,
              [id]
            );
          }
          totalPushed += pendingRows.length;
        }
      }
    }

    // ── Pull remote records ──
    for (const table of TABLES) {
      const response = await fetch(
        `${APPS_SCRIPT_URL}?action=pull&sheet=${TABLE_TO_SHEET[table]}`
      );

      if (response.ok) {
        const data = await response.json();
        const remoteRecords: Record<string, unknown>[] = data.records || [];

        for (const remote of remoteRecords) {
          const localRecord = await db.getFirstAsync<Record<string, unknown>>(
            `SELECT * FROM ${table} WHERE id = ?`,
            [remote.id as string]
          );

          if (!localRecord) {
            // New record from remote — insert
            const cols = Object.keys(remote);
            const placeholders = cols.map(() => '?').join(', ');
            const vals = cols.map((c) => remote[c] as string | number | null);
            await db.runAsync(
              `INSERT OR IGNORE INTO ${table} (${cols.join(', ')}) VALUES (${placeholders})`,
              vals
            );
            totalPulled++;
          } else {
            // Existing record — update if remote is newer
            const localUpdated = localRecord.updatedAt as string;
            const remoteUpdated = remote.updatedAt as string;
            if (remoteUpdated > localUpdated) {
              const cols = Object.keys(remote).filter((c) => c !== 'id');
              const setClause = cols.map((c) => `${c} = ?`).join(', ');
              const vals = [...cols.map((c) => remote[c] as string | number | null), remote.id as string];
              await db.runAsync(
                `UPDATE ${table} SET ${setClause} WHERE id = ?`,
                vals
              );
              totalPulled++;
            }
          }
        }
      }
    }

    return { success: true, pushed: totalPushed, pulled: totalPulled };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown sync error';
    return { success: false, pushed: totalPushed, pulled: totalPulled, error: message };
  }
}

/**
 * Get count of local records pending sync.
 */
export async function getPendingSyncCount(db: SQLiteDatabase): Promise<number> {
  let total = 0;
  for (const table of TABLES) {
    const result = await db.getFirstAsync<{ cnt: number }>(
      `SELECT COUNT(*) as cnt FROM ${table} WHERE syncStatus = 'pending'`
    );
    total += result?.cnt ?? 0;
  }
  return total;
}
