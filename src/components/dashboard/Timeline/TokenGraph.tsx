'use client';

import { useMemo } from 'react';

interface TokenGraphProps {
  events: any[];
  startTime: number;
  endTime: number;
}

export function TokenGraph({ events, startTime, endTime }: TokenGraphProps) {
  const bars = useMemo(() => {
    const duration = endTime - startTime || 1;
    const bucketCount = 60;
    const bucketSize = duration / bucketCount;
    const buckets = new Array(bucketCount).fill(0);

    const aiEvents = events.filter(e =>
      e.event_type === 'claude_code_event' || e.event_type === 'terminal_output'
    );

    aiEvents.forEach(e => {
      const t = new Date(e.timestamp).getTime();
      const idx = Math.min(bucketCount - 1, Math.max(0, Math.floor((t - startTime) / bucketSize)));
      buckets[idx] += (e.raw_content?.length || 0);
    });

    const max = Math.max(...buckets, 1);
    return buckets.map(v => v / max);
  }, [events, startTime, endTime]);

  return (
    <div className="px-3 py-2">
      <div className="text-[10.5px] uppercase tracking-[0.8px] text-[#71717a] mb-2">
        AI Activity Over Time
      </div>
      <div className="flex items-end gap-[3px] h-[80px]">
        {bars.map((height, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-[2px] transition-all duration-300"
            style={{
              height: `${Math.max(2, height * 100)}%`,
              backgroundColor: '#a78bfa',
              opacity: height < 0.1 ? 0.3 : height > 0.7 ? 1 : 0.6,
            }}
          />
        ))}
      </div>
    </div>
  );
}
