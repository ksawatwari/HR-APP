'use client';
import { useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`bg-white border border-line rounded-xl shadow-card ${className}`}>{children}</div>
);
export const CardHeader = ({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) => (
  <div className="flex flex-wrap items-start justify-between gap-2 px-4 pt-4 pb-3 border-b border-line">
    <div><h3 className="font-semibold text-slate-900">{title}</h3>{sub && <p className="text-sm text-slate-500 mt-0.5">{sub}</p>}</div>{action}
  </div>
);
export const Section = ({ title, sub, action, children }: { title: string; sub?: string; action?: ReactNode; children: ReactNode }) => (
  <Card><CardHeader title={title} sub={sub} action={action} /><div className="p-4">{children}</div></Card>
);

export function Stat({ label, value, hint, icon: Icon, tone = 'blue' }: { label: string; value: string; hint?: string; icon?: LucideIcon; tone?: 'blue' | 'indigo' | 'green' | 'red' | 'amber' }) {
  const t = { blue: 'bg-blue-50 text-brand', indigo: 'bg-indigo-50 text-tech', green: 'bg-emerald-50 text-ok', red: 'bg-red-50 text-red-600', amber: 'bg-amber-50 text-amber-700' }[tone];
  return (
    <Card className="p-4 flex items-start gap-3">
      {Icon && <span className={`rounded-lg p-2.5 ${t}`}><Icon className="h-5 w-5" /></span>}
      <div className="min-w-0"><p className="text-sm text-slate-500">{label}</p><p className="text-2xl font-bold text-slate-900 break-words">{value}</p>{hint && <p className="text-xs text-slate-500 mt-0.5">{hint}</p>}</div>
    </Card>
  );
}

const tones: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200', red: 'bg-red-50 text-red-700 border-red-200', amber: 'bg-amber-50 text-amber-700 border-amber-200',
  blue: 'bg-blue-50 text-brand border-blue-200', slate: 'bg-slate-100 text-slate-700 border-slate-200', indigo: 'bg-indigo-50 text-tech border-indigo-200',
};
export const Badge = ({ children, tone = 'slate' }: { children: ReactNode; tone?: keyof typeof tones }) => (
  <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${tones[tone]}`}>{children}</span>
);
export const statusTone = (s: string) =>
  ['อนุมัติแล้ว', 'อนุมัติอัตโนมัติ', 'ลงนามแล้ว', 'ปกติ', 'โอนแล้ว', 'เปิดรับ'].includes(s) ? 'green' : ['ไม่อนุมัติ', 'สาย'].includes(s) ? 'red' : ['รออนุมัติ', 'รอลงนาม', 'ออกก่อน'].includes(s) ? 'amber' : 'slate';

export function Tabs({ tabs, children }: { tabs: { id: string; label: string; icon?: LucideIcon; badge?: number }[]; children: (id: string) => ReactNode }) {
  const [active, setActive] = useState(tabs[0].id);
  return (
    <div className="space-y-4">
      <div role="tablist" className="scroll-x border-b border-line -mx-4 px-4 sm:mx-0 sm:px-0 bg-canvas sticky top-14 z-10">
        {tabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={active === t.id} onClick={() => setActive(t.id)}
            className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px ${active === t.id ? 'border-brand text-brand' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>
            {t.icon && <t.icon className="h-4 w-4" />}{t.label}
            {!!t.badge && <span className="rounded-full bg-red-600 text-white text-xs px-1.5 min-w-[1.25rem] text-center">{t.badge}</span>}
          </button>
        ))}
      </div>
      {children(active)}
    </div>
  );
}

export const Table = ({ head, children }: { head: string[]; children: ReactNode }) => (
  <div className="overflow-x-auto -mx-4 sm:mx-0">
    <table className="w-full text-sm min-w-[560px]">
      <thead><tr className="text-left text-slate-500 border-b border-line">{head.map((h) => <th key={h} className="px-4 py-2 font-medium whitespace-nowrap">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-line">{children}</tbody>
    </table>
  </div>
);
export const Td = ({ children, className = '' }: { children: ReactNode; className?: string }) => <td className={`px-4 py-2.5 align-middle ${className}`}>{children}</td>;

export const Btn = ({ children, onClick, variant = 'primary', disabled, className = '', type = 'button' }:
  { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost' | 'success' | 'danger' | 'indigo'; disabled?: boolean; className?: string; type?: 'button' | 'submit' }) => {
  const v = { primary: 'bg-brand text-white hover:bg-blue-900', indigo: 'bg-tech text-white hover:bg-indigo-700', success: 'bg-ok text-white hover:bg-emerald-700', danger: 'bg-white text-red-700 border border-red-200 hover:bg-red-50', ghost: 'bg-white text-slate-700 border border-line hover:bg-slate-50' }[variant];
  return <button type={type} disabled={disabled} onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${v} ${className}`}>{children}</button>;
};

export const Progress = ({ value, tone = 'bg-tech' }: { value: number; tone?: string }) => (
  <div className="h-2 rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><div className={`h-full ${tone}`} style={{ width: `${Math.min(100, value)}%` }} /></div>
);
export const Avatar = ({ name, size = 'h-9 w-9' }: { name: string; size?: string }) => {
  const colors = ['bg-blue-100 text-brand', 'bg-indigo-100 text-tech', 'bg-emerald-100 text-ok', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700'];
  const c = colors[name.charCodeAt(0) % colors.length];
  return <span className={`${size} ${c} rounded-full inline-flex items-center justify-center font-semibold shrink-0`}>{name.slice(0, 1)}</span>;
};
export const inputCls = 'w-full rounded-lg border border-line px-3 py-2 text-sm bg-white focus:border-tech focus:outline-none';
export const Field = ({ label, children }: { label: string; children: ReactNode }) => <label className="block text-sm font-medium text-slate-700">{label}<div className="mt-1 font-normal">{children}</div></label>;
