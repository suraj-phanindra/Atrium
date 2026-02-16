'use client';

import { useEffect, useRef } from 'react';

interface TerminalProps {
  sessionId: string;
}

export default function TerminalComponent({ sessionId }: TerminalProps) {
  const termRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!termRef.current) return;

    let cleanup: (() => void) | undefined;

    (async () => {
      const { Terminal } = await import('@xterm/xterm');
      const { FitAddon } = await import('@xterm/addon-fit');
      const { createClient } = await import('@/lib/supabase/client');

      if (!termRef.current) return;

      const term = new Terminal({
        cursorBlink: true,
        fontSize: 13,
        fontFamily: "'JetBrains Mono', Menlo, Monaco, 'Courier New', monospace",
        theme: {
          background: '#09090b',
          foreground: '#a9b1d6',
          cursor: '#c0caf5',
          selectionBackground: '#3b82f640',
        },
        scrollback: 5000,
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(termRef.current);

      // Sync terminal size with server PTY
      const syncSize = async () => {
        try {
          fitAddon.fit();
        } catch { return; }
        const cols = term.cols;
        const rows = term.rows;
        if (cols && rows) {
          fetch('/api/sandbox/resize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId, cols, rows }),
          }).catch(() => {});
        }
      };

      // Subscribe to terminal output from sandbox
      const supabase = createClient();
      const channel = supabase
        .channel(`terminal:${sessionId}`)
        .on('broadcast', { event: 'terminal_data' }, ({ payload }) => {
          term.write(payload.data);
        });

      await new Promise<void>((resolve) => {
        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') resolve();
        });
      });

      // Initial fit + resize PTY to match, then nudge shell to redraw prompt
      requestAnimationFrame(() => {
        syncSize().then(() => {
          // Send empty input to trigger prompt redraw after resize
          fetch('/api/sandbox/input', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId, data: '' }),
          }).catch(() => {});
        });
      });

      // Refit + resize on container resize
      const ro = new ResizeObserver(() => syncSize());
      ro.observe(termRef.current);

      // Send keystrokes to sandbox
      term.onData(async (data) => {
        await fetch('/api/sandbox/input', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId, data }),
        });
      });

      cleanup = () => {
        ro.disconnect();
        channel.unsubscribe();
        term.dispose();
      };
    })();

    return () => {
      if (cleanup) cleanup();
    };
  }, [sessionId]);

  return (
    <div
      ref={termRef}
      className="w-full h-full overflow-hidden bg-[#09090b]"
    />
  );
}
