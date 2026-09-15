// ===== Vehicle =====
export interface Vehicle {
  id: string;
  vehicleName: string;
  registrationNo: string;
  makeModel: string;
  year: string;
  fuelType: string;
  currentOdometer: string;
  photoUri?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'pending' | 'synced';
}

// ===== Servicing =====
export interface ServiceRecord {
  id: string;
  vehicleId: string;
  srNo: number;
  registrationNo: string;
  serviceDate: string;
  odometerReading: string;
  serviceType: string;
  serviceCenter: string;
  workDone: string;
  nextServiceAt: string;
  documentUri?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'pending' | 'synced';
}

// ===== Parts Changed =====
export interface PartRecord {
  id: string;
  vehicleId: string;
  srNo: number;
  partName: string;
  partCategory: string;
  dateOfReplacement: string;
  odometerReading: string;
  replacedAt: string;
  cost: string;
  warranty: string;
  notes: string;
  documentUri?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'pending' | 'synced';
}

// ===== Insurance =====
export interface InsuranceRecord {
  id: string;
  vehicleId: string;
  srNo: number;
  policyNo: string;
  insuranceProvider: string;
  policyType: string;
  policyIssueDate: string;
  startDate: string;
  expiryDate: string;
  premiumAmount: string;
  documentUri?: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'pending' | 'synced';
}

// ===== Reminders =====
export type ReminderType = 'servicing' | 'insurance';

export interface Reminder {
  id: string;
  vehicleId: string;
  reminderType: ReminderType;
  title: string;
  description: string;
  reminderDate: string;
  notificationId?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'pending' | 'synced';
}
