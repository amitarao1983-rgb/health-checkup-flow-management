import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../lib/api';
import { FileText, Download, Filter } from 'lucide-react';

interface MOISReport {
  date: string;
  hospitalName: string;
  totalReports: number;
  pendingReports: number;
  completedReports: number;
  entries: {
    patientToken: string;
    patientName: string;
    testName: string;
    department: string;
    resultStatus: 'pending' | 'partial' | 'completed';
    reportedAt?: string;
    reviewedBy?: string;
  }[];
}

const STATUS_STYLE = {
  pending: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  partial: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/30',
  completed: 'text-accent-green bg-accent-green/10 border-accent-green/30',
};

export default function MOISReportPage() {
  const [report, setReport] = useState<MOISReport | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'partial' | 'completed'>('all');

  useEffect(() => {
    api.getMOISReport().then(setReport);
    const interval = setInterval(() => api.getMOISReport().then(setReport), 30000);
    return () => clearInterval(interval);
  }, []);

  if (!report) {
    return (
      <Layout>
        <div className="glass-card p-12 text-center text-gray-500 animate-pulse">Loading MOIS report...</div>
      </Layout>
    );
  }

  const filtered = filter === 'all'
    ? report.entries
    : report.entries.filter((e) => e.resultStatus === filter);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-3">
              <FileText className="w-8 h-8 text-accent-purple" />
              MOIS Report
            </h1>
            <p className="text-gray-400 mt-1">
              {report.hospitalName} — Medical reports status for {report.date}
            </p>
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" /> Export (placeholder)
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card text-center">
            <p className="text-2xl font-bold">{report.totalReports}</p>
            <p className="text-sm text-gray-400">Total Reports</p>
          </div>
          <div className="stat-card text-center">
            <p className="text-2xl font-bold text-accent-green">{report.completedReports}</p>
            <p className="text-sm text-gray-400">Completed</p>
          </div>
          <div className="stat-card text-center">
            <p className="text-2xl font-bold text-accent-amber">{report.pendingReports}</p>
            <p className="text-sm text-gray-400">Pending</p>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <Filter className="w-4 h-4 text-gray-500" />
            {(['all', 'pending', 'partial', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-sm capitalize ${
                  filter === f ? 'bg-accent-cyan/20 text-accent-cyan' : 'text-gray-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-surface-border">
                  <th className="pb-3 pr-4">Token</th>
                  <th className="pb-3 pr-4">Patient</th>
                  <th className="pb-3 pr-4">Test</th>
                  <th className="pb-3 pr-4">Department</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Reviewed By</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry, i) => (
                  <tr key={i} className="border-b border-surface-border/50 hover:bg-surface/50">
                    <td className="py-3 pr-4 font-mono text-xs">{entry.patientToken}</td>
                    <td className="py-3 pr-4">{entry.patientName}</td>
                    <td className="py-3 pr-4">{entry.testName}</td>
                    <td className="py-3 pr-4">{entry.department}</td>
                    <td className="py-3 pr-4">
                      <span className={`status-badge ${STATUS_STYLE[entry.resultStatus]}`}>
                        {entry.resultStatus}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400 text-xs">{entry.reviewedBy ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-surface-border">
            Placeholder MOIS report — integrate with hospital LIS/RIS for live report status.
          </p>
        </div>
      </div>
    </Layout>
  );
}
