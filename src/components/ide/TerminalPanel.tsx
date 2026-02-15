'use client';

import dynamic from 'next/dynamic';
import { TerminalSquare, Loader2 } from 'lucide-react';

const Terminal = dynamic(() => import('@/components/terminal/Terminal'), { ssr: false });

interface TerminalPanelProps {
  sessionId: string;
  sandboxReady: boolean;
}

export default function TerminalPanel({ sessionId, sandboxReady }: TerminalPanelProps) {
  return (
    <div className="h-full flex flex-col bg-[#09090b]">
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-[#1e1e22] flex-shrink-0">
        <TerminalSquare className="w-3.5 h-3.5 text-[#f97316]" />
        <span className="text-[10px] text-[#71717a] uppercase tracking-wider font-semibold">Terminal</span>
      </div>
      <div className="flex-1 min-h-0 p-1">
        {sandboxReady ? (
          <Terminal sessionId={sessionId} />
        ) : (
          <div className="flex items-center justify-center h-full text-[#71717a] text-sm">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Setting up environment...
          </div>
        )}
      </div>
    </div>
  );
}
