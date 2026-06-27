import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import LiveTokenCard from '../components/LiveTokenCard';
import LiveQueueBoard from '../components/LiveQueueBoard';
import SmartRoutingBanner from '../components/SmartRoutingBanner';
import { useRealtimeQueues } from '../hooks/useRealtime';
import { api } from '../lib/api';
import { Patient, Notification, RoutingSuggestion, DEPARTMENT_ICONS, DepartmentId } from '../types';
import {
  QrCode, Bell, Clock, MapPin, MessageSquare, Smartphone,
} from 'lucide-react';

export default function PatientPortalPage() {
  const { queues, connected } = useRealtimeQueues();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [routingSuggestion, setRoutingSuggestion] = useState<RoutingSuggestion | null>(null);
  const [qrInput, setQrInput] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    api.getPatients().then((p) => {
      setPatients(p);
      if (p.length > 0 && !selected) setSelected(p[0]);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    api.getNotifications(selected.id).then(setNotifications);
    api.getAISuggestions().then((s) => {
      const match = s.find((x) => x.patientId === selected.id);
      setRoutingSuggestion(match ?? null);
    });
    const interval = setInterval(() => {
      api.getNotifications(selected.id).then(setNotifications);
      api.getAISuggestions().then((s) => {
        const match = s.find((x) => x.patientId === selected.id);
        setRoutingSuggestion(match ?? null);
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [selected]);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const { patient } = await api.checkIn({ qrCode: qrInput || selected?.qrCode, patientId: selected?.id });
      setSelected(patient);
      setPatients((prev) => prev.map((p) => (p.id === patient.id ? patient : p)));
    } catch (err) {
      alert(String(err));
    } finally {
      setCheckingIn(false);
    }
  };

  const handleAcceptRouting = async () => {
    if (!routingSuggestion || !selected) return;
    await api.redirect({
      patientId: selected.id,
      fromDepartment: routingSuggestion.fromDepartment,
      toDepartment: routingSuggestion.toDepartment,
    });
    setRoutingSuggestion(null);
  };

  const currentDeptStats = selected?.currentDepartment
    ? queues.find((q) => q.departmentId === selected.currentDepartment)
    : null;

  const queueEntry = currentDeptStats?.nextPatients.find((e) => e.patientId === selected?.id)
    ?? currentDeptStats?.currentPatient;

  return (
    <Layout connected={connected}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Patient Portal</h1>
          <p className="text-gray-400 mt-1">
            Online registration • QR check-in • Digital token • Live queue • SMS/WhatsApp notifications
          </p>
        </div>

        {selected && (
          <>
            <LiveTokenCard
              patient={selected}
              estimatedWait={currentDeptStats?.avgWaitMinutes}
              currentQueuePosition={queueEntry?.position}
            />

            <SmartRoutingBanner suggestion={routingSuggestion} onAccept={handleAcceptRouting} />
          </>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="glass-card p-6 space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-accent-cyan" /> QR Code Check-in
            </h2>
            <select
              className="input-field"
              value={selected?.id ?? ''}
              onChange={(e) => setSelected(patients.find((p) => p.id === e.target.value) ?? null)}
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — {p.tokenNumber}</option>
              ))}
            </select>

            {selected && (
              <>
                <div className="flex justify-center p-4 bg-white rounded-xl">
                  <QRCodeSVG value={selected.qrCode} size={160} level="M" />
                </div>
                <p className="text-center text-sm text-gray-400">Scan at kiosk for check-in</p>

                <div className="flex gap-2">
                  <input
                    className="input-field flex-1"
                    placeholder="Enter QR code..."
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                  />
                  <button onClick={handleCheckIn} disabled={checkingIn} className="btn-primary shrink-0">
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>

          {selected && (
            <>
              <div className="glass-card p-6 space-y-4 lg:col-span-1">
                <h2 className="font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent-purple" /> Department-wise Schedule
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Status</span>
                    <StatusBadge status={selected.status} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Package</span>
                    <span className="capitalize">{selected.healthPackage.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {selected.completedDepartments.map((d) => (
                    <div key={d} className="flex items-center gap-2 text-sm text-accent-green p-2 rounded-lg bg-accent-green/5">
                      <span>{DEPARTMENT_ICONS[d]}</span>
                      <span className="capitalize">{d}</span>
                      <span className="ml-auto text-xs">Completed</span>
                    </div>
                  ))}
                  {selected.pendingDepartments.map((d) => {
                    const deptWait = queues.find((q) => q.departmentId === d)?.avgWaitMinutes;
                    return (
                      <div key={d} className="flex items-center gap-2 text-sm text-gray-300 p-2 rounded-lg bg-surface">
                        <span>{DEPARTMENT_ICONS[d as DepartmentId]}</span>
                        <span className="capitalize flex-1">{d}</span>
                        {deptWait !== undefined && (
                          <span className="text-xs text-accent-amber">Est. {deptWait}m</span>
                        )}
                        <Clock className="w-3 h-3 text-gray-500" />
                      </div>
                    );
                  })}
                </div>

                <div className="h-2 bg-surface rounded-full overflow-hidden mt-4">
                  <div
                    className="h-full bg-gradient-to-r from-accent-cyan to-accent-green rounded-full transition-all"
                    style={{
                      width: `${(selected.completedDepartments.length /
                        (selected.completedDepartments.length + selected.pendingDepartments.length || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="glass-card p-6 space-y-4 lg:col-span-1">
                <h2 className="font-semibold flex items-center gap-2">
                  <Bell className="w-4 h-4 text-accent-amber" /> SMS / WhatsApp / In-App
                </h2>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> Notified when to visit next department
                </p>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">No notifications yet</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-3 bg-surface rounded-xl border border-surface-border">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            n.type === 'whatsapp' ? 'bg-accent-green/20 text-accent-green' :
                            n.type === 'sms' ? 'bg-accent-purple/20 text-accent-purple' :
                            'bg-accent-cyan/20 text-accent-cyan'
                          }`}>{n.type}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(n.sentAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <LiveQueueBoard queues={queues} title="Live Queue Status — All Departments" />
      </div>
    </Layout>
  );
}
