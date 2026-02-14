'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip, Loader2 } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { ToolResultCard } from './ToolResultCard';
import { FileUpload } from './FileUpload';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool_use' | 'tool_result';
  content: string;
  metadata?: Record<string, any>;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [setupId] = useState(() => crypto.randomUUID());
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleFileUploaded = useCallback((file: any) => {
    setUploadedFiles(prev => [...prev, file]);
    // Add a message about the upload
    const fileLabel = file.type === 'job_description' ? 'Job Description' : 'Resume';
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      role: 'user',
      content: `[Uploaded ${fileLabel}: ${file.name}]`,
      metadata: { file_id: file.id, file_type: file.type },
    }]);
    setShowFileUpload(false);
  }, []);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);

    // Prepare messages for API (only user + assistant + tool messages)
    const apiMessages = newMessages.map(m => ({
      role: m.role,
      content: m.content,
      metadata: m.metadata,
    }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, setupId }),
      });

      if (!response.ok) throw new Error('Failed to connect');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let assistantContent = '';
      let assistantId = crypto.randomUUID();
      let buffer = '';

      // Add placeholder assistant message
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr);

            switch (event.type) {
              case 'text':
                assistantContent += event.content;
                setMessages(prev =>
                  prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m)
                );
                break;

              case 'tool_use':
                // Add tool_use message
                setMessages(prev => [...prev, {
                  id: crypto.randomUUID(),
                  role: 'tool_use',
                  content: JSON.stringify(event.input),
                  metadata: { tool_name: event.tool, tool_use_id: event.tool_use_id },
                }]);
                break;

              case 'tool_result':
                // Add tool_result message
                setMessages(prev => [...prev, {
                  id: crypto.randomUUID(),
                  role: 'tool_result',
                  content: event.result,
                  metadata: { tool_name: event.tool, tool_use_id: event.tool_use_id },
                }]);
                // Reset assistant content for new response after tool
                assistantContent = '';
                assistantId = crypto.randomUUID();
                setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);
                break;

              case 'error':
                setMessages(prev => [...prev, {
                  id: crypto.randomUUID(),
                  role: 'assistant',
                  content: `Error: ${event.message}`,
                }]);
                break;
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }

      // Clean up empty assistant messages
      setMessages(prev => prev.filter(m => !(m.role === 'assistant' && !m.content.trim())));
    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Connection error: ${error.message}. Please try again.`,
      }]);
    } finally {
      setIsStreaming(false);
    }
  }, [input, messages, isStreaming, setupId]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  return (
    <div className="flex flex-col h-full bg-[#09090b]">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#a78bfa] flex items-center justify-center mb-4">
              <span className="text-white text-lg font-bold">{'\u25B8'}</span>
            </div>
            <h2 className="text-xl font-semibold text-[#fafafa] mb-2">Interview Architect</h2>
            <p className="text-[#71717a] text-sm max-w-md">
              I&apos;ll help you set up a customized coding interview. Upload a job description, share SDK docs, and I&apos;ll generate a tailored challenge with a custom evaluation rubric.
            </p>
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          {messages.map((msg) => {
            if (msg.role === 'tool_result') {
              return (
                <ToolResultCard
                  key={msg.id}
                  toolName={msg.metadata?.tool_name || ''}
                  result={msg.content}
                />
              );
            }
            if (msg.role === 'tool_use') {
              return null; // Tool use is shown via tool_result
            }
            return (
              <MessageBubble
                key={msg.id}
                role={msg.role as 'user' | 'assistant'}
                content={msg.content}
                isStreaming={isStreaming && msg === messages[messages.length - 1] && msg.role === 'assistant'}
              />
            );
          })}
        </div>
      </div>

      {/* File upload area */}
      {showFileUpload && (
        <div className="px-4 pb-2 max-w-3xl mx-auto w-full">
          <div className="grid grid-cols-2 gap-3">
            <FileUpload
              documentType="job_description"
              label="Drop Job Description PDF"
              onFileUploaded={handleFileUploaded}
            />
            <FileUpload
              documentType="resume"
              label="Drop Resume PDF"
              onFileUploaded={handleFileUploaded}
            />
          </div>
        </div>
      )}

      {/* Uploaded files badges */}
      {uploadedFiles.length > 0 && (
        <div className="px-4 pb-2 max-w-3xl mx-auto w-full flex gap-2 flex-wrap">
          {uploadedFiles.map(f => (
            <span key={f.id} className="text-[10px] px-2 py-1 rounded-md bg-[#18181b] border border-[#27272a] text-[#a1a1aa]">
              {f.type === 'job_description' ? 'JD' : 'Resume'}: {f.name}
            </span>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-[#1e1e22] px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-end gap-2">
          <button
            onClick={() => setShowFileUpload(!showFileUpload)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              showFileUpload ? 'bg-[#3b82f6]/20 text-[#3b82f6]' : 'text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#18181b]'
            )}
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the role, or upload files to get started..."
              rows={1}
              className="w-full resize-none rounded-xl bg-[#111114] border border-[#27272a] px-4 py-3 text-sm text-[#fafafa] placeholder:text-[#71717a] focus:outline-none focus:border-[#3b82f6]/50 transition-colors"
              disabled={isStreaming}
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming}
            className={cn(
              'p-2 rounded-lg transition-all',
              input.trim() && !isStreaming
                ? 'bg-[#3b82f6] text-white hover:bg-[#3b82f6]/90'
                : 'bg-[#18181b] text-[#71717a] cursor-not-allowed'
            )}
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
