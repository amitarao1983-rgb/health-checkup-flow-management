import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import FlowPipeline from '../components/FlowPipeline';
import DepartmentCard from '../components/DepartmentCard';
import DepartmentWorkloadBoard from '../components/DepartmentWorkloadBoard';
import { useRealtimeQueues } from '../hooks/useRealtime';
import { api } from '../lib/api';
import { RoutingSuggestion } from '../types';
import {
  Brain, Route, Clock, BarChart3, AlertTriangle, RefreshCw, Zap,
} from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip,
} from 'recharts';

interface Prediction {
  departmentId: string;
  name: string;
  predictedWaitMinutes: number;
  occupancyPercent: number;
  isOverTarget: boolean;
  targetWaitMinutes: number;
}

export default function AIQueuePage() {
  const { queues, alerts, connected } = useRealtimeQueues();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [suggestions, setSuggestions] = useState<RoutingSuggestion[]>([]);

  const refresh = () => {
    api.getAIPredictions().then(setPredictions);
    api.getAISuggestions().then(setSuggestions);
  };

  useEffect(() => { refresh(); }, []);

  const radarData = predictions.map((p) => ({
    dept: p.name.split(' ')[0],
    wait: p.predictedWaitMinutes,
    occupancy: p.occupancyPercent,
    target: p.targetWaitMinutes,
  }));

  const features = [
    { icon: Clock, title: 'Predict Waiting Time', desc: 'AI estimates wait based on queue length, capacity & historical exam duration' },
    { icon: Route, title: 'Smart Redirect', desc: 'Automatically suggest alternate departments when wait exceeds threshold' },
    { icon: BarChart3, title: 'Balance Workload', desc: 'Distribute patients evenly across departments to prevent bottlenecks' },
    { icon: AlertTriangle, title: 'Staff Alerts', desc: 'Notify coordinators when queues exceed target waiting times' },
    { icon: Zap, title: 'Live Occupancy', desc: 'Real-time department occupancy displayed across all dashboards' },
  ];

  return (
    <Layout connected={connected}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-3">
              <Brain className="w-8 h-8 text-accent-purple" />
              AI Queue Optimization
            </h1>
            <p className="text-gray-400 mt-1">
              Intelligent routing engine — placeholder for ML model integration
            </p>
          </div>
          <button onClick={refresh} className="btn-secondary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <FlowPipeline activeStep={2} />

        <div className="grid md:grid-cols-5 gap-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card p-4">
              <Icon className="w-5 h-5 text-accent-cyan mb-2" />
              <p className="font-medium text-sm">{title}</p>
              <p className="text-xs text-gray-500 mt-1">{desc}</p>
            </div>
          ))}
        </div>

        {alerts.length > 0 && (
          <div className="glass-card p-4 border-red-400/20">
            <h3 className="font-semibold text-red-400 mb-2">Active Alerts ({alerts.length})</h3>
            <div className="grid md:grid-cols-2 gap-2">
              {alerts.map((a, i) => (
                <div key={i} className="text-sm p-3 bg-red-400/5 rounded-xl text-red-300">{a.message}</div>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="font-display font-semibold mb-4">Wait Time Predictions</h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#2d3a4f" />
                <PolarAngleAxis dataKey="dept" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Radar name="Predicted Wait" dataKey="wait" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} />
                <Radar name="Target" dataKey="target" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.1} />
                <Tooltip contentStyle={{ background: '#1a2332', border: '1px solid #2d3a4f', borderRadius: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display font-semibold mb-4">Routing Suggestions</h3>
            <div className="space-y-3 max-h-[280px] overflow-y-auto">
              {suggestions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>All departments optimally balanced</p>
                </div>
              ) : (
                suggestions.map((s, i) => (
                  <div key={i} className="p-4 bg-surface rounded-xl border border-accent-purple/20">
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <span className="text-accent-purple font-medium capitalize">{s.fromDepartment}</span>
                      <span className="text-gray-600">→</span>
                      <span className="text-accent-green font-medium capitalize">{s.toDepartment}</span>
                    </div>
                    <p className="text-xs text-gray-400">{s.reason}</p>
                    <div className="flex gap-4 mt-2 text-xs">
                      <span className="text-accent-green">-{s.savedWaitMinutes} min</span>
                      <span className="text-gray-500">{Math.round(s.confidence * 100)}% confidence</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-display font-semibold mb-4">Live Department Occupancy</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {queues.map((d) => (
              <DepartmentCard key={d.departmentId} dept={d} />
            ))}
          </div>
        </div>

        <DepartmentWorkloadBoard />

        <div className="glass-card p-6 border-accent-purple/20">
          <h3 className="font-semibold text-accent-purple mb-2">Production Integration Notes</h3>
          <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
            <li>Replace heuristic predictor with trained ML model (queue history, time-of-day, staff availability)</li>
            <li>Connect MOIS/HIS for doctor schedules and real examination times</li>
            <li>Integrate Twilio/WhatsApp Business API for patient notifications</li>
            <li>Sync with hospital queue management hardware (token displays, PA system)</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
