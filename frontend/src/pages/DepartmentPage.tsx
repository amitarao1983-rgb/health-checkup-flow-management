import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { useRealtimeQueues } from '../hooks/useRealtime';
import { api } from '../lib/api';
import { DepartmentStats, DEPARTMENT_ICONS } from '../types';
import { Play, CheckCircle, Clock, User } from 'lucide-react';

const QUEUE_DEPTS = ['ecg', 'xray', 'usg', 'mammography', 'echo2d', 'tmt', 'dental'];

export default function DepartmentPage() {
  const { queues, connected } = useRealtimeQueues();
  const [selectedDept, setSelectedDept] = useState('ecg');
  const [deptStats, setDeptStats] = useState<DepartmentStats | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filteredQueues = queues.filter((q) => QUEUE_DEPTS.includes(q.departmentId));

  useEffect(() => {
    api.getDepartmentQueue(selectedDept).then(setDeptStats);
  }, [selectedDept, queues]);

  const handleAction = async (action: 'start' | 'complete', entryId: string) => {
    setActionLoading(entryId);
    try {
      if (action === 'start') await api.startExam(selectedDept, entryId);
      else await api.completeExam(selectedDept, entryId);
      const updated = await api.getDepartmentQueue(selectedDept);
      setDeptStats(updated);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Layout connected={connected}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Department Dashboard</h1>
          <p className="text-gray-400 mt-1">Queue management for health check-up departments</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {QUEUE_DEPTS.map((id) => {
            const dept = filteredQueues.find((q) => q.departmentId === id);
            return (
              <button
                key={id}
                onClick={() => setSelectedDept(id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedDept === id
                    ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30'
                    : 'bg-surface-raised border border-surface-border text-gray-400 hover:text-white'
                }`}
              >
                {DEPARTMENT_ICONS[id as keyof typeof DEPARTMENT_ICONS]} {dept?.name ?? id}
                {dept && dept.queueLength > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-surface rounded text-xs">{dept.queueLength}</span>
                )}
              </button>
            );
          })}
        </div>

        {deptStats && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="glass-card p-6 lg:col-span-1 space-y-4">
              <h2 className="font-display font-semibold text-lg">
                {DEPARTMENT_ICONS[deptStats.departmentId]} {deptStats.name}
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-surface rounded-xl text-center">
                  <p className="text-2xl font-bold">{deptStats.queueLength}</p>
                  <p className="text-xs text-gray-500">Waiting</p>
                </div>
                <div className="p-3 bg-surface rounded-xl text-center">
                  <p className="text-2xl font-bold text-accent-cyan">{deptStats.inProgress}</p>
                  <p className="text-xs text-gray-500">In Progress</p>
                </div>
                <div className="p-3 bg-surface rounded-xl text-center">
                  <p className="text-2xl font-bold text-accent-green">{deptStats.completedToday}</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
                <div className="p-3 bg-surface rounded-xl text-center">
                  <p className="text-2xl font-bold text-accent-amber">{deptStats.avgExamMinutes}m</p>
                  <p className="text-xs text-gray-500">Avg Exam Time</p>
                </div>
              </div>

              <div className="p-4 bg-surface rounded-xl border border-accent-cyan/20">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Estimated Wait
                </p>
                <p className="text-3xl font-display font-bold text-accent-cyan">{deptStats.avgWaitMinutes} min</p>
              </div>
            </div>

            <div className="glass-card p-6 lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" /> Current Patient
                </h3>
                {deptStats.currentPatient ? (
                  <div className="p-4 bg-accent-cyan/5 border border-accent-cyan/20 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-mono font-bold text-accent-cyan">{deptStats.currentPatient.tokenNumber}</p>
                      <StatusBadge status={deptStats.currentPatient.status} />
                    </div>
                    <button
                      onClick={() => handleAction('complete', deptStats.currentPatient!.id)}
                      disabled={actionLoading === deptStats.currentPatient.id}
                      className="btn-primary flex items-center gap-1 text-sm"
                    >
                      <CheckCircle className="w-4 h-4" /> Complete
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm p-4 bg-surface rounded-xl">No patient currently being examined</p>
                )}
              </div>

              <div>
                <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-3">Next 3 in Queue</h3>
                <div className="space-y-2">
                  {deptStats.nextPatients.length === 0 ? (
                    <p className="text-gray-500 text-sm">Queue is empty</p>
                  ) : (
                    deptStats.nextPatients.map((entry, i) => (
                      <div key={entry.id} className="p-4 bg-surface rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-surface-overlay flex items-center justify-center text-sm font-bold">
                            {i + 1}
                          </span>
                          <div>
                            <p className="font-mono">{entry.tokenNumber}</p>
                            <p className="text-xs text-gray-500">~{entry.estimatedWaitMinutes} min wait</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={entry.status} />
                          {entry.status === 'waiting' && (
                            <button
                              onClick={() => handleAction('start', entry.id)}
                              disabled={actionLoading === entry.id}
                              className="btn-secondary text-sm py-1.5 flex items-center gap-1"
                            >
                              <Play className="w-3 h-3" /> Start
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
