'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Clock, Users, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Session {
  id: string;
  candidate_name: string | null;
  status: 'pending' | 'active' | 'completed';
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
  duration_minutes: number;
  challenge_id: string | null;
}

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sessions')
      .then(res => res.json())
      .then(data => {
        setSessions(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/20';
      case 'completed': return 'text-[#3b82f6] bg-[#3b82f6]/10 border-[#3b82f6]/20';
      default: return 'text-[#71717a] bg-[#71717a]/10 border-[#71717a]/20';
    }
  };

  const getSessionLink = (s: Session) => {
    if (s.status === 'active') return `/interview/${s.id}/dashboard`;
    if (s.status === 'completed') return `/interview/${s.id}/dashboard`;
    return `/interview/${s.id}/candidate`;
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getDuration = (s: Session) => {
    if (!s.started_at) return '-';
    const start = new Date(s.started_at).getTime();
    const end = s.ended_at ? new Date(s.ended_at).getTime() : Date.now();
    const mins = Math.floor((end - start) / 60000);
    return `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-[#09090b]">
      <nav className="flex items-center justify-between px-6 py-3 border-b border-[#1e1e22]">
        <div className="flex items-center gap-2.5">
          <Image src="/atrium-logo.png" alt="Atrium" width={32} height={32} className="rounded-lg" />
          <span className="text-[#fafafa] font-semibold tracking-tight">Atrium</span>
        </div>
        <button
          onClick={() => router.push('/interview/setup')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-[#3b82f6] text-white hover:bg-[#3b82f6]/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Interview
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-[#fafafa]">Sessions</h1>
          <span className="text-xs text-[#71717a]">{sessions.length} total</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[#71717a]">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-8 h-8 text-[#71717a] mx-auto mb-3" />
            <p className="text-[#71717a] text-sm">No sessions yet</p>
            <button
              onClick={() => router.push('/interview/setup')}
              className="mt-4 px-4 py-2 rounded-lg text-sm bg-[#3b82f6] text-white hover:bg-[#3b82f6]/90 transition-colors"
            >
              Start your first interview
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map(s => (
              <button
                key={s.id}
                onClick={() => router.push(getSessionLink(s))}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-[#27272a] bg-[#111114] hover:border-[#3b82f6]/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <span className={cn('text-[10px] uppercase font-semibold px-2 py-0.5 rounded border', getStatusColor(s.status))}>
                    {s.status}
                  </span>
                  <div className="text-left">
                    <p className="text-sm text-[#fafafa]">{s.candidate_name || 'Unknown Candidate'}</p>
                    <p className="text-[10px] text-[#71717a] font-mono">{s.id.slice(0, 8)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5 text-[#71717a]">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{getDuration(s)}</span>
                  </div>
                  <span className="text-xs text-[#71717a]">{formatDate(s.created_at)}</span>
                  <ArrowRight className="w-4 h-4 text-[#52525b] group-hover:text-[#3b82f6] transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
