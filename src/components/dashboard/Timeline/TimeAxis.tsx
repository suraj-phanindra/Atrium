interface TimeAxisProps {
  startTime: number;
  endTime: number;
  tickCount?: number;
}

export function TimeAxis({ startTime, endTime, tickCount = 8 }: TimeAxisProps) {
  const duration = endTime - startTime || 1;

  const ticks = Array.from({ length: tickCount + 1 }).map((_, i) => {
    const time = startTime + (duration / tickCount) * i;
    const elapsed = Math.floor((time - startTime) / 1000);
    const min = Math.floor(elapsed / 60);
    const sec = elapsed % 60;
    return {
      position: (i / tickCount) * 100,
      label: `${min}:${sec.toString().padStart(2, '0')}`,
    };
  });

  return (
    <div className="relative h-6 border-t border-[#1e1e22] ml-[100px]">
      {ticks.map((tick, i) => (
        <div
          key={i}
          className="absolute flex flex-col items-center"
          style={{ left: `${tick.position}%`, transform: 'translateX(-50%)' }}
        >
          <div className="w-[1px] h-[5px] bg-[#71717a]" />
          <span className="font-mono text-[10px] text-[#71717a] mt-0.5">{tick.label}</span>
        </div>
      ))}
    </div>
  );
}
