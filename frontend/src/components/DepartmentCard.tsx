import { DepartmentStats } from '../types';
import { DEPARTMENT_ICONS } from '../types';

interface DepartmentCardProps {
  dept: DepartmentStats;
  onClick?: () => void;
  selected?: boolean;
}

export default function DepartmentCard({ dept, onClick, selected }: DepartmentCardProps) {
  const icon = DEPARTMENT_ICONS[dept.departmentId] ?? '🏥';
  const occupancyColor =
    dept.occupancyPercent > 80 ? 'text-red-400' :
    dept.occupancyPercent > 50 ? 'text-accent-amber' : 'text-accent-green';

  return (
    <button
      onClick={onClick}
      className={`glass-card p-4 text-left w-full transition-all hover:border-accent-cyan/30
        ${selected ? 'border-accent-cyan/50 ring-1 ring-accent-cyan/20' : ''}
        ${dept.isOverTarget ? 'border-red-400/30' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="font-medium">{dept.name}</span>
        </div>
        {dept.isOverTarget && (
          <span className="text-xs text-red-400 animate-pulse-slow">⚠ Delay</span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-lg font-bold text-white">{dept.queueLength}</p>
          <p className="text-xs text-gray-500">Waiting</p>
        </div>
        <div>
          <p className="text-lg font-bold text-accent-cyan">{dept.avgWaitMinutes}m</p>
          <p className="text-xs text-gray-500">Est. Wait</p>
        </div>
        <div>
          <p className={`text-lg font-bold ${occupancyColor}`}>{dept.occupancyPercent}%</p>
          <p className="text-xs text-gray-500">Occupancy</p>
        </div>
      </div>

      <div className="mt-3 h-1.5 bg-surface rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            dept.occupancyPercent > 80 ? 'bg-red-400' :
            dept.occupancyPercent > 50 ? 'bg-accent-amber' : 'bg-accent-green'
          }`}
          style={{ width: `${dept.occupancyPercent}%` }}
        />
      </div>
    </button>
  );
}
