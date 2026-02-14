'use client';

interface PlayheadProps {
  position: number; // 0-100 percentage
}

export function Playhead({ position }: PlayheadProps) {
  return (
    <div
      className="absolute top-0 bottom-0 z-20 pointer-events-none"
      style={{ left: `${position}%` }}
    >
      {/* Top circle */}
      <div
        className="absolute -top-1 -translate-x-1/2 w-[10px] h-[10px] rounded-full bg-[#3b82f6] animate-pulse-slow"
        style={{ boxShadow: '0 0 10px #3b82f6' }}
      />
      {/* Line */}
      <div className="absolute top-0 bottom-0 -translate-x-1/2 w-[2px] bg-[#3b82f6] animate-pulse-slow" />
    </div>
  );
}
