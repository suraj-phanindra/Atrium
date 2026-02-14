'use client';

const SIGNAL_COLORS: Record<string, string> = {
  green: '#34d399',
  yellow: '#fb923c',
  red: '#f87171',
};

interface SignalCardProps {
  signal: any | null;
  totalSignals: number;
}

export function SignalCard({ signal, totalSignals }: SignalCardProps) {
  const content = signal?.content;
  const color = content ? SIGNAL_COLORS[content.signal_type] || '#71717a' : '#71717a';

  return (
    <div className="flex-[1] rounded-xl bg-[#111114] border border-[#27272a] p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-medium" style={{ color }}>
          {content ? `${content.signal_type?.toUpperCase()} Signal` : 'Latest Signal'}
        </span>
        {signal?.timestamp && (
          <span className="text-[11px] font-mono text-[#71717a] ml-auto">
            {new Date(signal.timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>

      {content ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-[#fafafa]">{content.title}</p>
          <p className="text-xs text-[#a1a1aa] leading-relaxed">{content.description}</p>

          {content.evidence && (
            <div className="rounded-lg bg-[#09090b] border border-[#1e1e22] p-3">
              <span className="text-[10px] uppercase tracking-wide text-[#71717a]">Evidence</span>
              <p className="text-xs text-[#a1a1aa] mt-1 font-mono">{content.evidence}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#18181b] text-[#a1a1aa] border border-[#27272a]">
              {content.rubric_criterion} ({content.rubric_weight}%)
            </span>
            {totalSignals > 1 && (
              <span className="text-[10px] text-[#71717a]">{totalSignals - 1} more signals</span>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-[#71717a] italic">No signals detected yet</p>
      )}
    </div>
  );
}
