'use client';

import { FileCode, Loader2 } from 'lucide-react';
import CodeEditor from '@/components/editor/CodeEditor';

interface EditorAreaProps {
  activeTab: string | null;
  content: string;
  loading: boolean;
  readOnly?: boolean;
  onChange: (value: string) => void;
}

export default function EditorArea({ activeTab, content, loading, readOnly, onChange }: EditorAreaProps) {
  if (!activeTab) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[#52525b] gap-3">
        <FileCode className="w-10 h-10 opacity-30" />
        <p className="text-sm">Select a file from the explorer</p>
        <p className="text-xs text-[#3f3f46]">or open a file tab to start editing</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#52525b] text-xs">
        <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> Loading file...
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0">
      <CodeEditor path={activeTab} content={content} onChange={onChange} readOnly={readOnly} />
    </div>
  );
}
