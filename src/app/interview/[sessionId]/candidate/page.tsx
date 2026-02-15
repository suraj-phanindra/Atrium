'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Panel, Group, Separator, usePanelRef, type PanelImperativeHandle } from 'react-resizable-panels';
import { Clock, Loader2, Square, TerminalSquare, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import FileExplorer from '@/components/ide/FileExplorer';
import TabBar from '@/components/ide/TabBar';
import EditorArea from '@/components/ide/EditorArea';
import TerminalPanel from '@/components/ide/TerminalPanel';
import StatusBar from '@/components/ide/StatusBar';

export default function CandidatePage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  // Session state
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [sandboxReady, setSandboxReady] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);

  // File explorer
  const [fileList, setFileList] = useState<string[]>([]);
  const [fileListLoading, setFileListLoading] = useState(false);

  // Multi-tab editor state
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [tabContents, setTabContents] = useState<Record<string, string>>({});
  const [tabEdited, setTabEdited] = useState<Record<string, string>>({});
  const [tabDirty, setTabDirty] = useState<Record<string, boolean>>({});
  const [fileLoading, setFileLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Terminal panel
  const terminalPanelRef = usePanelRef();
  const [terminalVisible, setTerminalVisible] = useState(true);

  // -- File operations --

  const fetchFileList = useCallback(async () => {
    if (!sandboxReady) return;
    setFileListLoading(true);
    try {
      const res = await fetch(`/api/sandbox/files?session_id=${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setFileList(data.files || []);
      }
    } catch (err) {
      console.error('Failed to fetch file list:', err);
    } finally {
      setFileListLoading(false);
    }
  }, [sessionId, sandboxReady]);

  const fetchFileContent = useCallback(async (path: string) => {
    setFileLoading(true);
    try {
      const res = await fetch(`/api/sandbox/files?session_id=${sessionId}&path=${encodeURIComponent(path)}`);
      if (res.ok) {
        const data = await res.json();
        setTabContents((prev) => ({ ...prev, [path]: data.content }));
        setTabEdited((prev) => ({ ...prev, [path]: data.content }));
        setTabDirty((prev) => ({ ...prev, [path]: false }));
      }
    } catch (err) {
      console.error('Failed to fetch file:', err);
    } finally {
      setFileLoading(false);
    }
  }, [sessionId]);

  const openFile = useCallback((path: string) => {
    setOpenTabs((prev) => (prev.includes(path) ? prev : [...prev, path]));
    setActiveTab(path);
    if (!(path in tabContents) && path !== '__CHALLENGE.md') {
      fetchFileContent(path);
    }
  }, [tabContents, fetchFileContent]);

  const closeTab = useCallback((path: string) => {
    if (tabDirty[path]) {
      if (!window.confirm('Unsaved changes will be lost. Close anyway?')) return;
    }
    setOpenTabs((prev) => {
      const next = prev.filter((p) => p !== path);
      if (activeTab === path) {
        const idx = prev.indexOf(path);
        const newActive = next[Math.min(idx, next.length - 1)] || null;
        setActiveTab(newActive);
      }
      return next;
    });
    setTabContents((prev) => { const n = { ...prev }; delete n[path]; return n; });
    setTabEdited((prev) => { const n = { ...prev }; delete n[path]; return n; });
    setTabDirty((prev) => { const n = { ...prev }; delete n[path]; return n; });
  }, [activeTab, tabDirty]);

  const handleEditorChange = useCallback((value: string) => {
    if (!activeTab) return;
    setTabEdited((prev) => ({ ...prev, [activeTab]: value }));
    setTabDirty((prev) => ({ ...prev, [activeTab]: value !== tabContents[activeTab] }));
  }, [activeTab, tabContents]);

  const saveFile = useCallback(async () => {
    if (!activeTab || !tabDirty[activeTab] || activeTab === '__CHALLENGE.md') return;
    setSaving(true);
    try {
      const res = await fetch('/api/sandbox/files', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, path: activeTab, content: tabEdited[activeTab] }),
      });
      if (res.ok) {
        setTabContents((prev) => ({ ...prev, [activeTab]: tabEdited[activeTab] }));
        setTabDirty((prev) => ({ ...prev, [activeTab]: false }));
      }
    } catch (err) {
      console.error('Failed to save file:', err);
    } finally {
      setSaving(false);
    }
  }, [sessionId, activeTab, tabDirty, tabEdited]);

  const toggleTerminal = useCallback(() => {
    const panel = terminalPanelRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) {
      panel.expand();
    } else {
      panel.collapse();
    }
  }, [terminalPanelRef]);

  const handleTerminalResize = useCallback(({ asPercentage }: { asPercentage: number; inPixels: number }) => {
    setTerminalVisible(asPercentage > 0);
  }, []);

  const openChallengeBrief = useCallback(() => {
    const path = '__CHALLENGE.md';
    if (!openTabs.includes(path)) {
      setOpenTabs((prev) => [path, ...prev]);
    }
    setActiveTab(path);
  }, [openTabs]);

  // -- Keyboard shortcut: Ctrl+S --
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && activeTab && tabDirty[activeTab]) {
        e.preventDefault();
        saveFile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveFile, activeTab, tabDirty]);

  // -- Auto-fetch file list when sandbox ready --
  useEffect(() => {
    if (sandboxReady) fetchFileList();
  }, [sandboxReady, fetchFileList]);

  // -- Load session + create sandbox --
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/sessions?id=${sessionId}`);
        const data = await res.json();
        setSession(data);

        if (data.status === 'pending') {
          const sandboxRes = await fetch('/api/sandbox/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: sessionId }),
          });
          if (sandboxRes.ok) {
            setSandboxReady(true);
            const updatedRes = await fetch(`/api/sessions?id=${sessionId}`);
            const updated = await updatedRes.json();
            setSession(updated);
          }
        } else {
          setSandboxReady(true);
        }

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

  // -- Open challenge brief as first tab --
  useEffect(() => {
    if (!session?.challenges?.description) return;
    const path = '__CHALLENGE.md';
    setTabContents((prev) => ({ ...prev, [path]: session.challenges.description }));
    setTabEdited((prev) => ({ ...prev, [path]: session.challenges.description }));
    setTabDirty((prev) => ({ ...prev, [path]: false }));
    if (!openTabs.includes(path)) {
      setOpenTabs((prev) => prev.includes(path) ? prev : [path, ...prev]);
      setActiveTab(path);
    }
  }, [session?.challenges?.description]); // eslint-disable-line react-hooks/exhaustive-deps

  // -- Timer --
  useEffect(() => {
    if (!session?.started_at) return;
    const start = new Date(session.started_at).getTime();
    if (sessionEnded && session.ended_at) {
      setElapsed(Math.floor((new Date(session.ended_at).getTime() - start) / 1000));
      return;
    }
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [session?.started_at, session?.ended_at, sessionEnded]);

  // -- Realtime: session end + file changes --
  useEffect(() => {
    const supabase = createClient();

    const sessionChannel = supabase
      .channel(`session-status:${sessionId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'sessions',
        filter: `id=eq.${sessionId}`,
      }, (payload: any) => {
        if (payload.new.status === 'completed') {
          setSessionEnded(true);
        }
      })
      .subscribe();

    const eventsChannel = supabase
      .channel(`file-changes:${sessionId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'events',
        filter: `session_id=eq.${sessionId}`,
      }, (payload: any) => {
        if (payload.new.event_type === 'file_change') {
          setTimeout(() => {
            fetchFileList();
            const changedName = payload.new.metadata?.name;
            if (changedName) {
              setOpenTabs((tabs) => {
                tabs.forEach((tabPath) => {
                  if (tabPath.endsWith(changedName)) {
                    setTabDirty((d) => {
                      if (!d[tabPath]) fetchFileContent(tabPath);
                      return d;
                    });
                  }
                });
                return tabs;
              });
            }
          }, 300);
        }
      })
      .subscribe();

    return () => {
      sessionChannel.unsubscribe();
      eventsChannel.unsubscribe();
    };
  }, [sessionId, fetchFileList, fetchFileContent]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // Current tab data
  const currentContent = activeTab ? (tabEdited[activeTab] ?? '') : '';
  const currentDirty = activeTab ? (tabDirty[activeTab] ?? false) : false;
  const isReadOnly = activeTab === '__CHALLENGE.md';
  const tabs = openTabs.map((path) => ({ path, dirty: tabDirty[path] ?? false }));

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#09090b]">
        <Loader2 className="w-8 h-8 text-[#3b82f6] animate-spin" />
      </div>
    );
  }

  const challenge = session?.challenges;

  return (
    <div className="h-screen flex flex-col bg-[#09090b] relative">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-[#1e1e22] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#a78bfa] flex items-center justify-center">
            <span className="text-white text-xs font-bold">{'\u25B8'}</span>
          </div>
          <span className="text-[#fafafa] font-semibold text-sm">
            {challenge?.title || 'Coding Challenge'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTerminal}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border transition-colors',
              terminalVisible
                ? 'bg-[#f97316]/10 border-[#f97316]/30 text-[#f97316]'
                : 'bg-[#18181b] border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa]'
            )}
          >
            <TerminalSquare className="w-3.5 h-3.5" />
            Terminal
          </button>
          {challenge?.description && (
            <button
              onClick={openChallengeBrief}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border transition-colors',
                activeTab === '__CHALLENGE.md'
                  ? 'bg-[#3b82f6]/10 border-[#3b82f6]/30 text-[#3b82f6]'
                  : 'bg-[#18181b] border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa]'
              )}
            >
              <FileText className="w-3.5 h-3.5" />
              Brief
            </button>
          )}
          <div className="flex items-center gap-2 text-[#a1a1aa] ml-2">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono text-xs">{formatTime(elapsed)}</span>
            <span className="text-[#71717a] text-[10px]">/ {session?.duration_minutes || 45}m</span>
          </div>
        </div>
      </header>

      {/* IDE Layout */}
      <Group orientation="vertical" className="flex-1 min-h-0">
        <Panel defaultSize={70} minSize={30}>
          <Group orientation="horizontal">
            <Panel defaultSize={18} minSize={10} maxSize={30} collapsible>
              <FileExplorer
                files={fileList}
                loading={fileListLoading}
                activeFile={activeTab}
                openFiles={openTabs}
                onSelectFile={openFile}
                onRefresh={fetchFileList}
              />
            </Panel>
            <Separator className="w-[3px] bg-[#1e1e22] hover:bg-[#3b82f6]/50 transition-colors" />
            <Panel defaultSize={82}>
              <div className="flex flex-col h-full">
                <TabBar
                  tabs={tabs}
                  activeTab={activeTab}
                  onSelectTab={setActiveTab}
                  onCloseTab={closeTab}
                />
                <EditorArea
                  activeTab={activeTab}
                  content={currentContent}
                  loading={fileLoading && activeTab !== '__CHALLENGE.md'}
                  readOnly={isReadOnly}
                  onChange={handleEditorChange}
                />
              </div>
            </Panel>
          </Group>
        </Panel>
        <Separator className="h-[3px] bg-[#1e1e22] hover:bg-[#3b82f6]/50 transition-colors" />
        <Panel
          panelRef={terminalPanelRef}
          defaultSize={30}
          minSize={15}
          collapsible
          onResize={handleTerminalResize}
        >
          <TerminalPanel sessionId={sessionId} sandboxReady={sandboxReady} />
        </Panel>
      </Group>

      <StatusBar activeFile={activeTab} dirty={currentDirty} saving={saving} />

      {/* Session ended overlay */}
      {sessionEnded && (
        <div className="absolute inset-0 z-50 bg-[#09090b]/90 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#3b82f6]/20 flex items-center justify-center mx-auto mb-4">
              <Square className="w-7 h-7 text-[#3b82f6]" />
            </div>
            <h2 className="text-xl font-semibold text-[#fafafa] mb-2">Interview Ended</h2>
            <p className="text-[#a1a1aa] text-sm max-w-md">
              This interview session was ended by the interviewer. If you believe this is an error, please contact them.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
