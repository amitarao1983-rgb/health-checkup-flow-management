import { RoutingSuggestion } from '../types';
import { Route, Sparkles } from 'lucide-react';

interface SmartRoutingBannerProps {
  suggestion: RoutingSuggestion | null;
  onAccept?: () => void;
}

export default function SmartRoutingBanner({ suggestion, onAccept }: SmartRoutingBannerProps) {
  if (!suggestion) return null;

  return (
    <div className="rounded-2xl border border-accent-purple/40 bg-gradient-to-r from-accent-purple/10 to-accent-green/10 p-5 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-accent-purple/20 shrink-0">
          <Sparkles className="w-5 h-5 text-accent-purple" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-accent-purple flex items-center gap-2">
            <Route className="w-4 h-4" /> Smart Re-routing Suggestion
          </p>
          <p className="text-sm text-gray-300 mt-1">{suggestion.reason}</p>
          <p className="text-xs text-accent-green mt-2">
            Save ~{suggestion.savedWaitMinutes} minutes • {Math.round(suggestion.confidence * 100)}% confidence
          </p>
        </div>
        {onAccept && (
          <button onClick={onAccept} className="btn-primary text-sm py-2 shrink-0">
            Go Now
          </button>
        )}
      </div>
    </div>
  );
}
