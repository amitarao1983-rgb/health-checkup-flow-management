import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { DashboardStats } from '../types';
import StatCard from './StatCard';
import { Users, LogIn, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

export default function RegistrationStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    api.getDashboardStats().then(setStats).catch(console.error);
    const interval = setInterval(() => api.getDashboardStats().then(setStats), 15000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return (
      <div className="glass-card p-8 text-center text-gray-500 animate-pulse">
        Loading registration stats...
      </div>
    );
  }

  const barColors = ['#22d3ee', '#a78bfa', '#34d399', '#fbbf24'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Registered" value={stats.totalRegistered} icon={Users} color="cyan" />
        <StatCard label="Checked In" value={stats.checkedIn} icon={LogIn} color="purple" trend="QR & token" />
        <StatCard label="In Progress" value={stats.inProgress} icon={Clock} color="amber" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle} color="green" />
        <StatCard label="Delayed" value={stats.delayed} icon={AlertTriangle} color="rose" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-display font-semibold mb-4">Registrations by Hour</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.registrationsByHour}>
              <XAxis dataKey="hour" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1a2332', border: '1px solid #2d3a4f', borderRadius: '12px' }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {stats.registrationsByHour.map((_, i) => (
                  <Cell key={i} fill={barColors[i % barColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-display font-semibold mb-4">Department Workload</h3>
          <div className="space-y-3">
            {stats.departmentLoad.map((d) => (
              <div key={d.departmentId} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-16 uppercase">{d.departmentId}</span>
                <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      d.load > 80 ? 'bg-red-400' : d.load > 50 ? 'bg-accent-amber' : 'bg-accent-green'
                    }`}
                    style={{ width: `${d.load}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-10 text-right">{d.load}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
