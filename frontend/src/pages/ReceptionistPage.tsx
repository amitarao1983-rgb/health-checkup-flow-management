import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import FlowPipeline from '../components/FlowPipeline';
import RegistrationStats from '../components/RegistrationStats';
import LiveQueueBoard from '../components/LiveQueueBoard';
import { useRealtimeQueues } from '../hooks/useRealtime';
import { api } from '../lib/api';
import { Patient } from '../types';
import { Headphones, UserPlus, QrCode, Users, ArrowRight } from 'lucide-react';

export default function ReceptionistPage() {
  const { queues, connected } = useRealtimeQueues();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getPatients().then(setPatients);
    const interval = setInterval(() => api.getPatients().then(setPatients), 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.tokenNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.qrCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout connected={connected}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-3">
              <Headphones className="w-8 h-8 text-accent-rose" />
              Receptionist Dashboard
            </h1>
            <p className="text-gray-400 mt-1">
              Registration desk — patient log-in, QR check-in & token management
            </p>
          </div>
          <Link to="/register" className="btn-primary flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> New Registration
          </Link>
        </div>

        <FlowPipeline activeStep={0} />

        <RegistrationStats />

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-accent-cyan" /> Today's Registered Patients
            </h2>
            <input
              className="input-field mb-4"
              placeholder="Search by name, token, or QR..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filtered.map((p) => (
                <div key={p.id} className="p-3 bg-surface rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{p.tokenNumber} • {p.qrCode}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                      p.checkInAt ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-amber/10 text-accent-amber'
                    }`}>
                      {p.checkInAt ? 'Checked In' : 'Registered'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{p.healthPackage.replace('_', ' ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <QrCode className="w-4 h-4 text-accent-purple" /> Quick Actions
            </h2>
            <Link to="/register" className="block p-4 rounded-xl border border-surface-border hover:border-accent-cyan/30 transition-colors group">
              <p className="font-medium group-hover:text-accent-cyan">Register New Patient</p>
              <p className="text-sm text-gray-500">Online registration with health package</p>
            </Link>
            <Link to="/patient" className="block p-4 rounded-xl border border-surface-border hover:border-accent-cyan/30 transition-colors group">
              <p className="font-medium group-hover:text-accent-cyan">QR Code Check-in</p>
              <p className="text-sm text-gray-500">Scan QR and issue digital token</p>
            </Link>
            <Link to="/coordinator" className="block p-4 rounded-xl border border-surface-border hover:border-accent-cyan/30 transition-colors group">
              <p className="font-medium group-hover:text-accent-cyan flex items-center justify-between">
                View Coordinator Dashboard
                <ArrowRight className="w-4 h-4" />
              </p>
              <p className="text-sm text-gray-500">Track all patients in real time</p>
            </Link>
          </div>
        </div>

        <LiveQueueBoard queues={queues} />
      </div>
    </Layout>
  );
}
