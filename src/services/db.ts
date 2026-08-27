import { User, PredictionResult, AuditLog, AppSettings } from '../types';
import { hashPassword, generateId } from '../utils/crypto';

const DB_KEY = 'hikmarisk_db';

interface DatabaseSchema {
  users: User[];
  predictions: PredictionResult[];
  audit_logs: AuditLog[];
  settings: AppSettings;
}

const DEFAULT_SETTINGS: AppSettings = {
  apiUrl: '/api',
  mode: 'offline',
  darkMode: false,
  lastSync: undefined,
};

let dbInitialized = false;

export async function initDatabase(): Promise<DatabaseSchema> {
  const existing = localStorage.getItem(DB_KEY);
  if (existing) {
    try {
      const parsed: DatabaseSchema = JSON.parse(existing);
      // Clean any legacy mock predictions or audit logs if present
      const cleanedPredictions = (parsed.predictions || []).filter(
        (p) => !['pred-101', 'pred-102', 'pred-103'].includes(p.id)
      );
      const cleanedAuditLogs = (parsed.audit_logs || []).filter(
        (l) => !['log-1', 'log-2', 'log-3'].includes(l.id)
      );
      const cleanedUsers = (parsed.users || []).filter(
        (u) => !['u-patient-2', 'u-patient-3'].includes(u.id)
      );

      parsed.predictions = cleanedPredictions;
      parsed.audit_logs = cleanedAuditLogs;
      parsed.users = cleanedUsers;
      if (!parsed.settings) parsed.settings = DEFAULT_SETTINGS;

      localStorage.setItem(DB_KEY, JSON.stringify(parsed));
      dbInitialized = true;
      return parsed;
    } catch (e) {
      console.error('Failed to parse database from localStorage, re-initializing clean DB', e);
    }
  }

  const adminPassHash = await hashPassword('admin123');
  const patientPassHash = await hashPassword('patient123');

  const defaultAdmin: User = {
    id: 'u-admin-1',
    name: 'Dr. Sarah Lin (Admin)',
    email: 'admin@hikmarisk.med',
    passwordHash: adminPassHash,
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  const defaultPatient: User = {
    id: 'u-patient-1',
    name: 'Tariq Al-Mansoor',
    email: 'patient@hikmarisk.med',
    passwordHash: patientPassHash,
    role: 'patient',
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  const db: DatabaseSchema = {
    users: [defaultAdmin, defaultPatient],
    predictions: [],
    audit_logs: [],
    settings: DEFAULT_SETTINGS,
  };

  localStorage.setItem(DB_KEY, JSON.stringify(db));
  dbInitialized = true;
  return db;
}

export function getDatabase(): DatabaseSchema {
  const existing = localStorage.getItem(DB_KEY);
  if (!existing) {
    return {
      users: [],
      predictions: [],
      audit_logs: [],
      settings: DEFAULT_SETTINGS,
    };
  }
  try {
    const parsed: DatabaseSchema = JSON.parse(existing);
    return {
      users: parsed.users || [],
      predictions: (parsed.predictions || []).filter((p) => !['pred-101', 'pred-102', 'pred-103'].includes(p.id)),
      audit_logs: (parsed.audit_logs || []).filter((l) => !['log-1', 'log-2', 'log-3'].includes(l.id)),
      settings: parsed.settings || DEFAULT_SETTINGS,
    };
  } catch {
    return {
      users: [],
      predictions: [],
      audit_logs: [],
      settings: DEFAULT_SETTINGS,
    };
  }
}

export function saveDatabase(db: DatabaseSchema): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// User CRUD
export function getUsers(): User[] {
  return getDatabase().users || [];
}

export function saveUser(user: User): void {
  const db = getDatabase();
  const idx = db.users.findIndex((u) => u.id === user.id);
  if (idx >= 0) {
    db.users[idx] = user;
  } else {
    db.users.push(user);
  }
  saveDatabase(db);
}

export function deleteUser(userId: string): void {
  const db = getDatabase();
  db.users = db.users.filter((u) => u.id !== userId);
  saveDatabase(db);
}

export function toggleUserStatus(userId: string): User | null {
  const db = getDatabase();
  const user = db.users.find((u) => u.id === userId);
  if (user) {
    user.isActive = !user.isActive;
    saveDatabase(db);
    addAuditLog(user.id, user.email, 'USER_STATUS_TOGGLED', `User active status changed to ${user.isActive}`);
    return user;
  }
  return null;
}

// Predictions CRUD
export function getPredictions(userId?: string): PredictionResult[] {
  const all = getDatabase().predictions || [];
  if (userId) {
    return all.filter((p) => p.userId === userId);
  }
  return all;
}

export function savePrediction(pred: PredictionResult): void {
  const db = getDatabase();
  db.predictions.unshift(pred); // latest first
  saveDatabase(db);
  addAuditLog(
    pred.userId,
    pred.userEmail || 'unknown@user.com',
    'RISK_ASSESSMENT_COMPLETED',
    `Assessment completed with score ${pred.riskTier} (${(pred.probability * 100).toFixed(1)}%) in ${pred.mode} mode.`
  );
}

export function deletePrediction(predId: string): void {
  const db = getDatabase();
  db.predictions = db.predictions.filter((p) => p.id !== predId);
  saveDatabase(db);
}

// Audit Logs
export function getAuditLogs(): AuditLog[] {
  return getDatabase().audit_logs || [];
}

export function addAuditLog(userId: string, userEmail: string, action: string, details: string): void {
  const db = getDatabase();
  const log: AuditLog = {
    id: generateId(),
    userId,
    userEmail,
    action,
    details,
    timestamp: new Date().toISOString(),
  };
  db.audit_logs.unshift(log);
  if (db.audit_logs.length > 500) {
    db.audit_logs = db.audit_logs.slice(0, 500);
  }
  saveDatabase(db);
}

// App Settings
export function getSettings(): AppSettings {
  return getDatabase().settings || DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  const db = getDatabase();
  db.settings = settings;
  saveDatabase(db);
}

// Data Backup & Management
export function exportDatabaseBackup(): string {
  const db = getDatabase();
  return JSON.stringify(db, null, 2);
}

export function importDatabaseBackup(jsonString: string): boolean {
  try {
    const db: DatabaseSchema = JSON.parse(jsonString);
    if (Array.isArray(db.users) && Array.isArray(db.predictions) && Array.isArray(db.audit_logs)) {
      saveDatabase(db);
      return true;
    }
  } catch (e) {
    console.error('Invalid backup file format', e);
  }
  return false;
}

export async function resetDatabaseToDefault(): Promise<DatabaseSchema> {
  localStorage.removeItem(DB_KEY);
  return await initDatabase();
}
