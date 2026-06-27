import { DepartmentId, QueueEntry } from '../types/index.js';
import { DEPARTMENTS, getDepartment } from '../data/departments.js';
import { store } from './store.js';
import { aiOptimizer } from './aiOptimizer.js';

export class QueueEngine {
  enqueuePatient(patientId: string, departmentId?: DepartmentId): QueueEntry {
    const patient = store.getPatient(patientId);
    if (!patient) throw new Error('Patient not found');

    const targetDept = departmentId ?? patient.pendingDepartments[0];
    if (!targetDept) throw new Error('No pending departments');

    return store.addToQueue(patientId, targetDept);
  }

  autoRoute(patientId: string): QueueEntry | null {
    const patient = store.getPatient(patientId);
    if (!patient || patient.pendingDepartments.length === 0) return null;

    let bestDept = patient.pendingDepartments[0];
    let bestWait = aiOptimizer.predictWaitTime(bestDept);

    for (const deptId of patient.pendingDepartments) {
      const wait = aiOptimizer.predictWaitTime(deptId);
      if (wait < bestWait) {
        bestWait = wait;
        bestDept = deptId;
      }
    }

    return store.addToQueue(patientId, bestDept);
  }

  startExamination(entryId: string, departmentId: DepartmentId): QueueEntry | null {
    return store.updateQueueStatus(entryId, departmentId, 'in_progress');
  }

  completeExamination(entryId: string, departmentId: DepartmentId): QueueEntry | null {
    const entry = store.updateQueueStatus(entryId, departmentId, 'completed');
    if (entry) {
      const patient = store.getPatient(entry.patientId);
      if (patient && patient.pendingDepartments.length > 0) {
        store.addNotification(
          entry.patientId,
          `✅ ${getDepartment(departmentId).name} completed. Proceed to next department when notified.`,
          'in_app'
        );
      } else if (patient) {
        store.addNotification(
          entry.patientId,
          '🎉 All health check-up tests completed! Please collect your report from the reception.',
          'whatsapp'
        );
      }
    }
    return entry;
  }

  markDelayed(entryId: string, departmentId: DepartmentId): QueueEntry | null {
    return store.updateQueueStatus(entryId, departmentId, 'delayed');
  }

  redirectPatient(patientId: string, fromDept: DepartmentId, toDept: DepartmentId): QueueEntry {
    const fromQueue = store.getQueue(fromDept);
    const entry = fromQueue.find((q) => q.patientId === patientId && q.status === 'waiting');
    if (entry) {
      store.updateQueueStatus(entry.id, fromDept, 'redirected');
    }

    store.addNotification(
      patientId,
      `🔄 Redirected: Visit ${getDepartment(toDept).name} now — shorter wait time available.`,
      'whatsapp'
    );

    return store.addToQueue(patientId, toDept);
  }

  getDepartmentStats(departmentId: DepartmentId) {
    const dept = getDepartment(departmentId);
    const queue = store.getQueue(departmentId);
    const waiting = queue.filter((q) => q.status === 'waiting' || q.status === 'delayed');
    const inProgress = queue.filter((q) => q.status === 'in_progress');
    const completed = queue.filter((q) => q.status === 'completed');
    const current = inProgress[0];
    const nextPatients = waiting.slice(0, 3);

    return {
      departmentId,
      name: dept.name,
      queueLength: waiting.length,
      inProgress: inProgress.length,
      completedToday: completed.length,
      avgWaitMinutes: aiOptimizer.predictWaitTime(departmentId),
      avgExamMinutes: dept.avgExamMinutes,
      occupancyPercent: aiOptimizer.getDepartmentOccupancy(departmentId),
      isOverTarget: aiOptimizer.isOverTarget(departmentId),
      currentPatient: current,
      nextPatients,
    };
  }

  getAllDepartmentStats() {
    return DEPARTMENTS.map((d) => this.getDepartmentStats(d.id));
  }
}

export const queueEngine = new QueueEngine();
