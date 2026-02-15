'use client';

import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function TopNav() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', active: pathname.includes('/dashboard') },
    { label: 'Sessions', href: '/sessions', active: pathname === '/sessions' },
  ];

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-[#1e1e22] animate-fade-in">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push('/sessions')}>
          <Image src="/atrium-logo.png" alt="Atrium" width={32} height={32} className="rounded-lg" />
          <span className="text-[#fafafa] font-semibold tracking-tight">Atrium</span>
        </div>
        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => item.href && router.push(item.href)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm transition-colors',
                item.active ? 'bg-[#1e1e22] text-[#fafafa]' : 'text-[#71717a] hover:text-[#a1a1aa]'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/interview/setup')}
          className="px-3 py-1.5 rounded-lg text-xs bg-[#3b82f6] text-white hover:bg-[#3b82f6]/90 transition-colors"
        >
          New Interview
        </button>
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#a78bfa] flex items-center justify-center text-white text-xs font-medium">
          S
        </div>
      </div>
    </nav>
  );
}
