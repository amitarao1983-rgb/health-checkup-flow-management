import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SystemFlowDiagram from '../components/SystemFlowDiagram';
import FlowPipeline from '../components/FlowPipeline';
import RegistrationStats from '../components/RegistrationStats';
import LiveQueueBoard from '../components/LiveQueueBoard';
import DepartmentWorkloadBoard from '../components/DepartmentWorkloadBoard';
import DepartmentTimelineChart from '../components/DepartmentTimelineChart';
import { useRealtimeQueues } from '../hooks/useRealtime';
import {
  UserPlus, Users, LayoutDashboard, Building2, CheckCircle2, Activity,
  ArrowRight, ClipboardList, Calendar, FileText, Headphones,
} from 'lucide-react';

const modules = [
  { to: '/register', title: 'Registration', desc: 'Online registration, token generation & patient log-in stats', icon: UserPlus, color: 'from-accent-cyan/20 to-transparent border-accent-cyan/20' },
  { to: '/receptionist', title: 'Receptionist Dashboard', desc: 'Check-in desk, registration overview & token issuance', icon: Headphones, color: 'from-accent-rose/20 to-transparent border-accent-rose/20' },
  { to: '/patient', title: 'Patient Portal', desc: 'QR check-in, live token, queue status, SMS/WhatsApp alerts', icon: Users, color: 'from-accent-purple/20 to-transparent border-accent-purple/20' },
  { to: '/coordinator', title: 'Coordinator Dashboard', desc: 'Pathways, workload, auto-assignment & delay alerts', icon: LayoutDashboard, color: 'from-accent-green/20 to-transparent border-accent-green/20' },
  { to: '/department', title: 'Department Dashboard', desc: 'Current patient, next 3, avg exam time & status', icon: Building2, color: 'from-accent-amber/20 to-transparent border-accent-amber/20' },
  { to: '/doctor-schedule', title: 'Doctor Schedule', desc: 'Department-wise doctor availability & time slots', icon: Calendar, color: 'from-accent-cyan/20 to-transparent border-accent-cyan/20' },
  { to: '/mois-report', title: 'MOIS Report', desc: 'Medical reports status & completion tracking', icon: FileText, color: 'from-accent-purple/20 to-transparent border-accent-purple/20' },
  { to: '/completion', title: 'Completion Dashboard', desc: 'Daily patient completion report', icon: CheckCircle2, color: 'from-accent-green/20 to-transparent border-accent-green/20' },
  { to: '/ai-queue', title: 'AI Queue Engine', desc: 'Wait prediction, smart routing & workload balance', icon: Activity, color: 'from-accent-cyan/20 to-transparent border-accent-cyan/20' },
];

export default function HomePage() {
  const { queues, connected } = useRealtimeQueues();

  return (
    <Layout connected={connected}>
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
              Powered by HealthFirst360
            </span>
            <a
              href="http://healthfirst360.com/"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-gray-500 hover:text-accent-cyan transition-colors"
            >
              healthfirst360.com ↗
            </a>
          </div>
          <h1 className="font-display text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Health Check-up Flow Management
          </h1>
          <p className="text-gray-400 max-w-3xl">
            Streamline your health check-up department. When one department has a long queue,
            patients receive smart notifications to visit other tests with shorter wait times.
          </p>
        </header>

        <SystemFlowDiagram />

        <FlowPipeline activeStep={1} />

        <section>
          <h2 className="font-display text-xl font-semibold mb-2 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-accent-cyan" />
            Registration & Patient Log-in Stats
          </h2>
          <p className="text-sm text-gray-500 mb-4">Track how many patients register and check in today</p>
          <RegistrationStats />
        </section>

        <LiveQueueBoard queues={queues} title="HealthFirst360 — Live Department Queue" />

        <DepartmentWorkloadBoard />

        <DepartmentTimelineChart />

        <div>
          <h2 className="font-display text-xl font-semibold mb-4">Application Modules</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map(({ to, title, desc, icon: Icon, color }) => (
              <Link
                key={to}
                to={to}
                className={`glass-card p-6 bg-gradient-to-br ${color} hover:scale-[1.02] transition-transform group`}
              >
                <div className="flex items-start justify-between">
                  <Icon className="w-8 h-8 text-accent-cyan mb-4" />
                  <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-accent-cyan transition-colors" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-1">{title}</h3>
                <p className="text-sm text-gray-400">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
