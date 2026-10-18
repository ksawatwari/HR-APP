'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Eye, EyeOff, LogIn, ShieldCheck, Users, Briefcase, Crown, UserRound } from 'lucide-react';
import { useAuth, COMPANY_DOMAIN, DEMO_PASSWORD } from '@/context/AuthContext';
import { isFirebaseConfigured } from '@/lib/firebase';

const demos = [
  { email: `employee@${COMPANY_DOMAIN}`, label: 'พนักงาน', sub: 'นภัสสร วงศ์สวัสดิ์', icon: UserRound, tone: 'bg-blue-50 text-brand border-blue-200' },
  { email: `manager@${COMPANY_DOMAIN}`, label: 'ผู้จัดการ', sub: 'วิชัย ศรีสุวรรณ', icon: Briefcase, tone: 'bg-indigo-50 text-tech border-indigo-200' },
  { email: `hr@${COMPANY_DOMAIN}`, label: 'ฝ่ายบุคคล (HR)', sub: 'ปราณี มีสุข', icon: Users, tone: 'bg-emerald-50 text-ok border-emerald-200' },
  { email: `ceo@${COMPANY_DOMAIN}`, label: 'ผู้บริหาร (CEO)', sub: 'ธนพล เจริญกิจ', icon: Crown, tone: 'bg-amber-50 text-amber-700 border-amber-200' },
];

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && user) router.replace('/dashboard'); }, [user, loading, router]);

  async function submit(e?: React.FormEvent, em = email, pw = password) {
    e?.preventDefault();
    setBusy(true); setError('');
    const r = await login(em, pw);
    setBusy(false);
    if (!r.ok) setError(r.error ?? 'เข้าสู่ระบบไม่สำเร็จ');
  }

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-white">
      <section className="hidden lg:flex flex-col justify-between bg-brand text-white p-12">
        <div className="flex items-center gap-3 text-2xl font-bold"><Building2 className="h-8 w-8" /> SiamHR</div>
        <div className="max-w-md space-y-5">
          <h1 className="text-4xl font-bold leading-snug">บริหารคน เงินเดือน และข้อมูลองค์กร ในที่เดียว</h1>
          <p className="text-blue-100 leading-relaxed">ลงเวลาด้วย GPS · คำนวณเงินเดือนและภาษีอัตโนมัติ · อนุมัติลาอัจฉริยะ · ผู้ช่วย AI ที่เข้าใจกฎหมายแรงงานไทย</p>
        </div>
        <p className="text-sm text-blue-200">© 2569 บริษัท สยามดิจิทัล จำกัด</p>
      </section>

      <section className="flex items-center justify-center p-5 sm:p-10 bg-canvas">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex items-center gap-2 text-2xl font-bold text-brand"><Building2 className="h-7 w-7" /> SiamHR</div>
          <div>
            <h2 className="text-2xl font-bold">เข้าสู่ระบบ</h2>
            <p className="text-slate-500 mt-1 text-sm">ใช้อีเมลองค์กร @{COMPANY_DOMAIN} ระบบจะพาคุณไปยังพอร์ทัลที่ตรงกับบทบาทโดยอัตโนมัติ</p>
          </div>

          <form onSubmit={submit} className="bg-white border border-line rounded-xl shadow-card p-5 space-y-4">
            <label className="block text-sm font-medium">อีเมล
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={`ชื่อ@${COMPANY_DOMAIN}`} autoComplete="username"
                className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 text-base focus:border-tech focus:outline-none" />
            </label>
            <label className="block text-sm font-medium">รหัสผ่าน
              <div className="relative mt-1">
                <input type={show ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
                  className="w-full rounded-lg border border-line px-3 py-2.5 pr-11 text-base focus:border-tech focus:outline-none" />
                <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500">
                  {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </label>
            {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
            <button disabled={busy} className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-blue-900 text-white font-semibold rounded-lg py-2.5 disabled:opacity-60">
              <LogIn className="h-5 w-5" /> {busy ? 'กำลังตรวจสอบ…' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          {!isFirebaseConfigured && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-ok" /> บัญชีทดลอง (กดเพื่อกรอกอัตโนมัติ) — รหัสผ่าน <code className="bg-slate-100 px-1.5 py-0.5 rounded">{DEMO_PASSWORD}</code></p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {demos.map((d) => (
                  <button key={d.email} type="button" onClick={() => { setEmail(d.email); setPassword(DEMO_PASSWORD); setError(''); }}
                    className={`flex items-center gap-3 text-left rounded-lg border px-3 py-2.5 ${d.tone} hover:shadow-card`}>
                    <d.icon className="h-5 w-5 shrink-0" />
                    <span className="min-w-0"><span className="block font-semibold text-sm">{d.label}</span><span className="block text-xs opacity-80 truncate">{d.email}</span></span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
