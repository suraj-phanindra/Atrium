'use client';

import { useState, useMemo } from 'react';
import { File, FileCode, FolderOpen, FolderClosed, RotateCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileNode {
  name: string;
  path: string;
  isDir: boolean;
  children: FileNode[];
}

function buildFileTree(paths: string[]): FileNode[] {
  const root: FileNode = { name: '', path: '', isDir: true, children: [] };

  for (const filePath of paths) {
    const parts = filePath.split('/');
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const partPath = parts.slice(0, i + 1).join('/');

      let child = current.children.find((c) => c.name === part);
      if (!child) {
        child = { name: part, path: partPath, isDir: !isLast, children: [] };
        current.children.push(child);
      }
      current = child;
    }
  }

  const sort = (nodes: FileNode[]): FileNode[] =>
    nodes
      .map((n) => ({ ...n, children: sort(n.children) }))
      .sort((a, b) => {
        if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

  return sort(root.children);
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (['ts', 'tsx', 'js', 'jsx', 'py', 'rs', 'go'].includes(ext || '')) {
    return <FileCode className="w-3.5 h-3.5 flex-shrink-0" />;
  }
  return <File className="w-3.5 h-3.5 flex-shrink-0" />;
}

interface FileExplorerProps {
  files: string[];
  loading: boolean;
  activeFile: string | null;
  openFiles: string[];
  onSelectFile: (path: string) => void;
  onRefresh: () => void;
}

export default function FileExplorer({ files, loading, activeFile, openFiles, onSelectFile, onRefresh }: FileExplorerProps) {
  const tree = useMemo(() => buildFileTree(files), [files]);

  return (
    <div className="h-full flex flex-col bg-[#111114] select-none">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e1e22]">
        <span className="text-[10px] text-[#71717a] uppercase tracking-wider font-semibold">Explorer</span>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-[#71717a] hover:text-[#fafafa] transition-colors p-0.5"
          title="Refresh"
        >
          <RotateCw className={cn('w-3 h-3', loading && 'animate-spin')} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {loading && files.length === 0 ? (
          <div className="flex items-center gap-1.5 px-3 py-2 text-xs text-[#52525b]">
            <Loader2 className="w-3 h-3 animate-spin" /> Loading...
          </div>
        ) : files.length === 0 ? (
          <div className="px-3 py-2 text-xs text-[#52525b]">No files</div>
        ) : (
          tree.map((node) => (
            <TreeNode
              key={node.path}
              node={node}
              depth={0}
              activeFile={activeFile}
              openFiles={openFiles}
              onSelectFile={onSelectFile}
            />
          ))
        )}
      </div>
    </div>
  );
}

function TreeNode({
  node,
  depth,
  activeFile,
  openFiles,
  onSelectFile,
}: {
  node: FileNode;
  depth: number;
  activeFile: string | null;
  openFiles: string[];
  onSelectFile: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isActive = activeFile === node.path;
  const isOpen = openFiles.includes(node.path);

  if (node.isDir) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-1 px-2 py-[3px] text-xs text-[#a1a1aa] hover:bg-[#18181b] transition-colors"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {expanded ? (
            <FolderOpen className="w-3.5 h-3.5 text-[#3b82f6] flex-shrink-0" />
          ) : (
            <FolderClosed className="w-3.5 h-3.5 text-[#3b82f6] flex-shrink-0" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {expanded &&
          node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              activeFile={activeFile}
              openFiles={openFiles}
              onSelectFile={onSelectFile}
            />
          ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => onSelectFile(node.path)}
      className={cn(
        'w-full flex items-center gap-1 px-2 py-[3px] text-xs transition-colors',
        isActive
          ? 'bg-[#18181b] text-[#fafafa]'
          : isOpen
            ? 'text-[#d4d4d8] hover:bg-[#18181b]'
            : 'text-[#a1a1aa] hover:bg-[#18181b]'
      )}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
    >
      {getFileIcon(node.name)}
      <span className="truncate">{node.name}</span>
    </button>
  );
}
