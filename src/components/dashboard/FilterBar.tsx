'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Minus, Plus } from 'lucide-react';

interface FilterBarProps {
  activeFilters: string[];
  onToggleFilter: (filter: string) => void;
  duration: string;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFit?: () => void;
}

const FILTERS = [
  { id: 'ai', label: 'AI Prompts', color: '#3b82f6' },
  { id: 'files', label: 'Files', color: '#a78bfa' },
  { id: 'terminal', label: 'Terminal', color: '#fb923c' },
  { id: 'signals', label: 'Signals', color: '#34d399' },
  { id: 'reasoning', label: 'Reasoning', color: '#22d3ee' },
  { id: 'copilot', label: 'Copilot', color: '#f472b6' },
];

export function FilterBar({ activeFilters, onToggleFilter, duration, onZoomIn, onZoomOut, onFit }: FilterBarProps) {
  return (
    <div className="px-6 py-2 flex items-center justify-between animate-fade-in stagger-3">
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((filter) => {
          const active = activeFilters.includes(filter.id);
          return (
            <button
              key={filter.id}
              onClick={() => onToggleFilter(filter.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                active
                  ? 'border-opacity-30 bg-opacity-15'
                  : 'border-transparent bg-transparent text-[#71717a] hover:text-[#a1a1aa]'
              )}
              style={active ? {
                borderColor: `${filter.color}4d`,
                backgroundColor: `${filter.color}26`,
                color: filter.color,
              } : undefined}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: active ? filter.color : '#71717a' }}
              />
              {filter.label}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-[#71717a]">{duration}</span>
        <div className="flex items-center bg-[#111114] rounded-lg border border-[#27272a]">
          <button onClick={onZoomOut} className="p-1.5 text-[#71717a] hover:text-[#fafafa] transition-colors">
            <Minus className="w-3 h-3" />
          </button>
          <button onClick={onFit} className="px-2 py-1 text-[10px] text-[#71717a] hover:text-[#fafafa] border-x border-[#27272a] transition-colors">
            Fit
          </button>
          <button onClick={onZoomIn} className="p-1.5 text-[#71717a] hover:text-[#fafafa] transition-colors">
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
