import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: 'cyan' | 'purple' | 'green' | 'amber' | 'rose';
}

const colorMap = {
  cyan: 'from-accent-cyan/20 to-accent-cyan/5 border-accent-cyan/20 text-accent-cyan',
  purple: 'from-accent-purple/20 to-accent-purple/5 border-accent-purple/20 text-accent-purple',
  green: 'from-accent-green/20 to-accent-green/5 border-accent-green/20 text-accent-green',
  amber: 'from-accent-amber/20 to-accent-amber/5 border-accent-amber/20 text-accent-amber',
  rose: 'from-accent-rose/20 to-accent-rose/5 border-accent-rose/20 text-accent-rose',
};

export default function StatCard({ label, value, icon: Icon, trend, color = 'cyan' }: StatCardProps) {
  return (
    <div className={`stat-card bg-gradient-to-br ${colorMap[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-display font-bold text-white">{value}</p>
          {trend && <p className="text-xs text-gray-500 mt-1">{trend}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-surface-raised/50 ${colorMap[color].split(' ').pop()}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
