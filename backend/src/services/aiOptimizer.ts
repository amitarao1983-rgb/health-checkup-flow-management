import { DepartmentId, RoutingSuggestion } from '../types/index.js';
import { DEPARTMENTS, getDepartment } from '../data/departments.js';
import { store } from './store.js';

/**
 * AI-Based Queue Optimization Engine (Placeholder)
 * Uses heuristic prediction model — replace with ML model in production.
 */
export class AIQueueOptimizer {
  predictWaitTime(departmentId: DepartmentId): number {
    const dept = getDepartment(departmentId);
    const queue = store.getQueue(departmentId);
    const waiting = queue.filter((q) => q.status === 'waiting' || q.status === 'delayed');
    const inProgress = queue.filter((q) => q.status === 'in_progress');

    const queueFactor = waiting.length * dept.avgExamMinutes;
    const capacityFactor = inProgress.length * (dept.avgExamMinutes / dept.capacity);
    const aiAdjustment = Math.floor(Math.random() * 3) - 1; // placeholder variance

    return Math.max(5, Math.round(queueFactor / dept.capacity + capacityFactor + aiAdjustment));
  }

  getDepartmentOccupancy(departmentId: DepartmentId): number {
    const dept = getDepartment(departmentId);
    const queue = store.getQueue(departmentId);
    const active = queue.filter((q) => q.status !== 'completed').length;
    return Math.min(100, Math.round((active / (dept.capacity * 3)) * 100));
  }

  isOverTarget(departmentId: DepartmentId): boolean {
    return this.predictWaitTime(departmentId) > getDepartment(departmentId).targetWaitMinutes;
  }

  findBestRedirect(patientId: string, currentDept: DepartmentId): RoutingSuggestion | null {
    const patient = store.getPatient(patientId);
    if (!patient) return null;

    const pending = patient.pendingDepartments.filter((d) => d !== currentDept);
    if (pending.length === 0) return null;

    const currentWait = this.predictWaitTime(currentDept);

    let bestDept: DepartmentId | null = null;
    let bestWait = Infinity;

    for (const deptId of pending) {
      const wait = this.predictWaitTime(deptId);
      if (wait < bestWait && wait < currentWait - 5) {
        bestWait = wait;
        bestDept = deptId;
      }
    }

    if (!bestDept) return null;

    const savedMinutes = currentWait - bestWait;
    const confidence = Math.min(0.95, 0.6 + savedMinutes * 0.03);

    return {
      patientId,
      fromDepartment: currentDept,
      toDepartment: bestDept,
      reason: `AI detected ${savedMinutes} min shorter wait at ${getDepartment(bestDept).name}. Visit there while ${getDepartment(currentDept).name} queue clears.`,
      savedWaitMinutes: savedMinutes,
      confidence: Math.round(confidence * 100) / 100,
    };
  }

  balanceWorkload(): RoutingSuggestion[] {
    const suggestions: RoutingSuggestion[] = [];
    const overloaded = DEPARTMENTS.filter((d) => this.isOverTarget(d.id));

    for (const dept of overloaded) {
      const queue = store.getQueue(dept.id);
      const waitingPatients = queue
        .filter((q) => q.status === 'waiting')
        .slice(0, 2);

      for (const entry of waitingPatients) {
        const suggestion = this.findBestRedirect(entry.patientId, dept.id);
        if (suggestion) suggestions.push(suggestion);
      }
    }

    return suggestions;
  }

  getAlerts(): { departmentId: DepartmentId; message: string; severity: 'warning' | 'critical' }[] {
    return DEPARTMENTS.filter((d) => this.isOverTarget(d.id)).map((d) => {
      const wait = this.predictWaitTime(d.id);
      const severity = wait > d.targetWaitMinutes * 2 ? 'critical' : 'warning';
      return {
        departmentId: d.id,
        message: `${d.name} queue exceeds target: ${wait} min estimated (target: ${d.targetWaitMinutes} min)`,
        severity,
      };
    });
  }
}

export const aiOptimizer = new AIQueueOptimizer();
