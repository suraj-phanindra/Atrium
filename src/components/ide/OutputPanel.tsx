'use client';

import { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Play, Trash2, Terminal, CheckCircle, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OutputPanelProps {
  sessionId: string;
  onCanSubmitChange?: (canSubmit: boolean) => void;
  onSubmit?: () => void;
}

export interface OutputPanelRef {
  run: () => void;
}

const OutputPanel = forwardRef<OutputPanelRef, OutputPanelProps>(({ sessionId, onCanSubmitChange, onSubmit }, ref) => {
  const [output, setOutput] = useState<string>('');
  const [testOutput, setTestOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [canSubmit, setCanSubmit] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const run = useCallback(async () => {
    setIsRunning(true);
    setOutput('');
    setTestOutput('');
    setCanSubmit(false);
    if (onCanSubmitChange) onCanSubmitChange(false);
    try {
      const res = await fetch('/api/sandbox/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOutput(`Error: ${data.error}`);
        return;
      }

      setLastCommand(data.command);
      const lines: string[] = [];
      lines.push(`$ ${data.command}`);
      if (data.stdout) lines.push(data.stdout);
      if (data.stderr) lines.push(`\x1b[stderr]\n${data.stderr}`);
      lines.push(`\nProcess exited with code ${data.exitCode}`);
      setOutput(lines.join('\n'));

      if (data.testOutput) setTestOutput(data.testOutput);
      setCanSubmit(data.canSubmit || false);
      if (onCanSubmitChange) onCanSubmitChange(data.canSubmit || false);
    } catch (err: any) {
      setOutput(`Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  }, [sessionId, onCanSubmitChange]);

  useImperativeHandle(ref, () => ({ run }), [run]);

  const clear = useCallback(() => {
    setOutput('');
    setTestOutput('');
    setLastCommand('');
    setCanSubmit(false);
    if (onCanSubmitChange) onCanSubmitChange(false);
  }, [onCanSubmitChange]);

  return (
    <div className="h-full flex flex-col bg-[#09090b]">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#1e1e22] flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-[#22c55e]" />
          <span className="text-[10px] text-[#71717a] uppercase tracking-wider font-semibold">Output</span>
          {lastCommand && (
            <span className="text-[10px] text-[#52525b] ml-2 font-mono truncate max-w-[200px]">{lastCommand}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={run}
            disabled={isRunning}
            className={cn(
              'flex items-center gap-1 px-2 py-0.5 text-[10px] rounded transition-colors',
              isRunning
                ? 'bg-[#22c55e]/10 text-[#22c55e]/50 cursor-not-allowed'
                : 'bg-[#22c55e]/10 text-[#22c55e] hover:bg-[#22c55e]/20'
            )}
          >
            <Play className="w-3 h-3" />
            {isRunning ? 'Running...' : 'Run'}
          </button>
          <button
            onClick={clear}
            className="flex items-center gap-1 px-2 py-0.5 text-[10px] text-[#71717a] hover:text-[#a1a1aa] rounded transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-auto p-3 font-mono text-xs leading-5">
        {output ? (
          <pre className="whitespace-pre-wrap">
            {output.split('\n').map((line, i) => {
              const isStderr = line.includes('\x1b[stderr]');
              const isCommand = line.startsWith('$ ');
              const isExit = line.startsWith('Process exited');
              if (isStderr) return null;
              return (
                <div
                  key={i}
                  className={cn(
                    isCommand && 'text-[#3b82f6]',
                    isExit && 'text-[#71717a] mt-1',
                    !isCommand && !isExit && output.includes('\x1b[stderr]') && i > output.split('\n').indexOf('\x1b[stderr]')
                      ? 'text-[#f97316]'
                      : !isCommand && !isExit && 'text-[#e4e4e7]'
                  )}
                >
                  {line}
                </div>
              );
            })}
            {testOutput && (
              <div className="mt-2 pt-2 border-t border-[#27272a]">
                <div className="text-[10px] text-[#71717a] mb-1">TEST RESULTS</div>
                <pre className="text-[#e4e4e7]">{testOutput}</pre>
              </div>
            )}
          </pre>
        ) : (
          <div className="flex items-center justify-center h-full text-[#52525b] text-xs">
            {isRunning ? (
              <span className="animate-pulse">Running...</span>
            ) : (
              <span>Click Run to execute your code</span>
            )}
          </div>
        )}
      </div>
      {canSubmit && !submitted && (
        <div className="flex items-center justify-between px-3 py-2 border-t border-[#22c55e]/20 bg-[#22c55e]/5">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#22c55e]" />
            <span className="text-xs text-[#22c55e]">All tests pass! Ready to submit.</span>
          </div>
          <button
            onClick={async () => {
              setSubmitted(true);
              await fetch('/api/sandbox/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId }),
              });
              if (onSubmit) onSubmit();
            }}
            className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-md bg-[#22c55e] text-white hover:bg-[#22c55e]/90 transition-colors"
          >
            <Send className="w-3 h-3" />
            Submit
          </button>
        </div>
      )}
      {submitted && (
        <div className="flex items-center justify-center px-3 py-2 border-t border-[#22c55e]/20 bg-[#22c55e]/5">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#22c55e]" />
            <span className="text-xs text-[#22c55e] font-medium">Submitted successfully!</span>
          </div>
        </div>
      )}
    </div>
  );
});

OutputPanel.displayName = 'OutputPanel';
export default OutputPanel;
