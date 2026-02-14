'use client';

interface SwimLaneProps {
  label: string;
  color: string;
  children: React.ReactNode;
}

export function SwimLane({ label, color, children }: SwimLaneProps) {
  return (
    <div className="flex items-center h-[44px] border-b border-[#1e1e22] last:border-b-0">
      <div className="w-[100px] flex-shrink-0 px-3 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <span className="text-[10px] text-[#71717a] uppercase tracking-[0.5px] truncate">{label}</span>
      </div>
      <div className="flex-1 relative h-full">
        {children}
      </div>
    </div>
  );
}
