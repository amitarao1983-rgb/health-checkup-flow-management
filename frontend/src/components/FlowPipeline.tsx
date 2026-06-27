interface FlowPipelineProps {
  activeStep?: number;
}

const steps = [
  { label: 'Registration', desc: 'Online & walk-in' },
  { label: 'Queue Engine', desc: 'Multi-department queues' },
  { label: 'Auto Routing', desc: 'AI optimization' },
  { label: 'Completion', desc: 'Reports & discharge' },
];

export default function FlowPipeline({ activeStep = 0 }: FlowPipelineProps) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">System Flow</h3>
      <div className="flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center flex-1">
            <div className={`flow-step flex-1 ${i <= activeStep ? 'flow-step-active' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                ${i <= activeStep ? 'bg-accent-cyan text-surface' : 'bg-surface-overlay text-gray-500'}`}>
                {i + 1}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{step.label}</p>
                <p className="text-xs text-gray-500 truncate">{step.desc}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 h-0.5 shrink-0 ${i < activeStep ? 'bg-accent-cyan' : 'bg-surface-border'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
