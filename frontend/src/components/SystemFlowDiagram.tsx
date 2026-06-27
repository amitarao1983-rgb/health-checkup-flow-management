const QUEUE_BRANCHES = [
  'ECG Queue', 'X-Ray Queue', 'USG Queue', 'Mammography Queue',
  '2D Echo Queue', 'TMT Queue', 'Dental Queue',
];

export default function SystemFlowDiagram() {
  return (
    <div className="glass-card p-8 overflow-x-auto">
      <h3 className="text-sm font-medium text-gray-400 mb-6 uppercase tracking-wider">
        Health Check-up Flow (as specified)
      </h3>

      <div className="flex flex-col items-center min-w-[320px] font-mono text-sm">
        {/* Registration */}
        <div className="flow-node px-8 py-3 rounded-xl border-2 border-accent-cyan/50 bg-accent-cyan/10 text-accent-cyan font-semibold">
          Registration
        </div>
        <div className="flow-line" />

        {/* Queue Engine */}
        <div className="flow-node px-8 py-3 rounded-xl border-2 border-accent-purple/50 bg-accent-purple/10 text-accent-purple font-semibold">
          Queue Engine
        </div>

        {/* Branch lines + department queues */}
        <div className="relative w-full max-w-4xl mt-2 mb-2">
          <div className="absolute left-1/2 top-0 w-0.5 h-4 bg-surface-border -translate-x-1/2" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 pt-4">
            {QUEUE_BRANCHES.map((q) => (
              <div
                key={q}
                className="px-3 py-2 rounded-lg border border-surface-border bg-surface text-center text-xs text-gray-300 hover:border-accent-cyan/30 transition-colors"
              >
                ├── {q}
              </div>
            ))}
          </div>
        </div>

        <div className="flow-line" />

        {/* Automatic Routing */}
        <div className="flow-node px-8 py-3 rounded-xl border-2 border-accent-green/50 bg-accent-green/10 text-accent-green font-semibold">
          Automatic Routing
        </div>
        <div className="flow-line" />

        {/* Completion Dashboard */}
        <div className="flow-node px-8 py-3 rounded-xl border-2 border-accent-amber/50 bg-accent-amber/10 text-accent-amber font-semibold">
          Completion Dashboard
        </div>
      </div>

      <style>{`
        .flow-line {
          width: 2px;
          height: 28px;
          background: linear-gradient(to bottom, #2d3a4f, #22d3ee40);
        }
      `}</style>
    </div>
  );
}
