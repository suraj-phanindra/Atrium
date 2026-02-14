'use client';

import { useState, useMemo } from 'react';
import { useSessionInsights } from '@/hooks/useSessionInsights';
import { TopNav } from './TopNav';
import { SessionHeader } from './SessionHeader';
import { StatsBar } from './StatsBar';
import { FilterBar } from './FilterBar';
import { Timeline } from './Timeline/Timeline';
import { DetailPanel } from './DetailPanel/DetailPanel';
import { SessionSummary } from './SessionSummary';

interface DashboardPageProps {
  session: any;
}

export function DashboardPage({ session }: DashboardPageProps) {
  const { insights, events, reasoningUpdates, signals, copilotQuestions, phaseChanges, summary } = useSessionInsights(session.id);
  const [activeFilters, setActiveFilters] = useState(['ai', 'files', 'terminal', 'signals', 'copilot']);

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const stats = useMemo(() => ({
    aiPrompts: events.filter(e => e.event_type === 'claude_code_event').length,
    filesChanged: events.filter(e => e.event_type === 'file_change').length,
    commandsRun: events.filter(e => e.event_type === 'terminal_output' || e.event_type === 'command_executed').length,
    signals: {
      green: signals.filter(s => s.content?.signal_type === 'green').length,
      yellow: signals.filter(s => s.content?.signal_type === 'yellow').length,
      red: signals.filter(s => s.content?.signal_type === 'red').length,
    },
    reasoningCount: reasoningUpdates.length,
    copilotTips: copilotQuestions.length,
    phaseChanges: phaseChanges.length,
    highPriorityCopilot: copilotQuestions.filter(q => q.content?.priority === 'high').length,
  }), [events, signals, reasoningUpdates, copilotQuestions, phaseChanges]);

  const elapsed = useMemo(() => {
    if (!session.started_at) return '0:00';
    const s = Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000);
    return `${Math.floor(s / 60)}m ${(s % 60).toString().padStart(2, '0')}s`;
  }, [session.started_at]);

  const handleEndSession = async () => {
    await fetch(`/api/sessions/${session.id}/end`, { method: 'POST' });
  };

  const isLive = session.status === 'active';
  const challengeTitle = session.challenges?.title || 'Interview Session';
  const candidateName = session.candidate_name || 'Unknown';

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#3b82f6]/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10">
        <TopNav />
        <SessionHeader
          title={challengeTitle}
          candidateName={candidateName}
          status={session.status}
          startedAt={session.started_at}
          onEndSession={handleEndSession}
        />
        <StatsBar {...stats} />
        <FilterBar
          activeFilters={activeFilters}
          onToggleFilter={toggleFilter}
          duration={elapsed}
        />

        {summary ? (
          <SessionSummary summary={summary} />
        ) : (
          <>
            <Timeline
              events={events}
              insights={insights}
              sessionStartTime={session.started_at}
              isLive={isLive}
              activeFilters={activeFilters}
            />
            <DetailPanel
              latestReasoning={reasoningUpdates[reasoningUpdates.length - 1] || null}
              latestSignal={signals[signals.length - 1] || null}
              latestCopilot={copilotQuestions[copilotQuestions.length - 1] || null}
              totalSignals={signals.length}
            />
          </>
        )}
      </div>
    </div>
  );
}
