import type { SQLiteDatabase } from 'expo-sqlite';
import type {
  Vehicle,
  ServiceRecord,
  PartRecord,
  InsuranceRecord,
  Reminder,
} from '../types';

// ────────────────────── Helpers ──────────────────────

function now(): string {
  return new Date().toISOString();
}

function generateId(): string {
  // Simple UUID-like id generator (avoids external dependency)
  return 'xxxx-xxxx-xxxx'.replace(/x/g, () =>
    Math.floor(Math.random() * 16).toString(16)
  );
}

// ────────────────────── Vehicles ──────────────────────

export async function getAllVehicles(db: SQLiteDatabase): Promise<Vehicle[]> {
  const results = await db.getAllAsync<Vehicle>(
    'SELECT * FROM vehicles ORDER BY createdAt DESC'
  );
  return results;
}

export async function getVehicleById(
  db: SQLiteDatabase,
  id: string
): Promise<Vehicle | null> {
  const result = await db.getFirstAsync<Vehicle>(
    'SELECT * FROM vehicles WHERE id = ?',
    [id]
  );
  return result ?? null;
}

export async function insertVehicle(
  db: SQLiteDatabase,
  vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>
): Promise<string> {
  const id = generateId();
  const timestamp = now();
  await db.runAsync(
    `INSERT INTO vehicles (id, vehicleName, registrationNo, makeModel, year, fuelType, currentOdometer, photoUri, createdAt, updatedAt, syncStatus)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      id,
      vehicle.vehicleName,
      vehicle.registrationNo,
      vehicle.makeModel,
      vehicle.year,
      vehicle.fuelType,
      vehicle.currentOdometer,
      vehicle.photoUri ?? null,
      timestamp,
      timestamp,
    ]
  );
  return id;
}

export async function updateVehicle(
  db: SQLiteDatabase,
  id: string,
  vehicle: Partial<Omit<Vehicle, 'id' | 'createdAt' | 'syncStatus'>>
): Promise<void> {
  const fields: string[] = [];
  const values: (string | null)[] = [];

  const mappable: Record<string, string | undefined | null> = {
    vehicleName: vehicle.vehicleName,
    registrationNo: vehicle.registrationNo,
    makeModel: vehicle.makeModel,
    year: vehicle.year,
    fuelType: vehicle.fuelType,
    currentOdometer: vehicle.currentOdometer,
    photoUri: vehicle.photoUri,
  };

  for (const [key, val] of Object.entries(mappable)) {
    if (val !== undefined) {
      fields.push(`${key} = ?`);
      values.push(val ?? null);
    }
  }

  fields.push("updatedAt = ?", "syncStatus = 'pending'");
  values.push(now(), id);

  await db.runAsync(
    `UPDATE vehicles SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

export async function deleteVehicle(
  db: SQLiteDatabase,
  id: string
): Promise<void> {
  await db.runAsync('DELETE FROM vehicles WHERE id = ?', [id]);
}

// ────────────────────── Service Records ──────────────────────

export async function getServiceRecords(
  db: SQLiteDatabase,
  vehicleId: string
): Promise<ServiceRecord[]> {
  return db.getAllAsync<ServiceRecord>(
    'SELECT * FROM service_records WHERE vehicleId = ? ORDER BY serviceDate DESC, srNo DESC',
    [vehicleId]
  );
}

export async function getNextServiceSrNo(
  db: SQLiteDatabase,
  vehicleId: string
): Promise<number> {
  const result = await db.getFirstAsync<{ maxSr: number | null }>(
    'SELECT MAX(srNo) as maxSr FROM service_records WHERE vehicleId = ?',
    [vehicleId]
  );
  return (result?.maxSr ?? 0) + 1;
}

export async function insertServiceRecord(
  db: SQLiteDatabase,
  record: Omit<ServiceRecord, 'id' | 'srNo' | 'createdAt' | 'updatedAt' | 'syncStatus'>
): Promise<string> {
  const id = generateId();
  const timestamp = now();
  const srNo = await getNextServiceSrNo(db, record.vehicleId);
  await db.runAsync(
    `INSERT INTO service_records (id, vehicleId, srNo, registrationNo, serviceDate, odometerReading, serviceType, serviceCenter, workDone, nextServiceAt, documentUri, createdAt, updatedAt, syncStatus)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      id,
      record.vehicleId,
      srNo,
      record.registrationNo,
      record.serviceDate,
      record.odometerReading,
      record.serviceType,
      record.serviceCenter,
      record.workDone,
      record.nextServiceAt,
      record.documentUri ?? null,
      timestamp,
      timestamp,
    ]
  );
  return id;
}

export async function updateServiceRecord(
  db: SQLiteDatabase,
  id: string,
  record: Partial<Omit<ServiceRecord, 'id' | 'vehicleId' | 'srNo' | 'createdAt' | 'syncStatus'>>
): Promise<void> {
  const fields: string[] = [];
  const values: (string | null)[] = [];

  const mappable: Record<string, string | undefined | null> = {
    registrationNo: record.registrationNo,
    serviceDate: record.serviceDate,
    odometerReading: record.odometerReading,
    serviceType: record.serviceType,
    serviceCenter: record.serviceCenter,
    workDone: record.workDone,
    nextServiceAt: record.nextServiceAt,
    documentUri: record.documentUri,
  };

  for (const [key, val] of Object.entries(mappable)) {
    if (val !== undefined) {
      fields.push(`${key} = ?`);
      values.push(val ?? null);
    }
  }

  fields.push("updatedAt = ?", "syncStatus = 'pending'");
  values.push(now(), id);

  await db.runAsync(
    `UPDATE service_records SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

export async function deleteServiceRecord(
  db: SQLiteDatabase,
  id: string
): Promise<void> {
  await db.runAsync('DELETE FROM service_records WHERE id = ?', [id]);
}

// ────────────────────── Part Records ──────────────────────

export async function getPartRecords(
  db: SQLiteDatabase,
  vehicleId: string
): Promise<PartRecord[]> {
  return db.getAllAsync<PartRecord>(
    'SELECT * FROM part_records WHERE vehicleId = ? ORDER BY dateOfReplacement DESC, srNo DESC',
    [vehicleId]
  );
}

export async function getNextPartSrNo(
  db: SQLiteDatabase,
  vehicleId: string
): Promise<number> {
  const result = await db.getFirstAsync<{ maxSr: number | null }>(
    'SELECT MAX(srNo) as maxSr FROM part_records WHERE vehicleId = ?',
    [vehicleId]
  );
  return (result?.maxSr ?? 0) + 1;
}

export async function insertPartRecord(
  db: SQLiteDatabase,
  record: Omit<PartRecord, 'id' | 'srNo' | 'createdAt' | 'updatedAt' | 'syncStatus'>
): Promise<string> {
  const id = generateId();
  const timestamp = now();
  const srNo = await getNextPartSrNo(db, record.vehicleId);
  await db.runAsync(
    `INSERT INTO part_records (id, vehicleId, srNo, partName, partCategory, dateOfReplacement, odometerReading, replacedAt, cost, warranty, notes, documentUri, createdAt, updatedAt, syncStatus)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      id,
      record.vehicleId,
      srNo,
      record.partName,
      record.partCategory,
      record.dateOfReplacement,
      record.odometerReading,
      record.replacedAt,
      record.cost,
      record.warranty,
      record.notes,
      record.documentUri ?? null,
      timestamp,
      timestamp,
    ]
  );
  return id;
}

export async function updatePartRecord(
  db: SQLiteDatabase,
  id: string,
  record: Partial<Omit<PartRecord, 'id' | 'vehicleId' | 'srNo' | 'createdAt' | 'syncStatus'>>
): Promise<void> {
  const fields: string[] = [];
  const values: (string | null)[] = [];

  const mappable: Record<string, string | undefined | null> = {
    partName: record.partName,
    partCategory: record.partCategory,
    dateOfReplacement: record.dateOfReplacement,
    odometerReading: record.odometerReading,
    replacedAt: record.replacedAt,
    cost: record.cost,
    warranty: record.warranty,
    notes: record.notes,
    documentUri: record.documentUri,
  };

  for (const [key, val] of Object.entries(mappable)) {
    if (val !== undefined) {
      fields.push(`${key} = ?`);
      values.push(val ?? null);
    }
  }

  fields.push("updatedAt = ?", "syncStatus = 'pending'");
  values.push(now(), id);

  await db.runAsync(
    `UPDATE part_records SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

export async function deletePartRecord(
  db: SQLiteDatabase,
  id: string
): Promise<void> {
  await db.runAsync('DELETE FROM part_records WHERE id = ?', [id]);
}

// ────────────────────── Insurance Records ──────────────────────

export async function getInsuranceRecords(
  db: SQLiteDatabase,
  vehicleId: string
): Promise<InsuranceRecord[]> {
  return db.getAllAsync<InsuranceRecord>(
    'SELECT * FROM insurance_records WHERE vehicleId = ? ORDER BY startDate DESC, srNo DESC',
    [vehicleId]
  );
}

export async function getNextInsuranceSrNo(
  db: SQLiteDatabase,
  vehicleId: string
): Promise<number> {
  const result = await db.getFirstAsync<{ maxSr: number | null }>(
    'SELECT MAX(srNo) as maxSr FROM insurance_records WHERE vehicleId = ?',
    [vehicleId]
  );
  return (result?.maxSr ?? 0) + 1;
}

export async function insertInsuranceRecord(
  db: SQLiteDatabase,
  record: Omit<InsuranceRecord, 'id' | 'srNo' | 'createdAt' | 'updatedAt' | 'syncStatus'>
): Promise<string> {
  const id = generateId();
  const timestamp = now();
  const srNo = await getNextInsuranceSrNo(db, record.vehicleId);
  await db.runAsync(
    `INSERT INTO insurance_records (id, vehicleId, srNo, policyNo, insuranceProvider, policyType, policyIssueDate, startDate, expiryDate, premiumAmount, documentUri, createdAt, updatedAt, syncStatus)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      id,
      record.vehicleId,
      srNo,
      record.policyNo,
      record.insuranceProvider,
      record.policyType,
      record.policyIssueDate,
      record.startDate,
      record.expiryDate,
      record.premiumAmount,
      record.documentUri ?? null,
      timestamp,
      timestamp,
    ]
  );
  return id;
}

export async function updateInsuranceRecord(
  db: SQLiteDatabase,
  id: string,
  record: Partial<Omit<InsuranceRecord, 'id' | 'vehicleId' | 'srNo' | 'createdAt' | 'syncStatus'>>
): Promise<void> {
  const fields: string[] = [];
  const values: (string | null)[] = [];

  const mappable: Record<string, string | undefined | null> = {
    policyNo: record.policyNo,
    insuranceProvider: record.insuranceProvider,
    policyType: record.policyType,
    policyIssueDate: record.policyIssueDate,
    startDate: record.startDate,
    expiryDate: record.expiryDate,
    premiumAmount: record.premiumAmount,
    documentUri: record.documentUri,
  };

  for (const [key, val] of Object.entries(mappable)) {
    if (val !== undefined) {
      fields.push(`${key} = ?`);
      values.push(val ?? null);
    }
  }

  fields.push("updatedAt = ?", "syncStatus = 'pending'");
  values.push(now(), id);

  await db.runAsync(
    `UPDATE insurance_records SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

export async function deleteInsuranceRecord(
  db: SQLiteDatabase,
  id: string
): Promise<void> {
  await db.runAsync('DELETE FROM insurance_records WHERE id = ?', [id]);
}

// ────────────────────── Reminders ──────────────────────

export async function getReminders(
  db: SQLiteDatabase,
  vehicleId: string
): Promise<Reminder[]> {
  const rows = await db.getAllAsync<Reminder & { isCompleted: number }>(
    'SELECT * FROM reminders WHERE vehicleId = ? ORDER BY reminderDate ASC',
    [vehicleId]
  );
  return rows.map((r) => ({ ...r, isCompleted: Boolean(r.isCompleted) }));
}

export async function getAllUpcomingReminders(
  db: SQLiteDatabase
): Promise<(Reminder & { vehicleName: string })[]> {
  const rows = await db.getAllAsync<
    Reminder & { isCompleted: number; vehicleName: string }
  >(
    `SELECT r.*, v.vehicleName FROM reminders r
     JOIN vehicles v ON r.vehicleId = v.id
     WHERE r.isCompleted = 0
     ORDER BY r.reminderDate ASC`
  );
  return rows.map((r) => ({ ...r, isCompleted: Boolean(r.isCompleted) }));
}

export async function insertReminder(
  db: SQLiteDatabase,
  reminder: Omit<Reminder, 'id' | 'isCompleted' | 'createdAt' | 'updatedAt' | 'syncStatus'>
): Promise<string> {
  const id = generateId();
  const timestamp = now();
  await db.runAsync(
    `INSERT INTO reminders (id, vehicleId, reminderType, title, description, reminderDate, notificationId, isCompleted, createdAt, updatedAt, syncStatus)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 'pending')`,
    [
      id,
      reminder.vehicleId,
      reminder.reminderType,
      reminder.title,
      reminder.description,
      reminder.reminderDate,
      reminder.notificationId ?? null,
      timestamp,
      timestamp,
    ]
  );
  return id;
}

export async function markReminderCompleted(
  db: SQLiteDatabase,
  id: string
): Promise<void> {
  await db.runAsync(
    "UPDATE reminders SET isCompleted = 1, updatedAt = ?, syncStatus = 'pending' WHERE id = ?",
    [now(), id]
  );
}

export async function deleteReminder(
  db: SQLiteDatabase,
  id: string
): Promise<void> {
  await db.runAsync('DELETE FROM reminders WHERE id = ?', [id]);
}
