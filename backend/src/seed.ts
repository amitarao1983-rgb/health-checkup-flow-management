import { store } from './services/store.js';
import { notificationService } from './services/notifications.js';
import { HealthPackage, DepartmentId, PatientStatus } from './types/index.js';
import { DEPARTMENTS } from './data/departments.js';

const PATHWAY_COLORS = ['#22d3ee', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#60a5fa', '#fb923c', '#4ade80'];

interface SamplePatient {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  healthPackage: HealthPackage;
  registeredHour: number;
  registeredMinute: number;
}

const SAMPLE_PATIENTS: SamplePatient[] = [
  { name: 'Rajesh Kumar', age: 45, gender: 'male', phone: '+91-9876543210', healthPackage: 'executive', registeredHour: 7, registeredMinute: 15 },
  { name: 'Priya Sharma', age: 38, gender: 'female', phone: '+91-9876543211', healthPackage: 'womens_health', registeredHour: 7, registeredMinute: 30 },
  { name: 'Amit Patel', age: 52, gender: 'male', phone: '+91-9876543212', healthPackage: 'cardiac', registeredHour: 7, registeredMinute: 45 },
  { name: 'Sneha Reddy', age: 29, gender: 'female', phone: '+91-9876543213', healthPackage: 'standard', registeredHour: 8, registeredMinute: 0 },
  { name: 'Vikram Singh', age: 61, gender: 'male', phone: '+91-9876543214', healthPackage: 'comprehensive', registeredHour: 8, registeredMinute: 10 },
  { name: 'Anita Desai', age: 42, gender: 'female', phone: '+91-9876543215', healthPackage: 'basic', registeredHour: 8, registeredMinute: 25 },
  { name: 'Rahul Mehta', age: 35, gender: 'male', phone: '+91-9876543216', healthPackage: 'executive', registeredHour: 8, registeredMinute: 40 },
  { name: 'Kavita Joshi', age: 48, gender: 'female', phone: '+91-9876543217', healthPackage: 'womens_health', registeredHour: 9, registeredMinute: 0 },
  { name: 'Suresh Iyer', age: 55, gender: 'male', phone: '+91-9876543218', healthPackage: 'cardiac', registeredHour: 9, registeredMinute: 15 },
  { name: 'Meera Nair', age: 33, gender: 'female', phone: '+91-9876543219', healthPackage: 'comprehensive', registeredHour: 9, registeredMinute: 30 },
  { name: 'Deepak Gupta', age: 44, gender: 'male', phone: '+91-9876543220', healthPackage: 'standard', registeredHour: 9, registeredMinute: 45 },
  { name: 'Lakshmi Rao', age: 50, gender: 'female', phone: '+91-9876543221', healthPackage: 'executive', registeredHour: 10, registeredMinute: 0 },
  { name: 'Arjun Malhotra', age: 28, gender: 'male', phone: '+91-9876543222', healthPackage: 'basic', registeredHour: 10, registeredMinute: 20 },
  { name: 'Pooja Verma', age: 36, gender: 'female', phone: '+91-9876543223', healthPackage: 'womens_health', registeredHour: 10, registeredMinute: 35 },
  { name: 'Harish Choudhary', age: 58, gender: 'male', phone: '+91-9876543224', healthPackage: 'cardiac', registeredHour: 10, registeredMinute: 50 },
  { name: 'Divya Krishnan', age: 31, gender: 'female', phone: '+91-9876543225', healthPackage: 'comprehensive', registeredHour: 11, registeredMinute: 5 },
  { name: 'Manoj Pillai', age: 47, gender: 'male', phone: '+91-9876543226', healthPackage: 'standard', registeredHour: 11, registeredMinute: 20 },
  { name: 'Ritu Saxena', age: 39, gender: 'female', phone: '+91-9876543227', healthPackage: 'executive', registeredHour: 11, registeredMinute: 40 },
  { name: 'Karan Bhatt', age: 43, gender: 'male', phone: '+91-9876543228', healthPackage: 'comprehensive', registeredHour: 12, registeredMinute: 0 },
  { name: 'Neha Kapoor', age: 27, gender: 'female', phone: '+91-9876543229', healthPackage: 'standard', registeredHour: 12, registeredMinute: 15 },
  { name: 'Sanjay Dutta', age: 54, gender: 'male', phone: '+91-9876543230', healthPackage: 'cardiac', registeredHour: 12, registeredMinute: 30 },
  { name: 'Anjali Menon', age: 41, gender: 'female', phone: '+91-9876543231', healthPackage: 'womens_health', registeredHour: 13, registeredMinute: 0 },
  { name: 'Rohit Agarwal', age: 37, gender: 'male', phone: '+91-9876543232', healthPackage: 'executive', registeredHour: 13, registeredMinute: 20 },
  { name: 'Swati Bansal', age: 46, gender: 'female', phone: '+91-9876543233', healthPackage: 'basic', registeredHour: 13, registeredMinute: 45 },
  { name: 'Gopal Das', age: 62, gender: 'male', phone: '+91-9876543234', healthPackage: 'comprehensive', registeredHour: 14, registeredMinute: 10 },
  { name: 'Tanvi Shah', age: 30, gender: 'female', phone: '+91-9876543235', healthPackage: 'standard', registeredHour: 14, registeredMinute: 30 },
  { name: 'Naveen Kulkarni', age: 49, gender: 'male', phone: '+91-9876543236', healthPackage: 'cardiac', registeredHour: 14, registeredMinute: 50 },
  { name: 'Isha Pandey', age: 34, gender: 'female', phone: '+91-9876543237', healthPackage: 'womens_health', registeredHour: 15, registeredMinute: 10 },
];

/** Per-department queue seed: [patientIndex, status, assignedMinAgo, startedMinAgo?, completedMinAgo?, waitEst] */
type QueueSeed = [number, PatientStatus, number, number?, number?, number?];

const DEPARTMENT_QUEUE_SEEDS: Record<DepartmentId, QueueSeed[]> = {
  lab: [
    [0, 'completed', 180, 175, 170],
    [1, 'completed', 165, 160, 155],
    [2, 'completed', 150, 145, 140],
    [3, 'completed', 130, 125, 120],
    [4, 'completed', 110, 105, 100],
    [5, 'completed', 95, 90, 85],
    [6, 'completed', 80, 75, 70],
    [7, 'completed', 65, 60, 55],
    [8, 'in_progress', 45, 40, undefined, 8],
    [9, 'in_progress', 42, 38, undefined, 5],
    [10, 'waiting', 35, undefined, undefined, 12],
    [11, 'waiting', 30, undefined, undefined, 18],
    [12, 'waiting', 25, undefined, undefined, 22],
    [13, 'waiting', 20, undefined, undefined, 28],
    [14, 'waiting', 15, undefined, undefined, 32],
    [15, 'waiting', 12, undefined, undefined, 38],
    [16, 'waiting', 8, undefined, undefined, 42],
  ],
  ecg: [
    [0, 'completed', 160, 155, 148],
    [1, 'completed', 140, 135, 128],
    [2, 'completed', 120, 115, 108],
    [4, 'completed', 100, 95, 88],
    [6, 'completed', 85, 80, 73],
    [8, 'completed', 70, 65, 58],
    [10, 'in_progress', 50, 45, undefined, 10],
    [11, 'waiting', 40, undefined, undefined, 15],
    [12, 'waiting', 35, undefined, undefined, 22],
    [13, 'waiting', 28, undefined, undefined, 28],
    [14, 'delayed', 55, undefined, undefined, 45],
    [16, 'waiting', 18, undefined, undefined, 35],
  ],
  xray: [
    [0, 'completed', 145, 140, 130],
    [3, 'completed', 125, 120, 110],
    [5, 'completed', 105, 100, 90],
    [7, 'completed', 88, 83, 75],
    [9, 'in_progress', 60, 55, undefined, 12],
    [10, 'in_progress', 55, 50, undefined, 8],
    [11, 'waiting', 45, undefined, undefined, 18],
    [12, 'waiting', 38, undefined, undefined, 25],
    [13, 'waiting', 32, undefined, undefined, 32],
    [15, 'waiting', 22, undefined, undefined, 38],
    [17, 'waiting', 15, undefined, undefined, 45],
  ],
  usg: [
    [1, 'completed', 130, 125, 110],
    [4, 'completed', 115, 110, 95],
    [7, 'completed', 95, 90, 75],
    [10, 'in_progress', 70, 65, undefined, 15],
    [11, 'waiting', 55, undefined, undefined, 22],
    [14, 'waiting', 40, undefined, undefined, 30],
    [18, 'waiting', 25, undefined, undefined, 38],
  ],
  mammography: [
    [1, 'completed', 120, 115, 95],
    [8, 'completed', 100, 95, 78],
    [13, 'in_progress', 75, 70, undefined, 20],
    [14, 'waiting', 60, undefined, undefined, 35],
    [18, 'waiting', 50, undefined, undefined, 45],
    [21, 'waiting', 35, undefined, undefined, 55],
    [24, 'delayed', 80, undefined, undefined, 65],
    [26, 'delayed', 70, undefined, undefined, 58],
  ],
  echo2d: [
    [2, 'completed', 135, 130, 105],
    [5, 'completed', 115, 110, 85],
    [9, 'completed', 95, 90, 65],
    [12, 'completed', 75, 70, 48],
    [15, 'in_progress', 55, 50, undefined, 18],
    [16, 'waiting', 42, undefined, undefined, 28],
    [19, 'waiting', 28, undefined, undefined, 38],
  ],
  tmt: [
    [2, 'completed', 110, 105, 65],
    [5, 'in_progress', 90, 85, undefined, 25],
    [9, 'waiting', 70, undefined, undefined, 40],
    [12, 'waiting', 55, undefined, undefined, 55],
    [15, 'delayed', 85, undefined, undefined, 70],
  ],
  dental: [
    [0, 'completed', 100, 95, 78],
    [3, 'completed', 85, 80, 62],
    [6, 'completed', 70, 65, 48],
    [8, 'completed', 55, 50, 35],
    [11, 'completed', 40, 35, 22],
    [14, 'in_progress', 30, 25, undefined, 10],
    [17, 'waiting', 20, undefined, undefined, 18],
    [20, 'waiting', 12, undefined, undefined, 25],
  ],
  doctor: [
    [0, 'completed', 90, 85, 72],
    [1, 'completed', 80, 75, 62],
    [2, 'completed', 70, 65, 52],
    [3, 'completed', 60, 55, 42],
    [4, 'completed', 50, 45, 35],
    [5, 'completed', 45, 40, 30],
    [6, 'completed', 38, 33, 25],
    [7, 'completed', 32, 27, 20],
    [8, 'in_progress', 25, 20, undefined, 8],
    [9, 'in_progress', 22, 18, undefined, 5],
    [10, 'waiting', 18, undefined, undefined, 12],
    [11, 'waiting', 15, undefined, undefined, 18],
    [12, 'waiting', 12, undefined, undefined, 22],
    [13, 'waiting', 10, undefined, undefined, 28],
    [14, 'waiting', 8, undefined, undefined, 32],
    [15, 'waiting', 6, undefined, undefined, 38],
  ],
};

/** Active department assignment per patient index */
const PATIENT_ACTIVE_DEPT: Record<number, { current?: DepartmentId; completed: DepartmentId[]; pending: DepartmentId[]; status: 'in_progress' | 'completed' }> = {
  0: { current: 'doctor', completed: ['lab', 'ecg', 'xray', 'usg', 'echo2d', 'tmt', 'dental'], pending: ['doctor'], status: 'in_progress' },
  1: { current: 'mammography', completed: ['lab', 'usg'], pending: ['mammography', 'doctor'], status: 'in_progress' },
  2: { current: 'tmt', completed: ['lab', 'ecg', 'echo2d'], pending: ['tmt', 'doctor'], status: 'in_progress' },
  3: { current: 'xray', completed: ['lab'], pending: ['ecg', 'xray', 'doctor'], status: 'in_progress' },
  4: { current: 'usg', completed: ['lab', 'ecg'], pending: ['xray', 'usg', 'echo2d', 'doctor'], status: 'in_progress' },
  5: { completed: ['lab', 'ecg', 'xray', 'doctor'], pending: [], status: 'completed' },
  6: { current: 'ecg', completed: ['lab'], pending: ['ecg', 'doctor'], status: 'in_progress' },
  7: { current: 'usg', completed: ['lab'], pending: ['usg', 'mammography', 'doctor'], status: 'in_progress' },
  8: { current: 'doctor', completed: ['lab', 'ecg', 'echo2d', 'dental'], pending: ['doctor'], status: 'in_progress' },
  9: { current: 'echo2d', completed: ['lab', 'ecg', 'xray'], pending: ['echo2d', 'tmt', 'doctor'], status: 'in_progress' },
  10: { current: 'lab', completed: [], pending: ['lab', 'ecg', 'xray', 'doctor'], status: 'in_progress' },
  11: { current: 'ecg', completed: ['lab'], pending: ['ecg', 'xray', 'doctor'], status: 'in_progress' },
  12: { current: 'xray', completed: ['lab', 'ecg'], pending: ['xray', 'doctor'], status: 'in_progress' },
  13: { current: 'mammography', completed: ['lab', 'usg'], pending: ['mammography', 'doctor'], status: 'in_progress' },
  14: { current: 'dental', completed: ['lab', 'ecg', 'xray', 'usg'], pending: ['echo2d', 'tmt', 'dental', 'doctor'], status: 'in_progress' },
  15: { current: 'echo2d', completed: ['lab', 'ecg', 'xray'], pending: ['usg', 'echo2d', 'doctor'], status: 'in_progress' },
  16: { current: 'ecg', completed: ['lab'], pending: ['ecg', 'xray', 'usg', 'echo2d', 'doctor'], status: 'in_progress' },
  17: { current: 'dental', completed: ['lab', 'ecg', 'xray', 'usg', 'echo2d', 'tmt'], pending: ['dental', 'doctor'], status: 'in_progress' },
  18: { current: 'mammography', completed: ['lab', 'usg'], pending: ['mammography', 'doctor'], status: 'in_progress' },
  19: { current: 'echo2d', completed: ['lab', 'ecg', 'xray'], pending: ['usg', 'echo2d', 'doctor'], status: 'in_progress' },
  20: { current: 'dental', completed: ['lab', 'ecg', 'xray', 'usg', 'echo2d', 'tmt'], pending: ['dental', 'doctor'], status: 'in_progress' },
  21: { current: 'mammography', completed: ['lab'], pending: ['usg', 'mammography', 'doctor'], status: 'in_progress' },
  22: { current: 'lab', completed: [], pending: ['lab', 'ecg', 'xray', 'usg', 'echo2d', 'tmt', 'dental', 'doctor'], status: 'in_progress' },
  23: { completed: ['lab', 'ecg', 'doctor'], pending: [], status: 'completed' },
  24: { current: 'mammography', completed: ['lab', 'usg'], pending: ['mammography', 'doctor'], status: 'in_progress' },
  25: { current: 'lab', completed: [], pending: ['lab', 'ecg', 'xray', 'doctor'], status: 'in_progress' },
  26: { current: 'mammography', completed: ['lab'], pending: ['usg', 'mammography', 'doctor'], status: 'in_progress' },
  27: { current: undefined, completed: ['lab', 'usg', 'mammography', 'doctor'], pending: [], status: 'completed' },
};

function todayAt(hour: number, minute: number): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

function seedDepartmentQueues(patientIds: string[]): void {
  for (const dept of DEPARTMENTS) {
    const seeds = DEPARTMENT_QUEUE_SEEDS[dept.id] ?? [];
    let waitingPos = 1;

    for (const seed of seeds) {
      const [patientIdx, status, assignedMinAgo, startedMinAgo, completedMinAgo, waitEst] = seed;
      const patientId = patientIds[patientIdx];
      if (!patientId) continue;

      const position =
        status === 'waiting' || status === 'delayed' ? waitingPos++ : 0;

      store.seedQueueEntry(patientId, dept.id, status, {
        assignedMinutesAgo: assignedMinAgo,
        startedMinutesAgo: startedMinAgo,
        completedMinutesAgo: completedMinAgo,
        position,
        estimatedWaitMinutes: waitEst ?? position * 8,
      });
    }

    store.recalculatePositions(dept.id);
  }
}

function seedPatientJourneys(patientIds: string[]): void {
  for (const [idxStr, journey] of Object.entries(PATIENT_ACTIVE_DEPT)) {
    const idx = Number(idxStr);
    const patientId = patientIds[idx];
    if (!patientId) continue;

    store.setPatientJourney(patientId, {
      completedDepartments: journey.completed,
      pendingDepartments: journey.pending,
      currentDepartment: journey.current,
      status: journey.status,
    });
  }
}

function seedNotifications(patientIds: string[]): void {
  const messages = [
    { idx: 10, msg: 'Welcome! Token issued. Proceed to Laboratory — shortest wait.', type: 'sms' as const },
    { idx: 1, msg: '🔄 AI Suggestion: USG queue is shorter than Mammography. Visit USG first if not done.', type: 'whatsapp' as const },
    { idx: 14, msg: 'Dental has only 2 patients waiting. Visit Dental while Echo queue clears.', type: 'whatsapp' as const },
    { idx: 24, msg: '⚠ Mammography delay alert: estimated wait 55 min. Coordinator notified.', type: 'in_app' as const },
    { idx: 0, msg: '✅ All tests done except Doctor consultation. Token HC20260624-0001.', type: 'in_app' as const },
  ];

  for (const { idx, msg, type } of messages) {
    const id = patientIds[idx];
    if (id) store.addNotification(id, msg, type);
  }
}

export function seedData(force = false): void {
  if (!force && store.getAllPatients().length > 0) return;

  if (force) store.clearAll();

  const patientIds: string[] = [];

  SAMPLE_PATIENTS.forEach((data, i) => {
    const { registeredHour, registeredMinute, ...patientData } = data;
    const patient = store.registerPatient(patientData);
    patient.pathwayColor = PATHWAY_COLORS[i % PATHWAY_COLORS.length];

    const registeredAt = todayAt(registeredHour, registeredMinute);
    const checkInAt = new Date(registeredAt.getTime() + 5 * 60000);
    store.setPatientTimestamps(patient.id, registeredAt, checkInAt);
    patientIds.push(patient.id);
  });

  seedDepartmentQueues(patientIds);
  seedPatientJourneys(patientIds);
  seedNotifications(patientIds);

  console.log(`✅ Seeded ${SAMPLE_PATIENTS.length} patients across ${DEPARTMENTS.length} departments`);
}

export function buildDepartmentTimelines() {
  const now = new Date();
  const startHour = 7;
  const endHour = now.getHours();

  return DEPARTMENTS.map((dept) => {
    const queue = store.getQueue(dept.id);
    const hours: string[] = [];
    for (let h = startHour; h <= Math.max(endHour, 15); h++) {
      hours.push(`${String(h).padStart(2, '0')}:00`);
    }

    const hourlyFlow = hours.map((hourLabel) => {
      const hour = parseInt(hourLabel, 10);
      const inHour = (iso: string | undefined) => {
        if (!iso) return false;
        return new Date(iso).getHours() === hour;
      };

      return {
        hour: hourLabel,
        completed: queue.filter((q) => inHour(q.completedAt)).length,
        inProgress: queue.filter(
          (q) => q.status === 'in_progress' && inHour(q.startedAt)
        ).length,
        waiting: queue.filter(
          (q) =>
            (q.status === 'waiting' || q.status === 'delayed') && inHour(q.assignedAt)
        ).length,
      };
    });

    const waiting = queue.filter((q) => q.status === 'waiting').length;
    const delayed = queue.filter((q) => q.status === 'delayed').length;
    const inProgress = queue.filter((q) => q.status === 'in_progress').length;
    const completed = queue.filter((q) => q.status === 'completed').length;

    return {
      departmentId: dept.id,
      name: dept.name,
      icon: dept.icon,
      targetWaitMinutes: dept.targetWaitMinutes,
      avgExamMinutes: dept.avgExamMinutes,
      capacity: dept.capacity,
      hourlyFlow,
      workload: {
        waiting,
        delayed,
        inProgress,
        completed,
        totalActive: waiting + delayed + inProgress,
        occupancyPercent: Math.min(
          100,
          Math.round(((waiting + delayed + inProgress) / (dept.capacity * 4)) * 100)
        ),
      },
    };
  });
}

export function buildWorkloadSummary() {
  const timelines = buildDepartmentTimelines();
  return {
    departments: timelines.map((t) => ({
      departmentId: t.departmentId,
      name: t.name,
      icon: t.icon,
      ...t.workload,
      targetWaitMinutes: t.targetWaitMinutes,
      isOverloaded: t.workload.occupancyPercent > 75 || t.workload.delayed > 0,
    })),
    totals: {
      waiting: timelines.reduce((s, t) => s + t.workload.waiting, 0),
      inProgress: timelines.reduce((s, t) => s + t.workload.inProgress, 0),
      completed: timelines.reduce((s, t) => s + t.workload.completed, 0),
      delayed: timelines.reduce((s, t) => s + t.workload.delayed, 0),
    },
  };
}
