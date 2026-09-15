import type { SQLiteDatabase } from 'expo-sqlite';

const DB_NAME = 'servicetracker.db';

export function getDbName(): string {
  return DB_NAME;
}

export async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`PRAGMA journal_mode = WAL;`);
  await db.execAsync(`PRAGMA foreign_keys = ON;`);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY NOT NULL,
      vehicleName TEXT NOT NULL,
      registrationNo TEXT NOT NULL,
      makeModel TEXT NOT NULL DEFAULT '',
      year TEXT NOT NULL DEFAULT '',
      fuelType TEXT NOT NULL DEFAULT '',
      currentOdometer TEXT NOT NULL DEFAULT '',
      photoUri TEXT DEFAULT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      syncStatus TEXT NOT NULL DEFAULT 'pending'
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS service_records (
      id TEXT PRIMARY KEY NOT NULL,
      vehicleId TEXT NOT NULL,
      srNo INTEGER NOT NULL,
      registrationNo TEXT NOT NULL DEFAULT '',
      serviceDate TEXT NOT NULL DEFAULT '',
      odometerReading TEXT NOT NULL DEFAULT '',
      serviceType TEXT NOT NULL DEFAULT '',
      serviceCenter TEXT NOT NULL DEFAULT '',
      workDone TEXT NOT NULL DEFAULT '',
      nextServiceAt TEXT NOT NULL DEFAULT '',
      documentUri TEXT DEFAULT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      syncStatus TEXT NOT NULL DEFAULT 'pending',
      FOREIGN KEY (vehicleId) REFERENCES vehicles(id) ON DELETE CASCADE
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS part_records (
      id TEXT PRIMARY KEY NOT NULL,
      vehicleId TEXT NOT NULL,
      srNo INTEGER NOT NULL,
      partName TEXT NOT NULL DEFAULT '',
      partCategory TEXT NOT NULL DEFAULT '',
      dateOfReplacement TEXT NOT NULL DEFAULT '',
      odometerReading TEXT NOT NULL DEFAULT '',
      replacedAt TEXT NOT NULL DEFAULT '',
      cost TEXT NOT NULL DEFAULT '',
      warranty TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      documentUri TEXT DEFAULT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      syncStatus TEXT NOT NULL DEFAULT 'pending',
      FOREIGN KEY (vehicleId) REFERENCES vehicles(id) ON DELETE CASCADE
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS insurance_records (
      id TEXT PRIMARY KEY NOT NULL,
      vehicleId TEXT NOT NULL,
      srNo INTEGER NOT NULL,
      policyNo TEXT NOT NULL DEFAULT '',
      insuranceProvider TEXT NOT NULL DEFAULT '',
      policyType TEXT NOT NULL DEFAULT '',
      policyIssueDate TEXT NOT NULL DEFAULT '',
      startDate TEXT NOT NULL DEFAULT '',
      expiryDate TEXT NOT NULL DEFAULT '',
      premiumAmount TEXT NOT NULL DEFAULT '',
      documentUri TEXT DEFAULT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      syncStatus TEXT NOT NULL DEFAULT 'pending',
      FOREIGN KEY (vehicleId) REFERENCES vehicles(id) ON DELETE CASCADE
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY NOT NULL,
      vehicleId TEXT NOT NULL,
      reminderType TEXT NOT NULL DEFAULT 'servicing',
      title TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      reminderDate TEXT NOT NULL DEFAULT '',
      notificationId TEXT DEFAULT NULL,
      isCompleted INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      syncStatus TEXT NOT NULL DEFAULT 'pending',
      FOREIGN KEY (vehicleId) REFERENCES vehicles(id) ON DELETE CASCADE
    );
  `);
}
