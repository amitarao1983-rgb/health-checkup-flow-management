import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import FlowPipeline from '../components/FlowPipeline';
import StatusBadge from '../components/StatusBadge';
import { api } from '../lib/api';
import { CompletionReport, DEPARTMENT_ICONS } from '../types';
import { CheckCircle2, FileText, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const PIE_COLORS = ['#22d3ee', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#60a5fa', '#fb923c'];

export default function CompletionPage() {
  const [report, setReport] = useState<CompletionReport | null>(null);

  useEffect(() => {
    api.getCompletionReport().then(setReport);
    const interval = setInterval(() => api.getCompletionReport().then(setReport), 15000);
    return () => clearInterval(interval);
  }, []);

  if (!report) {
    return (
      <Layout>
        <div className="glass-card p-12 text-center text-gray-500 animate-pulse">Loading completion report...</div>
      </Layout>
    );
  }

  const completionRate = report.totalPatients
    ? Math.round((report.completedPatients / report.totalPatients) * 100)
    : 0;

  const pieData = [
    { name: 'Completed', value: report.completedPatients },
    { name: 'In Progress', value: report.totalPatients - report.completedPatients },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Completion Dashboard</h1>
          <p className="text-gray-400 mt-1">Daily patient completion report — {report.date}</p>
        </div>

        <FlowPipeline activeStep={3} />

        <div className="grid md:grid-cols-4 gap-4">
          <div className="stat-card">
            <p className="text-sm text-gray-400">Total Patients</p>
            <p className="text-3xl font-display font-bold">{report.totalPatients}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-gray-400">Completed</p>
            <p className="text-3xl font-display font-bold text-accent-green">{report.completedPatients}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-gray-400">Completion Rate</p>
            <p className="text-3xl font-display font-bold text-accent-cyan">{completionRate}%</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-gray-400">Avg Total Time</p>
            <p className="text-3xl font-display font-bold text-accent-purple">{report.avgTotalTimeMinutes}m</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent-cyan" /> Completion Overview
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a2332', border: '1px solid #2d3a4f', borderRadius: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-6 lg:col-span-2">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent-purple" /> Department Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={report.departmentBreakdown.filter((d) => d.processed > 0 || d.delays > 0)}>
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1a2332', border: '1px solid #2d3a4f', borderRadius: '12px' }} />
                <Bar dataKey="processed" fill="#22d3ee" name="Processed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="delays" fill="#f87171" name="Delays" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-accent-green" /> Patient Progress
          </h3>
          <div className="space-y-3">
            {report.patients.map((p) => (
              <div key={p.id} className="p-4 bg-surface rounded-xl flex items-center gap-4"
                style={{ borderLeftColor: p.pathwayColor, borderLeftWidth: 3 }}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-xs font-mono text-gray-500">{p.tokenNumber}</span>
                  </div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {p.completedDepartments.map((d) => (
                      <span key={d} className="text-xs px-2 py-0.5 rounded-full bg-accent-green/10 text-accent-green">
                        {DEPARTMENT_ICONS[d]} {d}
                      </span>
                    ))}
                    {p.pendingDepartments.map((d) => (
                      <span key={d} className="text-xs px-2 py-0.5 rounded-full bg-surface-overlay text-gray-500">
                        {DEPARTMENT_ICONS[d]} {d}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <StatusBadge status={p.status} />
                  <p className="text-sm font-bold mt-1">{p.progress}%</p>
                </div>
                <div className="w-24 h-2 bg-surface-raised rounded-full overflow-hidden shrink-0">
                  <div className="h-full bg-accent-green rounded-full" style={{ width: `${p.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
