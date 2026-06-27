import { DepartmentStats } from '../types';
import { DEPARTMENT_ICONS, DepartmentId } from '../types';

const QUEUE_DEPT_IDS: DepartmentId[] = [
  'ecg', 'xray', 'usg', 'mammography', 'echo2d', 'tmt', 'dental',
];

interface LiveQueueBoardProps {
  queues: DepartmentStats[];
  title?: string;
}

export default function LiveQueueBoard({ queues, title = 'Live Department Queue' }: LiveQueueBoardProps) {
  const filtered = QUEUE_DEPT_IDS.map((id) =>
    queues.find((q) => q.departmentId === id)
  ).filter(Boolean) as DepartmentStats[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <span className="text-xs px-3 py-1 rounded-full bg-accent-green/10 text-accent-green border border-accent-green/20 animate-pulse-slow">
          ● Live
        </span>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((dept) => {
          const waitLabel =
            dept.avgWaitMinutes < 15 ? 'Short wait' :
            dept.avgWaitMinutes < 30 ? 'Moderate' : 'Long wait';

          return (
            <div
              key={dept.departmentId}
              className={`queue-card p-4 rounded-2xl border transition-all ${
                dept.isOverTarget
                  ? 'border-red-400/40 bg-red-400/5'
                  : 'border-surface-border bg-surface-raised/80 hover:border-accent-cyan/30'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{DEPARTMENT_ICONS[dept.departmentId]}</span>
                  <div>
                    <p className="font-semibold text-sm">{dept.name}</p>
                    <p className="text-xs text-gray-500">{dept.queueLength} in queue</p>
                  </div>
                </div>
                <div className="token-badge text-center px-2 py-1 rounded-lg bg-surface border border-accent-cyan/20">
                  <p className="text-[10px] text-gray-500 uppercase">Est. Wait</p>
                  <p className="text-lg font-bold text-accent-cyan">{dept.avgWaitMinutes}m</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs mb-2">
                <span className={`${dept.avgWaitMinutes < 15 ? 'text-accent-green' : dept.avgWaitMinutes < 30 ? 'text-accent-amber' : 'text-red-400'}`}>
                  {waitLabel}
                </span>
                <span className="text-gray-500">{dept.occupancyPercent}% occupancy</span>
              </div>

              <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    dept.occupancyPercent > 80 ? 'bg-red-400' :
                    dept.occupancyPercent > 50 ? 'bg-accent-amber' : 'bg-accent-green'
                  }`}
                  style={{ width: `${dept.occupancyPercent}%` }}
                />
              </div>

              {dept.currentPatient && (
                <p className="mt-2 text-xs text-gray-400 truncate">
                  Now: <span className="text-white font-mono">{dept.currentPatient.tokenNumber}</span>
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
