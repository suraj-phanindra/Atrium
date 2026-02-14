'use client';

interface ReasoningCardProps {
  reasoning: any | null;
}

export function ReasoningCard({ reasoning }: ReasoningCardProps) {
  const content = reasoning?.content;

  return (
    <div className="flex-[1.3] rounded-xl bg-[#111114] border border-[#27272a] p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-[#22d3ee]" />
        <span className="text-xs font-medium text-[#22d3ee]">Current Reasoning</span>
        {reasoning?.timestamp && (
          <span className="text-[11px] font-mono text-[#71717a] ml-auto">
            {new Date(reasoning.timestamp).toLocaleTimeString()}
          </span>
        )}
      </div>

      {content ? (
        <div className="space-y-3">
          <p className="text-sm text-[#fafafa] leading-relaxed">{content.summary}</p>

          {content.current_hypothesis && (
            <div className="rounded-lg bg-[#09090b] border border-[#1e1e22] p-3">
              <span className="text-[10px] uppercase tracking-wide text-[#71717a]">Hypothesis</span>
              <p className="text-xs text-[#a1a1aa] mt-1 font-mono leading-[1.7]">{content.current_hypothesis}</p>
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#22d3ee]/10 text-[#22d3ee] border border-[#22d3ee]/20">
              Phase: {content.phase}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#18181b] text-[#a1a1aa] border border-[#27272a]">
              {content.approach_quality}
            </span>
            {content.ai_usage_pattern && (
              <span className="text-[10px] text-[#71717a]">AI: {content.ai_usage_pattern}</span>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-[#71717a] italic">Waiting for candidate activity...</p>
      )}
    </div>
  );
}
