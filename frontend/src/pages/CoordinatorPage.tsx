import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import DepartmentCard from '../components/DepartmentCard';
import StatusBadge from '../components/StatusBadge';
import RegistrationStats from '../components/RegistrationStats';
import DepartmentWorkloadBoard from '../components/DepartmentWorkloadBoard';
import DepartmentTimelineChart from '../components/DepartmentTimelineChart';
import { useRealtimeQueues } from '../hooks/useRealtime';
import { api } from '../lib/api';
import { Patient, RoutingSuggestion, DEPARTMENT_ICONS } from '../types';
import { AlertTriangle, Route, Users, Zap } from 'lucide-react';

export default function CoordinatorPage() {
  const { queues, alerts, connected } = useRealtimeQueues();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [suggestions, setSuggestions] = useState<RoutingSuggestion[]>([]);

  useEffect(() => {
    api.getPatients().then(setPatients);
    api.getAISuggestions().then(setSuggestions);
    const interval = setInterval(() => {
      api.getPatients().then(setPatients);
      api.getAISuggestions().then(setSuggestions);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRedirect = async (s: RoutingSuggestion) => {
    await api.redirect({
      patientId: s.patientId,
      fromDepartment: s.fromDepartment,
      toDepartment: s.toDepartment,
    });
    api.getAISuggestions().then(setSuggestions);
  };

  return (
    <Layout connected={connected}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Coordinator Dashboard</h1>
          <p className="text-gray-400 mt-1">Real-time patient tracking, pathways & automatic assignment</p>
        </div>

        <RegistrationStats />

        <DepartmentWorkloadBoard />

        <DepartmentTimelineChart />

        {alerts.length > 0 && (
          <div className="glass-card p-4 border-red-400/30">
            <h3 className="font-semibold flex items-center gap-2 text-red-400 mb-3">
              <AlertTriangle className="w-4 h-4" /> Delay Alerts
            </h3>
            <div className="space-y-2">
              {alerts.map((a, i) => (
                <div key={i} className={`text-sm p-3 rounded-xl ${
                  a.severity === 'critical' ? 'bg-red-400/10 text-red-300' : 'bg-accent-amber/10 text-amber-300'
                }`}>
                  {a.message}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-accent-cyan" /> Live Patient Tracking
            </h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {patients.map((p) => (
                <div
                  key={p.id}
                  className="glass-card p-4 flex items-center gap-4"
                  style={{ borderLeftColor: p.pathwayColor, borderLeftWidth: 4 }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-xs text-gray-500 font-mono">{p.tokenNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                      {p.currentDepartment && (
                        <span>{DEPARTMENT_ICONS[p.currentDepartment]} {p.currentDepartment}</span>
                      )}
                      <span>•</span>
                      <span>{p.completedDepartments.length}/{p.completedDepartments.length + p.pendingDepartments.length} done</span>
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: p.pathwayColor }}
                    title="Pathway color"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent-purple" /> AI Routing Suggestions
            </h2>
            <div className="space-y-3">
              {suggestions.length === 0 ? (
                <div className="glass-card p-6 text-center text-gray-500 text-sm">
                  All queues balanced — no redirects needed
                </div>
              ) : (
                suggestions.map((s, i) => {
                  const patient = patients.find((p) => p.id === s.patientId);
                  return (
                    <div key={i} className="glass-card p-4 space-y-2">
                      <p className="text-sm font-medium">{patient?.name ?? 'Patient'}</p>
                      <p className="text-xs text-gray-400">{s.reason}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-accent-green">Save ~{s.savedWaitMinutes} min</span>
                        <span className="text-xs text-gray-500">{Math.round(s.confidence * 100)}% confidence</span>
                      </div>
                      <button
                        onClick={() => handleRedirect(s)}
                        className="btn-primary w-full text-sm py-2 flex items-center justify-center gap-1"
                      >
                        <Route className="w-3 h-3" /> Apply Redirect
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold mb-4">Department Workload Monitoring</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {queues.map((d) => (
              <DepartmentCard key={d.departmentId} dept={d} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
