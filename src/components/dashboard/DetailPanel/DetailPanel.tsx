'use client';

import { ReasoningCard } from './ReasoningCard';
import { SignalCard } from './SignalCard';
import { CopilotCard } from './CopilotCard';

interface DetailPanelProps {
  latestReasoning: any | null;
  latestSignal: any | null;
  latestCopilot: any | null;
  totalSignals: number;
}

export function DetailPanel({ latestReasoning, latestSignal, latestCopilot, totalSignals }: DetailPanelProps) {
  return (
    <div className="px-6 py-4 flex gap-4 animate-fade-in stagger-5">
      <ReasoningCard reasoning={latestReasoning} />
      <SignalCard signal={latestSignal} totalSignals={totalSignals} />
      <CopilotCard question={latestCopilot} />
    </div>
  );
}
