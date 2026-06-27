import { Patient } from '../types';
import { Ticket } from 'lucide-react';

interface LiveTokenCardProps {
  patient: Patient;
  estimatedWait?: number;
  currentQueuePosition?: number;
}

export default function LiveTokenCard({ patient, estimatedWait, currentQueuePosition }: LiveTokenCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/10 via-surface-raised to-accent-purple/10 p-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent-cyan/5 rounded-full blur-3xl" />

      <div className="relative flex flex-col sm:flex-row items-center gap-6">
        <div className="text-center sm:text-left flex-1">
          <p className="text-xs uppercase tracking-widest text-accent-cyan mb-1 flex items-center justify-center sm:justify-start gap-1">
            <Ticket className="w-3 h-3" /> Your Live Token
          </p>
          <p className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight">
            {patient.tokenNumber}
          </p>
          <p className="text-gray-400 mt-1">{patient.name}</p>
        </div>

        <div className="flex gap-4">
          {estimatedWait !== undefined && (
            <div className="text-center px-4 py-3 rounded-xl bg-surface/80 border border-surface-border">
              <p className="text-[10px] text-gray-500 uppercase">Est. Wait</p>
              <p className="text-2xl font-bold text-accent-amber">{estimatedWait}m</p>
            </div>
          )}
          {currentQueuePosition !== undefined && (
            <div className="text-center px-4 py-3 rounded-xl bg-surface/80 border border-surface-border">
              <p className="text-[10px] text-gray-500 uppercase">Position</p>
              <p className="text-2xl font-bold text-accent-purple">#{currentQueuePosition}</p>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center sm:text-left">
        Track your token anywhere — inspired by{' '}
        <a href="http://healthfirst360.com/" target="_blank" rel="noreferrer" className="text-accent-cyan hover:underline">
          HealthFirst360
        </a>
      </p>
    </div>
  );
}
