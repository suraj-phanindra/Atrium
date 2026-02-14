'use client';

import { useCallback, useState } from 'react';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileUploaded: (file: { id: string; name: string; type: 'job_description' | 'resume'; size: number }) => void;
  documentType: 'job_description' | 'resume';
  label: string;
}

export function FileUpload({ onFileUploaded, documentType, label }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(async (file: File) => {
    if (!file.name.endsWith('.pdf')) {
      setError('Only PDF files are accepted');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setUploadedFile({ name: file.name, id: data.file_id });
      onFileUploaded({
        id: data.file_id,
        name: file.name,
        type: documentType,
        size: file.size,
      });
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [documentType, onFileUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  if (uploadedFile) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#18181b] border border-[#27272a]">
        <FileText className="w-4 h-4 text-[#3b82f6]" />
        <span className="text-sm text-[#fafafa] truncate flex-1">{uploadedFile.name}</span>
        <button
          onClick={() => setUploadedFile(null)}
          className="text-[#71717a] hover:text-[#fafafa] transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'relative flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed transition-all cursor-pointer',
        isDragging
          ? 'border-[#3b82f6] bg-[#3b82f6]/10'
          : 'border-[#27272a] bg-[#111114] hover:border-[#3b82f6]/50'
      )}
    >
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      {isUploading ? (
        <Loader2 className="w-5 h-5 text-[#3b82f6] animate-spin" />
      ) : (
        <Upload className="w-5 h-5 text-[#71717a]" />
      )}
      <span className="text-xs text-[#71717a]">{label}</span>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
