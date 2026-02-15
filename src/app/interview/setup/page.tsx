import { ChatInterface } from '@/components/chat';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SetupPage() {
  return (
    <div className="h-screen flex flex-col bg-[#09090b]">
      <header className="flex items-center justify-between px-6 py-3 border-b border-[#1e1e22]">
        <div className="flex items-center gap-3">
          <Link href="/sessions">
            <Image src="/atrium-logo.png" alt="Atrium" width={32} height={32} className="rounded-lg" />
          </Link>
          <Link href="/sessions" className="text-[#fafafa] font-semibold hover:text-[#a1a1aa] transition-colors">
            Atrium
          </Link>
          <span className="text-[#71717a] text-sm">/ Design your interview</span>
        </div>
        <Link
          href="/sessions"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border bg-[#18181b] border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All Sessions
        </Link>
      </header>
      <main className="flex-1 overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  );
}
