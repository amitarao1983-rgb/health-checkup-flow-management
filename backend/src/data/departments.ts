import { DepartmentConfig, DepartmentId, HealthPackage } from '../types/index.js';

export const DEPARTMENTS: DepartmentConfig[] = [
  { id: 'ecg', name: 'ECG', targetWaitMinutes: 15, avgExamMinutes: 10, capacity: 2, icon: '❤️' },
  { id: 'xray', name: 'X-Ray', targetWaitMinutes: 20, avgExamMinutes: 15, capacity: 3, icon: '📷' },
  { id: 'usg', name: 'USG', targetWaitMinutes: 25, avgExamMinutes: 20, capacity: 2, icon: '🔊' },
  { id: 'mammography', name: 'Mammography', targetWaitMinutes: 30, avgExamMinutes: 25, capacity: 1, icon: '🎗️' },
  { id: 'echo2d', name: '2D Echo', targetWaitMinutes: 20, avgExamMinutes: 30, capacity: 2, icon: '💓' },
  { id: 'tmt', name: 'TMT', targetWaitMinutes: 30, avgExamMinutes: 45, capacity: 1, icon: '🏃' },
  { id: 'dental', name: 'Dental', targetWaitMinutes: 15, avgExamMinutes: 20, capacity: 2, icon: '🦷' },
  { id: 'lab', name: 'Laboratory', targetWaitMinutes: 10, avgExamMinutes: 5, capacity: 4, icon: '🧪' },
  { id: 'doctor', name: 'Doctor Consultation', targetWaitMinutes: 20, avgExamMinutes: 15, capacity: 3, icon: '👨‍⚕️' },
];

export const PACKAGE_DEPARTMENTS: Record<HealthPackage, DepartmentId[]> = {
  basic: ['lab', 'ecg', 'doctor'],
  standard: ['lab', 'ecg', 'xray', 'doctor'],
  comprehensive: ['lab', 'ecg', 'xray', 'usg', 'echo2d', 'doctor'],
  executive: ['lab', 'ecg', 'xray', 'usg', 'echo2d', 'tmt', 'dental', 'doctor'],
  cardiac: ['lab', 'ecg', 'echo2d', 'tmt', 'doctor'],
  womens_health: ['lab', 'usg', 'mammography', 'doctor'],
};

export const PACKAGE_LABELS: Record<HealthPackage, string> = {
  basic: 'Basic Health Check-up',
  standard: 'Standard Health Package',
  comprehensive: 'Comprehensive Health Package',
  executive: 'Executive Health Package',
  cardiac: 'Cardiac Screening Package',
  womens_health: "Women's Health Package",
};

export function getDepartment(id: DepartmentId): DepartmentConfig {
  const dept = DEPARTMENTS.find((d) => d.id === id);
  if (!dept) throw new Error(`Unknown department: ${id}`);
  return dept;
}
