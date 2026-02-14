'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Clock, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

const Terminal = dynamic(() => import('@/components/terminal/Terminal'), { ssr: false });

export default function CandidatePage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBrief, setShowBrief] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [sandboxReady, setSandboxReady] = useState(false);

  // Fetch session data
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/sessions?id=${sessionId}`);
        const data = await res.json();
        setSession(data);

        // Create sandbox if not active yet
        if (data.status === 'pending') {
          const sandboxRes = await fetch('/api/sandbox/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId }),
          });
          if (sandboxRes.ok) setSandboxReady(true);
        } else {
          setSandboxReady(true);
        }

        // Start analysis
        await fetch('/api/analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId, action: 'start' }),
        });
      } catch (err) {
        console.error('Failed to load session:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessionId]);

  // Timer
  useEffect(() => {
    if (!session?.started_at) return;
    const start = new Date(session.started_at).getTime();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [session?.started_at]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#09090b]">
        <Loader2 className="w-8 h-8 text-[#3b82f6] animate-spin" />
      </div>
    );
  }

  const challenge = session?.challenges;

  return (
    <div className="h-screen flex flex-col bg-[#09090b]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-[#1e1e22]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#a78bfa] flex items-center justify-center">
            <span className="text-white text-sm font-bold">{'\u25B8'}</span>
          </div>
          <span className="text-[#fafafa] font-semibold">
            {challenge?.title || 'Coding Challenge'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[#a1a1aa]">
          <Clock className="w-4 h-4" />
          <span className="font-mono text-sm">{formatTime(elapsed)}</span>
          <span className="text-[#71717a] text-xs">/ {session?.duration_minutes || 45}m</span>
        </div>
      </header>

      {/* Challenge Brief */}
      {challenge?.description && (
        <div className="border-b border-[#1e1e22]">
          <button
            onClick={() => setShowBrief(!showBrief)}
            className="w-full flex items-center justify-between px-6 py-2 text-sm text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
          >
            <span>Challenge Brief</span>
            {showBrief ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showBrief && (
            <div className="px-6 pb-4 text-sm text-[#a1a1aa] max-h-48 overflow-y-auto whitespace-pre-wrap">
              {challenge.description}
            </div>
          )}
        </div>
      )}

      {/* Terminal */}
      <main className="flex-1 p-4 overflow-hidden">
        {sandboxReady ? (
          <Terminal sessionId={sessionId} />
        ) : (
          <div className="flex items-center justify-center h-full text-[#71717a]">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Setting up your environment...
          </div>
        )}
      </main>
    </div>
  );
}
