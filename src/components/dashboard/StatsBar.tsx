'use client';

import { cn } from '@/lib/utils';
import { CounterValue } from './LiveIndicators';

interface StatsBarProps {
  aiPrompts: number;
  filesChanged: number;
  commandsRun: number;
  signals: { green: number; yellow: number; red: number };
  reasoningCount: number;
  copilotTips: number;
  phaseChanges: number;
  highPriorityCopilot: number;
}

export function StatsBar({
  aiPrompts, filesChanged, commandsRun, signals, reasoningCount, copilotTips, phaseChanges, highPriorityCopilot
}: StatsBarProps) {
  const stats = [
    { label: 'AI Prompts', value: aiPrompts, color: '#3b82f6', subtitle: `Avg tokens per prompt` },
    { label: 'Files Changed', value: filesChanged, color: '#a78bfa', subtitle: 'File modifications' },
    { label: 'Commands Run', value: commandsRun, color: '#fb923c', subtitle: 'Terminal commands' },
    { label: 'Signals', value: `${signals.green}G ${signals.yellow}Y ${signals.red}R`, color: '#34d399', subtitle: `${signals.green + signals.yellow + signals.red} total` },
    { label: 'Reasoning', value: reasoningCount, color: '#22d3ee', subtitle: `Phase changes: ${phaseChanges}` },
    { label: 'Copilot Tips', value: copilotTips, color: '#f472b6', subtitle: `${highPriorityCopilot} high priority` },
  ];

  return (
    <div className="px-6 py-3 animate-fade-in stagger-2">
      <div className="grid grid-cols-6 gap-[1px] bg-[#27272a] rounded-xl overflow-hidden">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#111114] px-4 py-3 flex flex-col items-center">
            <div className="w-1.5 h-1.5 rounded-full mb-2" style={{ backgroundColor: stat.color }} />
            <CounterValue value={stat.value} label={stat.label} />
            <div className="text-[11.5px] text-[#71717a] mt-1">{stat.subtitle}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
