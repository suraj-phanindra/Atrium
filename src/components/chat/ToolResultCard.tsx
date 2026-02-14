'use client';

import { FileText, Globe, Code, ListChecks, Rocket, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolResultCardProps {
  toolName: string;
  result: string;
  input?: any;
}

export function ToolResultCard({ toolName, result, input }: ToolResultCardProps) {
  let parsed: any = {};
  try {
    parsed = JSON.parse(result);
  } catch {
    parsed = { raw: result };
  }

  const isSuccess = parsed.success !== false;

  const configs: Record<string, { icon: any; label: string; color: string }> = {
    fetch_sdk_docs: { icon: Globe, label: 'SDK Docs Fetched', color: '#3b82f6' },
    parse_uploaded_pdf: { icon: FileText, label: 'PDF Extracted', color: '#a78bfa' },
    generate_challenge: { icon: Code, label: 'Challenge Generated', color: '#34d399' },
    set_evaluation_rubric: { icon: ListChecks, label: 'Rubric Created', color: '#fb923c' },
    create_session: { icon: Rocket, label: 'Session Created', color: '#f472b6' },
  };

  const config = configs[toolName] || { icon: CheckCircle2, label: toolName, color: '#71717a' };
  const Icon = config.icon;

  return (
    <div className="flex justify-start mb-4">
      <div className={cn(
        'max-w-[80%] rounded-xl border px-4 py-3',
        isSuccess ? 'border-[#27272a] bg-[#111114]' : 'border-red-500/30 bg-red-500/5'
      )}>
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ backgroundColor: `${config.color}20` }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
          </div>
          <span className="text-xs font-medium" style={{ color: config.color }}>
            {config.label}
          </span>
          {!isSuccess && <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
        </div>

        <div className="text-xs text-[#a1a1aa] space-y-1">
          {toolName === 'fetch_sdk_docs' && isSuccess && (
            <>
              <p>Fetched from: <span className="text-[#fafafa] font-mono text-[11px]">{parsed.url}</span></p>
              <p>{parsed.chars?.toLocaleString()} characters extracted</p>
            </>
          )}

          {toolName === 'parse_uploaded_pdf' && isSuccess && (
            <>
              <p>Document type: <span className="capitalize text-[#fafafa]">{parsed.document_type?.replace('_', ' ')}</span></p>
              <p>{parsed.chars?.toLocaleString()} characters extracted</p>
            </>
          )}

          {toolName === 'generate_challenge' && isSuccess && (
            <>
              <p className="text-[#fafafa] font-medium">{parsed.title}</p>
              <p>{parsed.description?.substring(0, 150)}...</p>
              <div className="flex gap-3 mt-1">
                <span className="text-[#a78bfa]">{parsed.file_count} files</span>
                <span className="text-[#fb923c]">{parsed.bug_count} bugs</span>
              </div>
              {parsed.files && (
                <div className="mt-2 font-mono text-[10px] text-[#71717a]">
                  {parsed.files.map((f: string) => <div key={f}>{f}</div>)}
                </div>
              )}
            </>
          )}

          {toolName === 'set_evaluation_rubric' && isSuccess && (
            <>
              <p>{parsed.criteria_count} criteria defined</p>
              <div className="mt-1 space-y-0.5">
                {parsed.criteria?.map((c: any) => (
                  <div key={c.name} className="flex justify-between">
                    <span className="text-[#fafafa]">{c.name}</span>
                    <span className="font-mono text-[#fb923c]">{c.weight}%</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {toolName === 'create_session' && isSuccess && (
            <>
              <p className="text-[#34d399] font-medium">Session ready!</p>
              <div className="mt-2 space-y-2">
                <div>
                  <p className="text-[10px] text-[#71717a] uppercase tracking-wide mb-1">Candidate Link</p>
                  <a
                    href={parsed.candidate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#3b82f6] hover:underline font-mono text-[11px] break-all"
                  >
                    {parsed.candidate_url}
                  </a>
                </div>
                <div>
                  <p className="text-[10px] text-[#71717a] uppercase tracking-wide mb-1">Dashboard</p>
                  <a
                    href={parsed.dashboard_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#f472b6] hover:underline font-mono text-[11px] break-all"
                  >
                    {parsed.dashboard_url}
                  </a>
                </div>
              </div>
            </>
          )}

          {!isSuccess && <p className="text-red-400">{parsed.error || 'An error occurred'}</p>}
        </div>
      </div>
    </div>
  );
}
