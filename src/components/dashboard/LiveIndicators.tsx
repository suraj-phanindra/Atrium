'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function PulseDot({ color = '#34d399', size = 8 }: { color?: string; size?: number }) {
  return (
    <span className="relative inline-flex">
      <span
        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40"
        style={{ backgroundColor: color }}
      />
      <span
        className="relative inline-flex rounded-full"
        style={{ backgroundColor: color, width: size, height: size }}
      />
    </span>
  );
}

export function FlashWrapper({ children, flash }: { children: React.ReactNode; flash: boolean }) {
  return (
    <div className={cn('transition-all', flash && 'animate-event-flash')}>
      {children}
    </div>
  );
}

export function CounterValue({ value, label }: { value: number | string; label: string }) {
  const [bumped, setBumped] = useState(false);
  const [prevValue, setPrevValue] = useState(value);

  useEffect(() => {
    if (value !== prevValue) {
      setBumped(true);
      setPrevValue(value);
      const timer = setTimeout(() => setBumped(false), 300);
      return () => clearTimeout(timer);
    }
  }, [value, prevValue]);

  return (
    <div className="text-center">
      <div className={cn('font-mono text-[22px] font-semibold text-[#fafafa] transition-transform', bumped && 'animate-counter-bump')}>
        {value}
      </div>
      <div className="text-[11.5px] uppercase tracking-[0.8px] text-[#71717a]">{label}</div>
    </div>
  );
}
