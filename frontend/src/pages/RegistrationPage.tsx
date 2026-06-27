import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import FlowPipeline from '../components/FlowPipeline';
import { api } from '../lib/api';
import { Patient, HealthPackage } from '../types';
import { UserPlus, CheckCircle } from 'lucide-react';

export default function RegistrationPage() {
  const [packages, setPackages] = useState<HealthPackage[]>([]);
  const [form, setForm] = useState({
    name: '', age: '', gender: 'male', phone: '', email: '', healthPackage: 'standard',
  });
  const [registered, setRegistered] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getPackages().then(setPackages);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const patient = await api.register({
        name: form.name,
        age: Number(form.age),
        gender: form.gender,
        phone: form.phone,
        email: form.email || undefined,
        healthPackage: form.healthPackage,
      });
      setRegistered(patient);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Patient Registration</h1>
          <p className="text-gray-400 mt-1">Online registration for health check-up packages</p>
        </div>

        <FlowPipeline activeStep={0} />

        {registered ? (
          <div className="glass-card p-8 text-center space-y-4 animate-fade-in">
            <CheckCircle className="w-16 h-16 text-accent-green mx-auto" />
            <h2 className="font-display text-2xl font-bold">Registration Successful!</h2>
            <div className="inline-block px-6 py-3 bg-surface rounded-xl border border-accent-cyan/30">
              <p className="text-sm text-gray-400">Digital Token Number</p>
              <p className="text-3xl font-display font-bold text-accent-cyan">{registered.tokenNumber}</p>
            </div>
            <p className="text-gray-400">QR Code: <span className="text-white font-mono">{registered.qrCode}</span></p>
            <p className="text-sm text-gray-500">
              Pending departments: {registered.pendingDepartments.join(', ')}
            </p>
            <button onClick={() => setRegistered(null)} className="btn-secondary">
              Register Another Patient
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card p-8 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="w-5 h-5 text-accent-cyan" />
              <h2 className="font-semibold">New Patient Details</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Full Name *</label>
                <input className="input-field" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Patient name" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Age *</label>
                <input className="input-field" type="number" required min={1} max={120} value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="Age" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Gender *</label>
                <select className="input-field" value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Phone *</label>
                <input className="input-field" required value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91-XXXXXXXXXX" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-400 mb-1 block">Email</label>
                <input className="input-field" type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-400 mb-1 block">Health Package *</label>
                <select className="input-field" value={form.healthPackage}
                  onChange={(e) => setForm({ ...form, healthPackage: e.target.value })}>
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Registering...' : 'Register Patient'}
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}
