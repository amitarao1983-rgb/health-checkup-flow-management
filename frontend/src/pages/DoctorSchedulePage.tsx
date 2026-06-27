import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../lib/api';
import { Calendar, Clock, User, Stethoscope } from 'lucide-react';

interface DoctorSchedule {
  id: string;
  name: string;
  department: string;
  specialization: string;
  availableFrom: string;
  availableTo: string;
  slotDurationMinutes: number;
  todaySlots: { time: string; status: 'available' | 'booked' | 'in_progress' }[];
}

const SLOT_COLORS = {
  available: 'bg-accent-green/20 text-accent-green border-accent-green/30',
  booked: 'bg-surface-overlay text-gray-500 border-surface-border',
  in_progress: 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30',
};

export default function DoctorSchedulePage() {
  const [doctors, setDoctors] = useState<DoctorSchedule[]>([]);
  const [selected, setSelected] = useState<string>('');

  useEffect(() => {
    api.getDoctorSchedule().then((d) => {
      setDoctors(d);
      if (d.length > 0) setSelected(d[0].id);
    });
  }, []);

  const doctor = doctors.find((d) => d.id === selected);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-3">
            <Calendar className="w-8 h-8 text-accent-cyan" />
            Doctor Schedule
          </h1>
          <p className="text-gray-400 mt-1">
            Department-wise doctor availability with time slots — placeholder for HIS integration
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="glass-card p-4 space-y-2">
            <h2 className="font-semibold text-sm text-gray-400 uppercase tracking-wider mb-3">Doctors</h2>
            {doctors.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelected(d.id)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  selected === d.id
                    ? 'bg-accent-cyan/10 border border-accent-cyan/30'
                    : 'bg-surface hover:bg-surface-overlay border border-transparent'
                }`}
              >
                <p className="font-medium text-sm">{d.name}</p>
                <p className="text-xs text-gray-500">{d.department}</p>
              </button>
            ))}
          </div>

          {doctor && (
            <div className="glass-card p-6 lg:col-span-2 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-accent-purple/20 flex items-center justify-center">
                  <Stethoscope className="w-7 h-7 text-accent-purple" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">{doctor.name}</h2>
                  <p className="text-gray-400">{doctor.specialization}</p>
                  <p className="text-sm text-accent-cyan mt-1">{doctor.department}</p>
                </div>
              </div>

              <div className="flex gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="w-4 h-4" />
                  {doctor.availableFrom} — {doctor.availableTo}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <User className="w-4 h-4" />
                  {doctor.slotDurationMinutes} min slots
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
                  Today's Schedule
                </h3>
                <div className="flex flex-wrap gap-2">
                  {doctor.todaySlots.map((slot) => (
                    <div
                      key={slot.time}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium capitalize ${SLOT_COLORS[slot.status]}`}
                    >
                      {slot.time}
                      <span className="block text-[10px] opacity-70">{slot.status.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-gray-500 border-t border-surface-border pt-4">
                Placeholder data — connect to hospital HIS /{' '}
                <a href="http://healthfirst360.com/" target="_blank" rel="noreferrer" className="text-accent-cyan hover:underline">
                  HealthFirst360
                </a>{' '}
                admin for live doctor schedules.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
