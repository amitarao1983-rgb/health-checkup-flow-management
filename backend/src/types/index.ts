export type DepartmentId =
  | 'ecg'
  | 'xray'
  | 'usg'
  | 'mammography'
  | 'echo2d'
  | 'tmt'
  | 'dental'
  | 'lab'
  | 'doctor';

export type PatientStatus = 'waiting' | 'in_progress' | 'completed' | 'delayed' | 'redirected';

export type HealthPackage =
  | 'basic'
  | 'standard'
  | 'comprehensive'
  | 'executive'
  | 'cardiac'
  | 'womens_health';

export interface DepartmentConfig {
  id: DepartmentId;
  name: string;
  targetWaitMinutes: number;
  avgExamMinutes: number;
  capacity: number;
  icon: string;
}

export interface QueueEntry {
  id: string;
  patientId: string;
  departmentId: DepartmentId;
  tokenNumber: string;
  status: PatientStatus;
  position: number;
  estimatedWaitMinutes: number;
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  healthPackage: HealthPackage;
  qrCode: string;
  tokenNumber: string;
  registeredAt: string;
  checkInAt?: string;
  completedDepartments: DepartmentId[];
  pendingDepartments: DepartmentId[];
  currentDepartment?: DepartmentId;
  status: 'registered' | 'checked_in' | 'in_progress' | 'completed';
  pathwayColor: string;
}

export interface Notification {
  id: string;
  patientId: string;
  type: 'sms' | 'whatsapp' | 'in_app';
  message: string;
  sentAt: string;
  read: boolean;
}

export interface RoutingSuggestion {
  patientId: string;
  fromDepartment: DepartmentId;
  toDepartment: DepartmentId;
  reason: string;
  savedWaitMinutes: number;
  confidence: number;
}

export interface DepartmentStats {
  departmentId: DepartmentId;
  name: string;
  queueLength: number;
  inProgress: number;
  completedToday: number;
  avgWaitMinutes: number;
  avgExamMinutes: number;
  occupancyPercent: number;
  isOverTarget: boolean;
  currentPatient?: QueueEntry;
  nextPatients: QueueEntry[];
}

export interface DashboardStats {
  totalRegistered: number;
  checkedIn: number;
  inProgress: number;
  completed: number;
  delayed: number;
  registrationsByHour: { hour: string; count: number }[];
  departmentLoad: { departmentId: DepartmentId; load: number }[];
}

export interface DailyReport {
  date: string;
  totalPatients: number;
  completedPatients: number;
  avgTotalTimeMinutes: number;
  departmentBreakdown: {
    departmentId: DepartmentId;
    processed: number;
    avgWait: number;
    delays: number;
  }[];
}
