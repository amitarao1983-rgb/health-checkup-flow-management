import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Activity, AlertTriangle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface WorkloadDept {
  departmentId: string;
  name: string;
  icon: string;
  waiting: number;
  delayed: number;
  inProgress: number;
  completed: number;
  totalActive: number;
  occupancyPercent: number;
  targetWaitMinutes: number;
  isOverloaded: boolean;
}

interface WorkloadSummary {
  departments: WorkloadDept[];
  totals: { waiting: number; inProgress: number; completed: number; delayed: number };
}

export default function DepartmentWorkloadBoard() {
  const [data, setData] = useState<WorkloadSummary | null>(null);

  useEffect(() => {
    api.getWorkload().then(setData).catch(console.error);
    const interval = setInterval(() => api.getWorkload().then(setData), 12000);
    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return <div className="glass-card p-8 text-center text-gray-500 animate-pulse">Loading workload...</div>;
  }

  const chartData = data.departments.map((d) => ({
    name: d.name.split(' ')[0],
    fullName: d.name,
    Waiting: d.waiting,
    Delayed: d.delayed,
    'In Progress': d.inProgress,
    Completed: d.completed,
    occupancy: d.occupancyPercent,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-display text-xl font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-accent-cyan" />
          All Departments — Workload Overview
        </h3>
        <div className="flex gap-3 text-xs">
          <span className="px-2 py-1 rounded-lg bg-amber-400/10 text-amber-400">{data.totals.waiting} waiting</span>
          <span className="px-2 py-1 rounded-lg bg-accent-cyan/10 text-accent-cyan">{data.totals.inProgress} in progress</span>
          <span className="px-2 py-1 rounded-lg bg-accent-green/10 text-accent-green">{data.totals.completed} completed</span>
          <span className="px-2 py-1 rounded-lg bg-red-400/10 text-red-400">{data.totals.delayed} delayed</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.departments.map((d) => (
          <div
            key={d.departmentId}
            className={`glass-card p-4 ${d.isOverloaded ? 'border-red-400/30' : ''}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{d.icon}</span>
                <div>
                  <p className="font-medium text-sm">{d.name}</p>
                  <p className="text-xs text-gray-500">Target wait: {d.targetWaitMinutes}m</p>
                </div>
              </div>
              {d.isOverloaded && <AlertTriangle className="w-4 h-4 text-red-400" />}
            </div>

            <div className="grid grid-cols-4 gap-1 text-center mb-3">
              <div>
                <p className="text-lg font-bold text-amber-400">{d.waiting}</p>
                <p className="text-[10px] text-gray-500">Wait</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-400">{d.delayed}</p>
                <p className="text-[10px] text-gray-500">Delay</p>
              </div>
              <div>
                <p className="text-lg font-bold text-accent-cyan">{d.inProgress}</p>
                <p className="text-[10px] text-gray-500">Active</p>
              </div>
              <div>
                <p className="text-lg font-bold text-accent-green">{d.completed}</p>
                <p className="text-[10px] text-gray-500">Done</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    d.occupancyPercent > 80 ? 'bg-red-400' :
                    d.occupancyPercent > 50 ? 'bg-accent-amber' : 'bg-accent-green'
                  }`}
                  style={{ width: `${d.occupancyPercent}%` }}
                />
              </div>
              <span className="text-xs font-medium w-10 text-right">{d.occupancyPercent}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <h4 className="font-semibold mb-4 text-sm text-gray-400 uppercase tracking-wider">
          Stacked Workload Comparison
        </h4>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} barCategoryGap="20%">
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1a2332', border: '1px solid #2d3a4f', borderRadius: '12px' }}
              formatter={(value, name) => [value, name]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ''}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Waiting" stackId="a" fill="#fbbf24" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Delayed" stackId="a" fill="#f87171" />
            <Bar dataKey="In Progress" stackId="a" fill="#22d3ee" />
            <Bar dataKey="Completed" stackId="a" fill="#34d399" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
