'use client';

const EXT_TO_LANG: Record<string, string> = {
  ts: 'TypeScript', tsx: 'TypeScript React', js: 'JavaScript', jsx: 'JavaScript React',
  json: 'JSON', md: 'Markdown', py: 'Python', rs: 'Rust', go: 'Go',
  html: 'HTML', css: 'CSS', scss: 'SCSS', yaml: 'YAML', yml: 'YAML',
  toml: 'TOML', sql: 'SQL', sh: 'Shell', xml: 'XML', svg: 'SVG',
};

function getLang(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  return EXT_TO_LANG[ext] || 'Plain Text';
}

interface StatusBarProps {
  activeFile: string | null;
  dirty: boolean;
  saving: boolean;
}

export default function StatusBar({ activeFile, dirty, saving }: StatusBarProps) {
  return (
    <div className="flex items-center justify-between px-3 h-6 bg-[#111114] border-t border-[#1e1e22] text-[10px] text-[#71717a] flex-shrink-0 select-none">
      <div className="flex items-center gap-3">
        {activeFile && <span>{getLang(activeFile)}</span>}
        {activeFile && <span className="text-[#3f3f46]">{activeFile}</span>}
      </div>
      <div className="flex items-center gap-3">
        {activeFile && (
          <span>{saving ? 'Saving...' : dirty ? 'Modified' : 'Saved'}</span>
        )}
        <span>Ctrl+S</span>
      </div>
    </div>
  );
}
