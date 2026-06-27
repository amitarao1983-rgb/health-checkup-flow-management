const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'Request failed');
  }
  return res.json();
}

export const api = {
  getPackages: () => fetchJson<{ id: string; name: string }[]>('/packages'),
  getDepartments: () => fetchJson<{ id: string; name: string; icon: string }[]>('/departments'),

  register: (data: {
    name: string; age: number; gender: string; phone: string;
    email?: string; healthPackage: string;
  }) => fetchJson<import('../types').Patient>('/register', {
    method: 'POST', body: JSON.stringify(data),
  }),

  getPatients: () => fetchJson<import('../types').Patient[]>('/patients'),
  getPatient: (id: string) => fetchJson<import('../types').Patient>(`/patients/${id}`),

  checkIn: (data: { qrCode?: string; patientId?: string }) =>
    fetchJson<{ patient: import('../types').Patient; queueEntry: unknown }>('/check-in', {
      method: 'POST', body: JSON.stringify(data),
    }),

  getPatientQueue: (id: string) => fetchJson<{ patient: import('../types').Patient; queues: unknown[] }>(`/patients/${id}/queue`),
  getNotifications: (id: string) => fetchJson<import('../types').Notification[]>(`/patients/${id}/notifications`),

  getAllQueues: () => fetchJson<import('../types').DepartmentStats[]>('/queue'),
  getDepartmentQueue: (id: string) => fetchJson<import('../types').DepartmentStats>(`/queue/${id}`),

  startExam: (deptId: string, entryId: string) =>
    fetchJson(`/queue/${deptId}/start/${entryId}`, { method: 'POST' }),
  completeExam: (deptId: string, entryId: string) =>
    fetchJson(`/queue/${deptId}/complete/${entryId}`, { method: 'POST' }),

  redirect: (data: { patientId: string; fromDepartment: string; toDepartment: string }) =>
    fetchJson('/queue/redirect', { method: 'POST', body: JSON.stringify(data) }),

  getAIPredictions: () => fetchJson<{
    departmentId: string; name: string; predictedWaitMinutes: number;
    occupancyPercent: number; isOverTarget: boolean; targetWaitMinutes: number;
  }[]>('/ai/predictions'),
  getAISuggestions: () => fetchJson<import('../types').RoutingSuggestion[]>('/ai/suggestions'),
  getAIAlerts: () => fetchJson<import('../types').AIAlert[]>('/ai/alerts'),

  getDashboardStats: () => fetchJson<import('../types').DashboardStats>('/dashboard/stats'),
  getCompletionReport: () => fetchJson<import('../types').CompletionReport>('/dashboard/completion'),

  getDoctorSchedule: () => fetchJson<{
    id: string; name: string; department: string; specialization: string;
    availableFrom: string; availableTo: string; slotDurationMinutes: number;
    todaySlots: { time: string; status: 'available' | 'booked' | 'in_progress' }[];
  }[]>('/doctors/schedule'),

  getMOISReport: () => fetchJson<{
    date: string; hospitalName: string; totalReports: number;
    pendingReports: number; completedReports: number;
    entries: {
      patientToken: string; patientName: string; testName: string;
      department: string; resultStatus: 'pending' | 'partial' | 'completed';
      reportedAt?: string; reviewedBy?: string;
    }[];
  }>('/reports/mois'),

  getTimelines: () => fetchJson<{
    departmentId: string; name: string; icon: string; targetWaitMinutes: number;
    avgExamMinutes: number; capacity: number;
    hourlyFlow: { hour: string; completed: number; inProgress: number; waiting: number }[];
    workload: { waiting: number; delayed: number; inProgress: number; completed: number; totalActive: number; occupancyPercent: number };
  }[]>('/dashboard/timelines'),

  getWorkload: () => fetchJson<{
    departments: {
      departmentId: string; name: string; icon: string;
      waiting: number; delayed: number; inProgress: number; completed: number;
      totalActive: number; occupancyPercent: number; targetWaitMinutes: number; isOverloaded: boolean;
    }[];
    totals: { waiting: number; inProgress: number; completed: number; delayed: number };
  }>('/dashboard/workload'),
};
