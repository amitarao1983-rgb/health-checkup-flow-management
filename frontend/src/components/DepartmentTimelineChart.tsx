import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Clock, TrendingUp } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

interface TimelineDept {
  departmentId: string;
  name: string;
  icon: string;
  targetWaitMinutes: number;
  hourlyFlow: { hour: string; completed: number; inProgress: number; waiting: number }[];
  workload: {
    waiting: number;
    delayed: number;
    inProgress: number;
    completed: number;
    occupancyPercent: number;
  };
}

export default function DepartmentTimelineChart() {
  const [timelines, setTimelines] = useState<TimelineDept[]>([]);
  const [selected, setSelected] = useState('lab');

  useEffect(() => {
    api.getTimelines().then((t) => {
      setTimelines(t);
      if (t.length > 0 && !t.find((d) => d.departmentId === selected)) {
        setSelected(t[0].departmentId);
      }
    });
    const interval = setInterval(() => api.getTimelines().then(setTimelines), 15000);
    return () => clearInterval(interval);
  }, [selected]);

  const dept = timelines.find((d) => d.departmentId === selected);
  const chartData = dept?.hourlyFlow.map((h) => ({
    ...h,
    total: h.completed + h.inProgress + h.waiting,
  })) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-display text-xl font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent-purple" />
          Department Timelines (Today)
        </h3>
        <div className="flex flex-wrap gap-1">
          {timelines.map((d) => (
            <button
              key={d.departmentId}
              onClick={() => setSelected(d.departmentId)}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                selected === d.departmentId
                  ? 'bg-accent-purple/20 text-accent-purple border border-accent-purple/30'
                  : 'bg-surface text-gray-400 hover:text-white border border-transparent'
              }`}
            >
              {d.icon} {d.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {dept && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-card p-3 text-center">
              <p className="text-2xl font-bold text-accent-green">{dept.workload.completed}</p>
              <p className="text-xs text-gray-500">Completed today</p>
            </div>
            <div className="glass-card p-3 text-center">
              <p className="text-2xl font-bold text-accent-cyan">{dept.workload.inProgress}</p>
              <p className="text-xs text-gray-500">In progress now</p>
            </div>
            <div className="glass-card p-3 text-center">
              <p className="text-2xl font-bold text-amber-400">{dept.workload.waiting + dept.workload.delayed}</p>
              <p className="text-xs text-gray-500">In queue</p>
            </div>
            <div className="glass-card p-3 text-center">
              <p className="text-2xl font-bold text-accent-purple">{dept.targetWaitMinutes}m</p>
              <p className="text-xs text-gray-500">Target wait</p>
            </div>
          </div>

          <div className="glass-card p-6">
            <p className="text-sm text-gray-400 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Hourly patient flow — {dept.icon} {dept.name}
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3a4f" />
                <XAxis dataKey="hour" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#1a2332', border: '1px solid #2d3a4f', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="completed" name="Completed" stackId="1" stroke="#34d399" fill="#34d399" fillOpacity={0.5} />
                <Area type="monotone" dataKey="inProgress" name="In Progress" stackId="1" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.5} />
                <Area type="monotone" dataKey="waiting" name="Waiting" stackId="1" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-surface-border">
                  <th className="pb-2 pr-4">Hour</th>
                  <th className="pb-2 pr-4 text-accent-green">Completed</th>
                  <th className="pb-2 pr-4 text-accent-cyan">In Progress</th>
                  <th className="pb-2 text-amber-400">Waiting</th>
                </tr>
              </thead>
              <tbody>
                {dept.hourlyFlow.filter((h) => h.completed + h.inProgress + h.waiting > 0).map((h) => (
                  <tr key={h.hour} className="border-b border-surface-border/40">
                    <td className="py-2 pr-4 font-mono">{h.hour}</td>
                    <td className="py-2 pr-4">{h.completed}</td>
                    <td className="py-2 pr-4">{h.inProgress}</td>
                    <td className="py-2">{h.waiting}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
