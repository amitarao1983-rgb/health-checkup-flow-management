import { NavLink } from 'react-router-dom';
import {
  Activity, LayoutDashboard, Users, Building2, CheckCircle2,
  UserPlus, Home, Wifi, WifiOff, Headphones, Calendar, FileText,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/register', label: 'Registration', icon: UserPlus },
  { to: '/receptionist', label: 'Receptionist', icon: Headphones },
  { to: '/patient', label: 'Patient Portal', icon: Users },
  { to: '/coordinator', label: 'Coordinator', icon: LayoutDashboard },
  { to: '/department', label: 'Departments', icon: Building2 },
  { to: '/doctor-schedule', label: 'Doctor Schedule', icon: Calendar },
  { to: '/mois-report', label: 'MOIS Report', icon: FileText },
  { to: '/completion', label: 'Completion', icon: CheckCircle2 },
  { to: '/ai-queue', label: 'AI Queue', icon: Activity },
];

interface LayoutProps {
  children: React.ReactNode;
  connected?: boolean;
}

export default function Layout({ children, connected }: LayoutProps) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 fixed h-full bg-surface-raised/90 backdrop-blur-xl border-r border-surface-border flex flex-col z-50">
        <div className="p-6 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
              <Activity className="w-5 h-5 text-surface" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-tight">HealthFirst360</h1>
              <p className="text-xs text-gray-500">Check-up Flow</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => isActive ? 'nav-link-active' : 'nav-link'}
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-surface-border space-y-2">
          {connected !== undefined && (
            <div className={`flex items-center gap-2 text-xs ${connected ? 'text-accent-green' : 'text-gray-500'}`}>
              {connected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {connected ? 'Live updates active' : 'Connecting...'}
            </div>
          )}
          <a
            href="http://healthfirst360.com/"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-gray-600 hover:text-accent-cyan transition-colors block"
          >
            healthfirst360.com ↗
          </a>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
