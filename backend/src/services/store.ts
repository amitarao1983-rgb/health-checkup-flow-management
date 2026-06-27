import { v4 as uuidv4 } from 'uuid';
import {
  Patient,
  QueueEntry,
  Notification,
  DepartmentId,
  PatientStatus,
  HealthPackage,
} from '../types/index.js';
import { PACKAGE_DEPARTMENTS } from '../data/departments.js';

class DataStore {
  patients: Map<string, Patient> = new Map();
  queues: Map<DepartmentId, QueueEntry[]> = new Map();
  notifications: Map<string, Notification[]> = new Map();
  dailyTokenCounter = 0;

  constructor() {
    const deptIds: DepartmentId[] = [
      'ecg', 'xray', 'usg', 'mammography', 'echo2d', 'tmt', 'dental', 'lab', 'doctor',
    ];
    deptIds.forEach((id) => this.queues.set(id, []));
  }

  generateToken(): string {
    this.dailyTokenCounter += 1;
    const date = new Date();
    const prefix = `HC${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    return `${prefix}-${String(this.dailyTokenCounter).padStart(4, '0')}`;
  }

  generateQrCode(patientId: string): string {
    return `HCUP-${patientId.slice(0, 8).toUpperCase()}`;
  }

  registerPatient(data: {
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    phone: string;
    email?: string;
    healthPackage: HealthPackage;
  }): Patient {
    const id = uuidv4();
    const tokenNumber = this.generateToken();
    const pendingDepartments = [...PACKAGE_DEPARTMENTS[data.healthPackage]];
    const pathwayColors = ['#22d3ee', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#60a5fa'];
    const patient: Patient = {
      id,
      ...data,
      tokenNumber,
      qrCode: this.generateQrCode(id),
      registeredAt: new Date().toISOString(),
      completedDepartments: [],
      pendingDepartments,
      status: 'registered',
      pathwayColor: pathwayColors[Math.floor(Math.random() * pathwayColors.length)],
    };
    this.patients.set(id, patient);
    return patient;
  }

  checkInPatient(patientId: string): Patient | null {
    const patient = this.patients.get(patientId);
    if (!patient) return null;
    patient.checkInAt = new Date().toISOString();
    patient.status = 'checked_in';
    return patient;
  }

  addToQueue(patientId: string, departmentId: DepartmentId): QueueEntry {
    const patient = this.patients.get(patientId);
    if (!patient) throw new Error('Patient not found');

    const queue = this.queues.get(departmentId)!;
    const position = queue.filter((q) => q.status === 'waiting' || q.status === 'delayed').length + 1;

    const entry: QueueEntry = {
      id: uuidv4(),
      patientId,
      departmentId,
      tokenNumber: patient.tokenNumber,
      status: 'waiting',
      position,
      estimatedWaitMinutes: position * 8,
      assignedAt: new Date().toISOString(),
    };

    queue.push(entry);
    patient.currentDepartment = departmentId;
    patient.status = 'in_progress';
    return entry;
  }

  getQueue(departmentId: DepartmentId): QueueEntry[] {
    return this.queues.get(departmentId) ?? [];
  }

  updateQueueStatus(entryId: string, departmentId: DepartmentId, status: PatientStatus): QueueEntry | null {
    const queue = this.queues.get(departmentId);
    if (!queue) return null;

    const entry = queue.find((q) => q.id === entryId);
    if (!entry) return null;

    entry.status = status;
    if (status === 'in_progress') entry.startedAt = new Date().toISOString();
    if (status === 'completed') entry.completedAt = new Date().toISOString();

    const patient = this.patients.get(entry.patientId);
    if (patient && status === 'completed') {
      if (!patient.completedDepartments.includes(departmentId)) {
        patient.completedDepartments.push(departmentId);
      }
      patient.pendingDepartments = patient.pendingDepartments.filter((d) => d !== departmentId);
      if (patient.pendingDepartments.length === 0) {
        patient.status = 'completed';
        patient.currentDepartment = undefined;
      }
    }

    this.recalculatePositions(departmentId);
    return entry;
  }

  recalculatePositions(departmentId: DepartmentId): void {
    const queue = this.queues.get(departmentId)!;
    let pos = 1;
    queue
      .filter((q) => q.status === 'waiting' || q.status === 'delayed')
      .sort((a, b) => new Date(a.assignedAt).getTime() - new Date(b.assignedAt).getTime())
      .forEach((entry) => {
        entry.position = pos++;
        entry.estimatedWaitMinutes = pos * 7 + Math.floor(Math.random() * 5);
      });
  }

  addNotification(patientId: string, message: string, type: Notification['type'] = 'in_app'): Notification {
    const notification: Notification = {
      id: uuidv4(),
      patientId,
      type,
      message,
      sentAt: new Date().toISOString(),
      read: false,
    };
    const existing = this.notifications.get(patientId) ?? [];
    existing.unshift(notification);
    this.notifications.set(patientId, existing);
    return notification;
  }

  getAllPatients(): Patient[] {
    return Array.from(this.patients.values());
  }

  getPatient(id: string): Patient | undefined {
    return this.patients.get(id);
  }

  findPatientByQr(qrCode: string): Patient | undefined {
    return Array.from(this.patients.values()).find(
      (p) => p.qrCode === qrCode || p.tokenNumber === qrCode
    );
  }

  /** Dev/seed: wipe in-memory data */
  clearAll(): void {
    this.patients.clear();
    this.notifications.clear();
    this.dailyTokenCounter = 0;
    for (const id of this.queues.keys()) {
      this.queues.set(id, []);
    }
  }

  /** Dev/seed: set registration/check-in timestamps */
  setPatientTimestamps(
    patientId: string,
    registeredAt: Date,
    checkInAt?: Date
  ): void {
    const patient = this.patients.get(patientId);
    if (!patient) return;
    patient.registeredAt = registeredAt.toISOString();
    if (checkInAt) {
      patient.checkInAt = checkInAt.toISOString();
      patient.status = 'checked_in';
    }
  }

  /** Dev/seed: set patient journey state */
  setPatientJourney(
    patientId: string,
    data: {
      completedDepartments: DepartmentId[];
      pendingDepartments: DepartmentId[];
      currentDepartment?: DepartmentId;
      status: Patient['status'];
    }
  ): void {
    const patient = this.patients.get(patientId);
    if (!patient) return;
    patient.completedDepartments = [...data.completedDepartments];
    patient.pendingDepartments = [...data.pendingDepartments];
    patient.currentDepartment = data.currentDepartment;
    patient.status = data.status;
  }

  /** Dev/seed: insert queue entry with realistic timestamps */
  seedQueueEntry(
    patientId: string,
    departmentId: DepartmentId,
    status: PatientStatus,
    options: {
      assignedMinutesAgo: number;
      startedMinutesAgo?: number;
      completedMinutesAgo?: number;
      position?: number;
      estimatedWaitMinutes?: number;
    }
  ): QueueEntry {
    const patient = this.patients.get(patientId);
    if (!patient) throw new Error(`Patient not found: ${patientId}`);

    const now = Date.now();
    const assignedAt = new Date(now - options.assignedMinutesAgo * 60000).toISOString();
    const startedAt =
      options.startedMinutesAgo !== undefined
        ? new Date(now - options.startedMinutesAgo * 60000).toISOString()
        : status === 'in_progress' || status === 'completed'
          ? new Date(now - (options.startedMinutesAgo ?? options.assignedMinutesAgo - 5) * 60000).toISOString()
          : undefined;
    const completedAt =
      options.completedMinutesAgo !== undefined
        ? new Date(now - options.completedMinutesAgo * 60000).toISOString()
        : status === 'completed'
          ? new Date(now - 5 * 60000).toISOString()
          : undefined;

    const entry: QueueEntry = {
      id: uuidv4(),
      patientId,
      departmentId,
      tokenNumber: patient.tokenNumber,
      status,
      position: options.position ?? 1,
      estimatedWaitMinutes: options.estimatedWaitMinutes ?? 10,
      assignedAt,
      startedAt,
      completedAt,
    };

    this.queues.get(departmentId)!.push(entry);
    return entry;
  }
}

export const store = new DataStore();
