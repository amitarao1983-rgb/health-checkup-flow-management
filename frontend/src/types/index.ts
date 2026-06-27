export type DepartmentId =
  | 'ecg' | 'xray' | 'usg' | 'mammography' | 'echo2d' | 'tmt' | 'dental' | 'lab' | 'doctor';

export type PatientStatus = 'waiting' | 'in_progress' | 'completed' | 'delayed' | 'redirected';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email?: string;
  healthPackage: string;
  qrCode: string;
  tokenNumber: string;
  registeredAt: string;
  checkInAt?: string;
  completedDepartments: DepartmentId[];
  pendingDepartments: DepartmentId[];
  currentDepartment?: DepartmentId;
  status: string;
  pathwayColor: string;
}

export interface QueueEntry {
  id: string;
  patientId: string;
  departmentId: DepartmentId;
  tokenNumber: string;
  status: PatientStatus;
  position: number;
  estimatedWaitMinutes: number;
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
  departmentLoad: { departmentId: string; load: number }[];
}

export interface Notification {
  id: string;
  message: string;
  type: string;
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

export interface AIAlert {
  departmentId: DepartmentId;
  message: string;
  severity: 'warning' | 'critical';
}

export interface CompletionReport {
  date: string;
  totalPatients: number;
  completedPatients: number;
  avgTotalTimeMinutes: number;
  patients: {
    id: string;
    name: string;
    tokenNumber: string;
    status: string;
    completedDepartments: DepartmentId[];
    pendingDepartments: DepartmentId[];
    pathwayColor: string;
    progress: number;
  }[];
  departmentBreakdown: {
    departmentId: DepartmentId;
    name: string;
    processed: number;
    avgWait: number;
    delays: number;
  }[];
}

export interface HealthPackage {
  id: string;
  name: string;
}

export const DEPARTMENT_ICONS: Record<DepartmentId, string> = {
  ecg: '❤️', xray: '📷', usg: '🔊', mammography: '🎗️',
  echo2d: '💓', tmt: '🏃', dental: '🦷', lab: '🧪', doctor: '👨‍⚕️',
};

export const STATUS_COLORS: Record<PatientStatus, string> = {
  waiting: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  in_progress: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/30',
  completed: 'text-accent-green bg-accent-green/10 border-accent-green/30',
  delayed: 'text-red-400 bg-red-400/10 border-red-400/30',
  redirected: 'text-accent-purple bg-accent-purple/10 border-accent-purple/30',
};
