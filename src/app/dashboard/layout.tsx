'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, LogOut } from 'lucide-react';
import { ROLE_HOME, useAuth } from '@/context/AuthContext';
import { AICopilot } from '@/components/AICopilot';
import { Avatar, Badge } from '@/components/ui';
import { COMPANY } from '@/data/mock';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && !user) router.replace('/'); }, [user, loading, router]);
  if (loading || !user) return <div className="min-h-screen grid place-items-center text-slate-500">กำลังโหลด…</div>;

  return (
    <div className="min-h-screen bg-canvas">
      <header className="no-print sticky top-0 z-20 h-14 bg-white border-b border-line">
        <div className="mx-auto max-w-7xl h-full px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="h-6 w-6 text-brand shrink-0" /><span className="font-bold text-brand">SiamHR</span>
            <span className="hidden md:inline text-sm text-slate-500 truncate">· {COMPANY}</span>
          </div>
          <div className="flex items-center gap-3 min-w-0">
            <Badge tone="indigo">{ROLE_HOME[user.role]}</Badge>
            <div className="hidden sm:flex items-center gap-2 min-w-0"><Avatar name={user.displayName} /><span className="text-sm font-medium truncate max-w-[10rem]">{user.displayName}</span></div>
            <button onClick={async () => { await logout(); router.replace('/'); }} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-medium hover:bg-slate-50">
              <LogOut className="h-4 w-4" /> ออกจากระบบ
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-5 pb-24">{children}</main>
      <AICopilot />
    </div>
  );
}
