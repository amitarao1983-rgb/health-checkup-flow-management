import { Router, Request, Response } from 'express';
import { store } from '../services/store.js';
import { queueEngine } from '../services/queueEngine.js';
import { aiOptimizer } from '../services/aiOptimizer.js';
import { notificationService } from '../services/notifications.js';
import { DEPARTMENTS, PACKAGE_LABELS } from '../data/departments.js';
import { DOCTOR_SCHEDULES } from '../data/doctors.js';
import { getMOISReport } from '../data/moisReports.js';
import { buildDepartmentTimelines, buildWorkloadSummary } from '../seed.js';
import { HealthPackage, DepartmentId } from '../types/index.js';

const router = Router();

function param(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

router.get('/packages', (_req: Request, res: Response) => {
  res.json(Object.entries(PACKAGE_LABELS).map(([id, name]) => ({ id, name })));
});

router.get('/departments', (_req: Request, res: Response) => {
  res.json(DEPARTMENTS);
});

router.post('/register', (req: Request, res: Response) => {
  try {
    const { name, age, gender, phone, email, healthPackage } = req.body;
    if (!name || !age || !gender || !phone || !healthPackage) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    const patient = store.registerPatient({
      name,
      age: Number(age),
      gender,
      phone,
      email,
      healthPackage: healthPackage as HealthPackage,
    });
    res.status(201).json(patient);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get('/patients', (_req: Request, res: Response) => {
  res.json(store.getAllPatients());
});

router.get('/patients/:id', (req: Request, res: Response) => {
  const patient = store.getPatient(param(req.params.id));
  if (!patient) {
    res.status(404).json({ error: 'Patient not found' });
    return;
  }
  res.json(patient);
});

router.post('/check-in', (req: Request, res: Response) => {
  const { qrCode, patientId } = req.body;
  const patient = patientId
    ? store.getPatient(patientId)
    : store.findPatientByQr(qrCode);

  if (!patient) {
    res.status(404).json({ error: 'Patient not found' });
    return;
  }

  store.checkInPatient(patient.id);
  const entry = queueEngine.autoRoute(patient.id);

  notificationService.notifyPatient(
    patient.id,
    `Welcome ${patient.name}! Token ${patient.tokenNumber}. You have been routed to your first department.`,
    ['in_app', 'sms']
  );

  res.json({ patient: store.getPatient(patient.id), queueEntry: entry });
});

router.get('/patients/:id/queue', (req: Request, res: Response) => {
  const patient = store.getPatient(param(req.params.id));
  if (!patient) {
    res.status(404).json({ error: 'Patient not found' });
    return;
  }

  const queues = DEPARTMENTS.map((d) => ({
    department: d,
    entries: store.getQueue(d.id).filter((q) => q.patientId === patient.id),
    estimatedWait: aiOptimizer.predictWaitTime(d.id),
  }));

  res.json({ patient, queues });
});

router.get('/patients/:id/notifications', (req: Request, res: Response) => {
  const notifications = store.notifications.get(param(req.params.id)) ?? [];
  res.json(notifications);
});

router.get('/queue/:departmentId', (req: Request, res: Response) => {
  const departmentId = param(req.params.departmentId) as DepartmentId;
  const stats = queueEngine.getDepartmentStats(departmentId);
  res.json(stats);
});

router.get('/queue', (_req: Request, res: Response) => {
  res.json(queueEngine.getAllDepartmentStats());
});

router.post('/queue/:departmentId/start/:entryId', (req: Request, res: Response) => {
  const entry = queueEngine.startExamination(
    param(req.params.entryId),
    param(req.params.departmentId) as DepartmentId
  );
  if (!entry) {
    res.status(404).json({ error: 'Queue entry not found' });
    return;
  }
  res.json(entry);
});

router.post('/queue/:departmentId/complete/:entryId', (req: Request, res: Response) => {
  const entry = queueEngine.completeExamination(
    param(req.params.entryId),
    param(req.params.departmentId) as DepartmentId
  );
  if (!entry) {
    res.status(404).json({ error: 'Queue entry not found' });
    return;
  }

  const patient = store.getPatient(entry.patientId);
  if (patient && patient.pendingDepartments.length > 0) {
    queueEngine.autoRoute(patient.id);
    const suggestion = aiOptimizer.findBestRedirect(
      patient.id,
      patient.pendingDepartments[0]
    );
    if (suggestion) {
      notificationService.notifyPatient(
        patient.id,
        suggestion.reason,
        ['in_app', 'whatsapp']
      );
    }
  }

  res.json(entry);
});

router.post('/queue/redirect', (req: Request, res: Response) => {
  const { patientId, fromDepartment, toDepartment } = req.body;
  const entry = queueEngine.redirectPatient(patientId, fromDepartment, toDepartment);
  res.json(entry);
});

router.get('/ai/predictions', (_req: Request, res: Response) => {
  const predictions = DEPARTMENTS.map((d) => ({
    departmentId: d.id,
    name: d.name,
    predictedWaitMinutes: aiOptimizer.predictWaitTime(d.id),
    occupancyPercent: aiOptimizer.getDepartmentOccupancy(d.id),
    isOverTarget: aiOptimizer.isOverTarget(d.id),
    targetWaitMinutes: d.targetWaitMinutes,
  }));
  res.json(predictions);
});

router.get('/ai/suggestions', (_req: Request, res: Response) => {
  res.json(aiOptimizer.balanceWorkload());
});

router.get('/ai/alerts', (_req: Request, res: Response) => {
  res.json(aiOptimizer.getAlerts());
});

router.get('/dashboard/stats', (_req: Request, res: Response) => {
  const patients = store.getAllPatients();
  const now = new Date();
  const registrationsByHour = Array.from({ length: 12 }, (_, i) => {
    const hour = (now.getHours() - 11 + i + 24) % 24;
    const count = patients.filter((p) => {
      const regHour = new Date(p.registeredAt).getHours();
      return regHour === hour;
    }).length;
    return { hour: `${String(hour).padStart(2, '0')}:00`, count };
  });

  res.json({
    totalRegistered: patients.length,
    checkedIn: patients.filter((p) => p.checkInAt).length,
    inProgress: patients.filter((p) => p.status === 'in_progress').length,
    completed: patients.filter((p) => p.status === 'completed').length,
    delayed: patients.filter((p) =>
      DEPARTMENTS.some((d) =>
        store.getQueue(d.id).some(
          (q) => q.patientId === p.id && q.status === 'delayed'
        )
      )
    ).length,
    registrationsByHour,
    departmentLoad: DEPARTMENTS.map((d) => ({
      departmentId: d.id,
      load: aiOptimizer.getDepartmentOccupancy(d.id),
    })),
  });
});

router.get('/dashboard/completion', (_req: Request, res: Response) => {
  const patients = store.getAllPatients();
  const today = new Date().toISOString().split('T')[0];

  res.json({
    date: today,
    totalPatients: patients.length,
    completedPatients: patients.filter((p) => p.status === 'completed').length,
    avgTotalTimeMinutes: 95,
    patients: patients.map((p) => ({
      id: p.id,
      name: p.name,
      tokenNumber: p.tokenNumber,
      status: p.status,
      completedDepartments: p.completedDepartments,
      pendingDepartments: p.pendingDepartments,
      pathwayColor: p.pathwayColor,
      progress: Math.round(
        (p.completedDepartments.length /
          (p.completedDepartments.length + p.pendingDepartments.length || 1)) *
          100
      ),
    })),
    departmentBreakdown: DEPARTMENTS.map((d) => {
      const queue = store.getQueue(d.id);
      return {
        departmentId: d.id,
        name: d.name,
        processed: queue.filter((q) => q.status === 'completed').length,
        avgWait: aiOptimizer.predictWaitTime(d.id),
        delays: queue.filter((q) => q.status === 'delayed').length,
      };
    }),
  });
});

router.get('/doctors/schedule', (_req: Request, res: Response) => {
  res.json(DOCTOR_SCHEDULES);
});

router.get('/reports/mois', (_req: Request, res: Response) => {
  res.json(getMOISReport());
});

router.get('/dashboard/timelines', (_req: Request, res: Response) => {
  res.json(buildDepartmentTimelines());
});

router.get('/dashboard/workload', (_req: Request, res: Response) => {
  res.json(buildWorkloadSummary());
});

export default router;
