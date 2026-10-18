'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, LogOut, RotateCcw } from 'lucide-react';
import { ROLE_HOME, useAuth } from '@/context/AuthContext';
import { useHRData } from '@/context/HRDataContext';
import { AICopilot } from '@/components/AICopilot';
import { Avatar, Badge } from '@/components/ui';
import { COMPANY } from '@/data/mock';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const { resetAll } = useHRData();
  const router = useRouter();
  const [toast, setToast] = useState(false);
  useEffect(() => { if (!loading && !user) router.replace('/'); }, [user, loading, router]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(false), 2200); return () => clearTimeout(t); }, [toast]);
  if (loading || !user) return <div className="min-h-screen grid place-items-center text-slate-500">กำลังโหลด…</div>;

  return (
    <div className="min-h-screen bg-canvas">
      <header className="no-print sticky top-0 z-20 h-14 bg-white border-b border-line">
        <div className="mx-auto max-w-7xl h-full px-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="h-6 w-6 text-brand shrink-0" /><span className="font-bold text-brand">SiamHR</span>
            <span className="hidden md:inline text-sm text-slate-500 truncate">· {COMPANY}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Badge tone="indigo">{ROLE_HOME[user.role]}</Badge>
            <div className="hidden lg:flex items-center gap-2 min-w-0"><Avatar name={user.displayName} /><span className="text-sm font-medium truncate max-w-[10rem]">{user.displayName}</span></div>
            <button onClick={() => { resetAll(); setToast(true); }} title="คืนข้อมูลทั้งหมดเป็นค่าเริ่มต้น" className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 px-3 py-1.5 text-sm font-medium hover:bg-amber-100">
              <RotateCcw className="h-4 w-4" /> <span className="hidden sm:inline">รีเซ็ตข้อมูล</span>
            </button>
            <button onClick={async () => { await logout(); router.replace('/'); }} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-medium hover:bg-slate-50">
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-5 pb-24">{children}</main>
      {toast && <div role="status" className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-slate-900 text-white text-sm px-4 py-2 shadow-lg">รีเซ็ตข้อมูลเป็นค่าเริ่มต้นแล้ว</div>}
      <AICopilot />
    </div>
  );
}
