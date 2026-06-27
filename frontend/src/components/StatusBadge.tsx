import { PatientStatus } from '../types';
import { STATUS_COLORS } from '../types';

export default function StatusBadge({ status }: { status: PatientStatus | string }) {
  const colors = STATUS_COLORS[status as PatientStatus] ?? 'text-gray-400 bg-gray-400/10 border-gray-400/30';
  return (
    <span className={`status-badge ${colors}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
