'use client';

import { cn } from '@/lib/utils';

interface EventMarkerProps {
  type: 'ai' | 'file' | 'terminal' | 'signal' | 'copilot';
  color: string;
  signalType?: 'green' | 'yellow' | 'red';
  width?: number;
  selected?: boolean;
  isNew?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const SIGNAL_COLORS: Record<string, string> = {
  green: '#34d399',
  yellow: '#fb923c',
  red: '#f87171',
};

export function EventMarker({ type, color, signalType, width, selected, isNew, onClick, style }: EventMarkerProps) {
  const actualColor = signalType ? SIGNAL_COLORS[signalType] : color;

  const baseClasses = cn(
    'absolute top-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-[1.6]',
    selected && 'scale-150',
    isNew && 'animate-event-flash'
  );

  // Circle (AI prompts, signals)
  if (type === 'ai' || type === 'signal') {
    return (
      <div
        className={baseClasses}
        style={{
          ...style,
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: actualColor,
          boxShadow: selected ? `0 0 0 3px #111114, 0 0 0 5px ${actualColor}` : undefined,
        }}
        onClick={onClick}
      />
    );
  }

  // Square (files)
  if (type === 'file') {
    return (
      <div
        className={baseClasses}
        style={{
          ...style,
          width: 12,
          height: 12,
          borderRadius: 3,
          backgroundColor: actualColor,
        }}
        onClick={onClick}
      />
    );
  }

  // Horizontal bar (terminal)
  if (type === 'terminal') {
    return (
      <div
        className={cn(baseClasses, 'hover:opacity-80')}
        style={{
          ...style,
          width: width || 20,
          height: 6,
          borderRadius: 3,
          backgroundColor: actualColor,
          opacity: 0.5,
        }}
        onClick={onClick}
      />
    );
  }

  // Triangle (copilot)
  if (type === 'copilot') {
    return (
      <div
        className={baseClasses}
        style={{
          ...style,
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderBottom: `9px solid ${actualColor}`,
          backgroundColor: 'transparent',
        }}
        onClick={onClick}
      />
    );
  }

  return null;
}
