'use client';
import { useMemo, useState } from 'react';
import { CheckCircle2, Clock, Download, FileSignature, Gift, MapPin, PenLine, Send, Target, Wallet, XCircle, Flame, TrendingDown } from 'lucide-react';
import { Avatar, Badge, Btn, Card, Field, Progress, Section, Stat, Table, Td, inputCls, statusTone } from '@/components/ui';
import { attendanceByEmp, getEmp, getShift, officeGeofence, objectives, kudosBadges, leaveBalances, CURRENT_MONTH, employees, otRules, shifts, TODAY, COMPANY } from '@/data/mock';
import { baht, computePayroll, commission, commissionTiers, ewaAvailable, EWA_FEE, WORKING_DAYS } from '@/lib/payroll';
import { riskOf } from '@/lib/ai';
import { useHRData } from '@/context/HRDataContext';
import type { Employee, LeaveType } from '@/types/hr';

const thDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });

export function summarize(empId: string) {
  const recs = attendanceByEmp[empId];
  const ot: Record<'1.5' | '2' | '3', number> = { '1.5': 0, '2': 0, '3': 0 };
  let late = 0, early = 0, worked = 0;
  recs.forEach((r) => { late += r.lateMin; early += r.earlyMin; (['1.5', '2', '3'] as const).forEach((k) => (ot[k] += r.otHours[k] ?? 0)); if (r.checkIn) worked++; });
  return { late, early, ot, worked, recs };
}
export const payrollOf = (e: Employee, ewaDed = 0) => { const s = summarize(e.id); return computePayroll(e, CURRENT_MONTH, s.late, s.early, s.ot, ewaDed); };

/* ---------- ลงเวลา + GPS ---------- */
export function AttendancePanel({ empId }: { empId: string }) {
  const emp = getEmp(empId), sh = getShift(emp.shiftId), s = summarize(empId);
  const [state, setState] = useState<'idle' | 'locating' | 'in' | 'out' | 'far'>('idle');
  const [info, setInfo] = useState<{ time: string; dist: number; acc: number } | null>(null);

  function punch(kind: 'in' | 'out') {
    setState('locating');
    setTimeout(() => { // จำลอง GPS: ใช้ navigator.geolocation จริงได้ที่นี่ แล้วคำนวณระยะ Haversine เทียบ officeGeofence
      const dist = 42 + Math.floor(Math.random() * 60), acc = 8 + Math.floor(Math.random() * 8);
      setInfo({ time: new Date().toTimeString().slice(0, 5), dist, acc });
      setState(dist <= officeGeofence.radiusM ? kind : 'far');
    }, 1100);
  }
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 lg:col-span-2 space-y-3">
          <div className="flex items-start gap-3"><MapPin className="h-5 w-5 text-brand mt-0.5" /><div><p className="font-semibold">{officeGeofence.name}</p><p className="text-sm text-slate-500">รัศมีเช็กอินที่อนุญาต {officeGeofence.radiusM} เมตร (Geofence)</p></div></div>
          <div className="rounded-lg bg-slate-50 border border-line p-3 text-sm">กะของคุณ: <b>{sh.name}</b> {sh.start}–{sh.end}{sh.crossDay && ' (ข้ามวัน)'} <span className="text-slate-500">· {sh.note}</span></div>
          <div className="flex flex-wrap gap-2">
            <Btn onClick={() => punch('in')} disabled={state === 'locating'}><MapPin className="h-4 w-4" /> เช็กอิน</Btn>
            <Btn variant="ghost" onClick={() => punch('out')} disabled={state === 'locating'}><Clock className="h-4 w-4" /> เช็กเอาต์</Btn>
          </div>
          {state === 'locating' && <p className="text-sm text-slate-500">กำลังระบุตำแหน่งจาก GPS…</p>}
          {(state === 'in' || state === 'out') && info && <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{state === 'in' ? 'เช็กอิน' : 'เช็กเอาต์'}สำเร็จเวลา {info.time} น. · อยู่ห่างสำนักงาน {info.dist} ม. (ความแม่นยำ ±{info.acc} ม.)</p>}
          {state === 'far' && info && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">อยู่นอกพื้นที่ ({info.dist} ม.) กรุณาเข้าใกล้สำนักงานภายใน {officeGeofence.radiusM} ม. หรือส่งคำขอลงเวลานอกสถานที่</p>}
        </Card>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
          <Stat label="วันทำงานเดือนนี้" value={`${s.worked} วัน`} icon={CheckCircle2} tone="green" />
          <Stat label="สาย/ออกก่อน" value={`${s.late + s.early} นาที`} hint={`หักเงิน ${baht(payrollOf(emp).lateDeduction)}`} icon={Clock} tone="amber" />
        </div>
      </div>
      <Section title="บันทึกเวลาเดือนนี้" sub={`${CURRENT_MONTH} · OT ${(s.ot['1.5'] + s.ot['2'] + s.ot['3'])} ชม.`}>
        <Table head={['วันที่', 'เข้า', 'ออก', 'สาย (นาที)', 'OT (ชม.)', 'สถานะ']}>
          {[...s.recs].reverse().filter((r) => r.status !== 'วันหยุด').map((r) => (
            <tr key={r.id}><Td>{thDate(r.date)}</Td><Td>{r.checkIn ?? '—'}</Td><Td>{r.checkOut ?? '—'}</Td><Td>{r.lateMin || '—'}</Td><Td>{Object.values(r.otHours)[0] ? `${Object.values(r.otHours)[0]} (×${Object.keys(r.otHours)[0]})` : '—'}</Td><Td><Badge tone={statusTone(r.status)}>{r.status}</Badge></Td></tr>
          ))}
        </Table>
      </Section>
    </div>
  );
}

/* ---------- สลิปเงินเดือน ---------- */
export function PayslipPanel({ empId }: { empId: string }) {
  const { ewa } = useHRData();
  const emp = getEmp(empId);
  const ewaDed = ewa.filter((w) => w.employeeId === empId).reduce((a, w) => a + w.amount + w.fee, 0);
  const p = payrollOf(emp, ewaDed);
  const rows: [string, number, boolean][] = [
    ['เงินเดือนพื้นฐาน', p.baseSalary, true], ['คอมมิชชัน (ขั้นบันได)', p.commission, true], ['ค่าล่วงเวลา (OT)', p.otPay, true],
    ['ประกันสังคม (5% สูงสุด 750)', p.socialSecurity, false], ['ภาษีหัก ณ ที่จ่าย (ภ.ง.ด.1)', p.withholdingTax, false], ['หักมาสาย/ออกก่อน', p.lateDeduction, false], ['หักเงินเบิกล่วงหน้า (EWA + ค่าธรรมเนียม)', p.ewaDeduction, false],
  ];
  function download() {
    const txt = [`${COMPANY}`, `สลิปเงินเดือน ${CURRENT_MONTH}`, `พนักงาน: ${emp.name} (${emp.id}) · ${emp.position}`, '-'.repeat(44),
      ...rows.map(([l, v, inc]) => `${l.padEnd(34)} ${inc ? '+' : '-'}${v.toLocaleString('th-TH')}`), '-'.repeat(44), `รายได้รวม ${p.gross.toLocaleString('th-TH')}`, `รายการหักรวม ${p.totalDeduction.toLocaleString('th-TH')}`, `เงินได้สุทธิ ${p.net.toLocaleString('th-TH')} บาท`].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + txt], { type: 'text/plain;charset=utf-8' })); a.download = `payslip-${emp.id}-2026-10.txt`; a.click(); URL.revokeObjectURL(a.href);
  }
  return (
    <Card className="max-w-2xl">
      <div className="p-5 border-b border-line flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs text-slate-500">{COMPANY}</p><h3 className="text-lg font-bold">สลิปเงินเดือน {CURRENT_MONTH}</h3><p className="text-sm text-slate-600 mt-1">{emp.name} · {emp.position}</p></div>
        <Btn variant="indigo" onClick={download} className="no-print"><Download className="h-4 w-4" /> ดาวน์โหลดสลิป</Btn>
      </div>
      <div className="p-5 space-y-2">
        {rows.map(([l, v, inc]) => <div key={l} className="flex justify-between gap-3 text-sm"><span className="text-slate-600">{l}</span><span className={`font-medium ${inc ? 'text-slate-900' : 'text-red-600'}`}>{inc ? '' : '−'}{baht(v)}</span></div>)}
        <div className="border-t border-line pt-3 mt-3 flex justify-between items-center"><span className="font-semibold">เงินได้สุทธิ</span><span className="text-2xl font-bold text-ok">{baht(p.net)}</span></div>
        <p className="text-xs text-slate-500">รายได้รวม {baht(p.gross)} · รวมรายการหัก {baht(p.totalDeduction)} · โอนเข้าบัญชีวันที่ 25 {CURRENT_MONTH}</p>
      </div>
    </Card>
  );
}

/* ---------- ใบลา ---------- */
export function LeavePanel({ empId }: { empId: string }) {
  const { leaves, submitLeave, balances } = useHRData();
  const [f, setF] = useState({ type: 'ลาพักร้อน' as LeaveType, from: TODAY, to: TODAY, reason: '' });
  const [msg, setMsg] = useState('');
  const bal = balances[empId] ?? leaveBalances;
  const mine = leaves.filter((l) => l.employeeId === empId);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <div className="grid grid-cols-2 gap-3">{(Object.keys(leaveBalances) as LeaveType[]).map((t) => <Card key={t} className="p-3"><p className="text-xs text-slate-500">{t}</p><p className="text-xl font-bold">{(bal as Record<LeaveType, number>)[t]} <span className="text-sm font-normal text-slate-500">วัน</span></p></Card>)}</div>
        <Section title="ยื่นใบลา" sub="ลาไม่เกิน 3 วันและมียอดคงเหลือ = อนุมัติอัตโนมัติ">
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); const r = submitLeave({ employeeId: empId, ...f, reason: f.reason || '-' }); setMsg(r.status === 'อนุมัติอัตโนมัติ' ? `อนุมัติอัตโนมัติแล้ว (${r.days} วัน)` : `ส่งให้หัวหน้าอนุมัติแล้ว (${r.days} วัน)`); }}>
            <Field label="ประเภทการลา"><select className={inputCls} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as LeaveType })}>{Object.keys(leaveBalances).map((t) => <option key={t}>{t}</option>)}</select></Field>
            <div className="grid grid-cols-2 gap-3"><Field label="ตั้งแต่"><input type="date" className={inputCls} value={f.from} onChange={(e) => setF({ ...f, from: e.target.value, to: e.target.value > f.to ? e.target.value : f.to })} /></Field><Field label="ถึง"><input type="date" className={inputCls} value={f.to} min={f.from} onChange={(e) => setF({ ...f, to: e.target.value })} /></Field></div>
            <Field label="เหตุผล"><input className={inputCls} value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} placeholder="เช่น ธุระส่วนตัว" /></Field>
            <Btn type="submit"><Send className="h-4 w-4" /> ส่งใบลา</Btn>
            {msg && <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{msg}</p>}
          </form>
        </Section>
      </div>
      <div className="lg:col-span-3"><Section title="ประวัติการลา">
        <Table head={['ประเภท', 'ช่วงวันที่', 'วัน', 'สถานะ']}>{mine.map((l) => <tr key={l.id}><Td>{l.type}</Td><Td>{thDate(l.from)} – {thDate(l.to)}</Td><Td>{l.days}</Td><Td><Badge tone={statusTone(l.status)}>{l.status}</Badge></Td></tr>)}</Table>
        {!mine.length && <p className="text-sm text-slate-500 py-4">ยังไม่มีประวัติการลา</p>}
      </Section></div>
    </div>
  );
}

/* ---------- EWA + Kudos + OKR ---------- */
export function EwaPanel({ empId }: { empId: string }) {
  const { ewa, requestEwa } = useHRData();
  const emp = getEmp(empId), s = summarize(empId);
  const used = ewa.filter((w) => w.employeeId === empId).reduce((a, w) => a + w.amount, 0);
  const max = ewaAvailable(emp.salary, s.worked, used);
  const [amt, setAmt] = useState(Math.min(2000, max));
  const earned = Math.round((emp.salary / WORKING_DAYS) * s.worked);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Section title="เบิกเงินเดือนล่วงหน้า (EWA)" sub={`คำนวณจากวันทำงานจริง ${s.worked}/${WORKING_DAYS} วัน`}>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-slate-50 p-2"><p className="text-xs text-slate-500">รายได้สะสม</p><p className="font-bold text-sm">{baht(earned)}</p></div>
            <div className="rounded-lg bg-slate-50 p-2"><p className="text-xs text-slate-500">เบิกไปแล้ว</p><p className="font-bold text-sm">{baht(used)}</p></div>
            <div className="rounded-lg bg-emerald-50 p-2"><p className="text-xs text-ok">เบิกได้สูงสุด</p><p className="font-bold text-sm text-ok">{baht(max)}</p></div>
          </div>
          <Field label={`จำนวนที่ต้องการเบิก: ${baht(amt)}`}><input type="range" min={0} max={max} step={100} value={Math.min(amt, max)} onChange={(e) => setAmt(Number(e.target.value))} className="w-full accent-indigo-600" /></Field>
          <div className="text-sm space-y-1 rounded-lg border border-line p-3"><div className="flex justify-between"><span>ค่าธรรมเนียม</span><span>{baht(EWA_FEE)}</span></div><div className="flex justify-between font-semibold"><span>ยอดโอนเข้าบัญชี</span><span>{baht(Math.max(0, amt - EWA_FEE))}</span></div><p className="text-xs text-slate-500">หักคืนอัตโนมัติจากเงินเดือนรอบ {CURRENT_MONTH}</p></div>
          <Btn variant="success" disabled={amt < 500} onClick={() => requestEwa(empId, amt)}><Wallet className="h-4 w-4" /> เบิกเงินทันที</Btn>
        </div>
      </Section>
      <Section title="ประวัติการเบิก"><Table head={['วันที่', 'จำนวน', 'ค่าธรรมเนียม', 'สถานะ']}>{ewa.filter((w) => w.employeeId === empId).map((w) => <tr key={w.id}><Td>{thDate(w.createdAt)}</Td><Td>{baht(w.amount)}</Td><Td>{baht(w.fee)}</Td><Td><Badge tone="green">{w.status}</Badge></Td></tr>)}</Table></Section>
    </div>
  );
}

export function KudosPanel({ empId }: { empId: string }) {
  const { kudos, giveKudos } = useHRData();
  const [to, setTo] = useState(''); const [badge, setBadge] = useState(kudosBadges[0]); const [text, setText] = useState('');
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div className="lg:col-span-2"><Section title="ส่งคำชื่นชม (Kudos)" sub="ขอบคุณเพื่อนร่วมงานที่ทำให้ทีมดีขึ้น">
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (!to || !text) return; giveKudos({ fromId: empId, toId: to, badge, message: text }); setText(''); }}>
          <Field label="ถึง"><select className={inputCls} value={to} onChange={(e) => setTo(e.target.value)}><option value="">เลือกเพื่อนร่วมงาน</option>{employees.filter((e) => e.id !== empId).map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select></Field>
          <Field label="เหรียญรางวัล"><select className={inputCls} value={badge} onChange={(e) => setBadge(e.target.value)}>{kudosBadges.map((b) => <option key={b}>{b}</option>)}</select></Field>
          <Field label="ข้อความ"><textarea className={inputCls} rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="เล่าสิ่งที่เขาทำให้คุณประทับใจ" /></Field>
          <Btn type="submit" variant="indigo" disabled={!to || !text}><Gift className="h-4 w-4" /> ส่ง Kudos</Btn>
        </form>
      </Section></div>
      <div className="lg:col-span-3"><Section title="ฟีดคำชื่นชมของบริษัท"><ul className="space-y-3">{kudos.map((k) => (
        <li key={k.id} className="flex gap-3"><Avatar name={getEmp(k.toId).name} /><div className="min-w-0"><p className="text-sm"><b>{getEmp(k.fromId).name}</b> ชื่นชม <b>{getEmp(k.toId).name}</b> <Badge tone="indigo">{k.badge}</Badge></p><p className="text-sm text-slate-600 mt-1">{k.message}</p></div></li>))}</ul></Section></div>
    </div>
  );
}

export function OkrPanel({ empId }: { empId: string }) {
  const mine = objectives.filter((o) => o.employeeId === empId);
  const list = mine.length ? mine : objectives.slice(0, 1);
  return (
    <div className="space-y-4">{list.map((o) => {
      const avg = Math.round(o.keyResults.reduce((a, k) => a + k.progress, 0) / o.keyResults.length);
      return (
        <Section key={o.id} title={o.title} sub={`ความคืบหน้ารวม ${avg}%`} action={<Target className="h-5 w-5 text-tech" />}>
          <div className="space-y-4">{o.keyResults.map((k) => <div key={k.id}><div className="flex justify-between text-sm mb-1.5 gap-3"><span>{k.text}</span><span className="font-semibold">{k.progress}%</span></div><Progress value={k.progress} tone={k.progress >= 80 ? 'bg-ok' : 'bg-tech'} /></div>)}</div>
        </Section>);
    })}</div>
  );
}

/* ---------- เอกสาร e-Sign ---------- */
export function DocumentsPanel({ empId, all = false }: { empId?: string; all?: boolean }) {
  const { documents, signDocument } = useHRData();
  const [openId, setOpenId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const list = documents.filter((d) => all || d.assigneeId === empId);
  return (
    <Section title="เอกสารและลายเซ็นอิเล็กทรอนิกส์" sub="ลงนามนโยบายและใบรับรองแพทย์แบบดิจิทัล พร้อมบันทึกเวลา">
      <ul className="divide-y divide-line">{list.map((d) => (
        <li key={d.id} className="py-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-start gap-3 min-w-0"><FileSignature className="h-5 w-5 text-tech mt-0.5 shrink-0" /><div className="min-w-0"><p className="text-sm font-medium">{d.title}</p><p className="text-xs text-slate-500">{d.category}{all && ` · ผู้ลงนาม: ${getEmp(d.assigneeId).name}`}</p></div></div>
            {d.status === 'รอลงนาม' ? <Btn variant="indigo" onClick={() => { setOpenId(openId === d.id ? null : d.id); setName(''); }}><PenLine className="h-4 w-4" /> ลงนาม</Btn> : <Badge tone="green">ลงนามแล้ว {d.signedAt}</Badge>}
          </div>
          {openId === d.id && d.status === 'รอลงนาม' && (
            <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-3 space-y-2">
              <p className="text-sm">พิมพ์ชื่อ-นามสกุลเพื่อยืนยันว่าคุณได้อ่านและยอมรับเอกสารนี้</p>
              <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อ-นามสกุลของคุณ" />
              {name && <p className="text-2xl text-tech italic" style={{ fontFamily: 'cursive' }}>{name}</p>}
              <Btn variant="success" disabled={name.trim().length < 3} onClick={() => { signDocument(d.id, name.trim()); setOpenId(null); }}><CheckCircle2 className="h-4 w-4" /> ยืนยันลายเซ็น</Btn>
            </div>)}
        </li>))}
      </ul>
      {!list.length && <p className="text-sm text-slate-500">ไม่มีเอกสารที่ต้องดำเนินการ</p>}
    </Section>
  );
}

/* ---------- อนุมัติ (1 ขั้น) ---------- */
export function ApprovalsPanel({ teamOnly }: { teamOnly?: string }) {
  const { approvals, decide } = useHRData();
  const list = approvals.filter((a) => !teamOnly || getEmp(a.employeeId).managerId === teamOnly);
  return (
    <Section title="คำขออนุมัติ (OT · ค่าใช้จ่าย · ลา)" sub="อนุมัติ 1 ขั้นโดยหัวหน้าโดยตรง">
      <ul className="divide-y divide-line">{list.map((a) => (
        <li key={a.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0"><Avatar name={getEmp(a.employeeId).name} /><div className="min-w-0">
            <p className="text-sm font-medium">{a.title} <Badge tone={a.kind === 'OT' ? 'indigo' : a.kind === 'ค่าใช้จ่าย' ? 'blue' : 'slate'}>{a.kind}</Badge></p>
            <p className="text-xs text-slate-500">{getEmp(a.employeeId).name} · {a.detail}{a.amount ? ` · ${baht(a.amount)}` : ''}</p></div></div>
          {a.status === 'รออนุมัติ' ? <div className="flex gap-2"><Btn variant="success" onClick={() => decide(a.id, true)}><CheckCircle2 className="h-4 w-4" /> อนุมัติ</Btn><Btn variant="danger" onClick={() => decide(a.id, false)}><XCircle className="h-4 w-4" /> ปฏิเสธ</Btn></div> : <Badge tone={statusTone(a.status)}>{a.status}</Badge>}
        </li>))}
      </ul>
      {!list.length && <p className="text-sm text-slate-500">ไม่มีคำขอที่รอดำเนินการ</p>}
    </Section>
  );
}

/* ---------- AI Radar ---------- */
export function RadarPanel() {
  const rows = useMemo(() => employees.map((e) => ({ e, r: riskOf(e) })).sort((a, b) => b.r.turnover - a.r.turnover), []);
  const tone = (v: number) => (v >= 60 ? 'bg-red-500' : v >= 40 ? 'bg-amber-500' : 'bg-ok');
  const high = rows.filter((x) => x.r.turnover >= 60).length, burn = rows.filter((x) => x.r.burnout >= 60).length;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label="เสี่ยงลาออกสูง" value={`${high} คน`} icon={TrendingDown} tone="red" /><Stat label="เสี่ยงหมดไฟสูง" value={`${burn} คน`} icon={Flame} tone="amber" /><Stat label="คะแนนผูกพันเฉลี่ย" value={`${Math.round(employees.reduce((a, e) => a + e.engagement, 0) / employees.length)}`} icon={Target} tone="indigo" />
      </div>
      <Section title="AI Predictive Turnover & Burnout Radar" sub="วิเคราะห์จาก OT, วันลาสะสม, ความผูกพัน, อายุงาน และรอบปรับเงินเดือน">
        <Table head={['พนักงาน', 'ความเสี่ยงลาออก', 'ความเสี่ยงหมดไฟ', 'ปัจจัยสำคัญ']}>{rows.slice(0, 8).map(({ e, r }) => (
          <tr key={e.id}><Td><div className="flex items-center gap-2"><Avatar name={e.name} size="h-8 w-8" /><div><p className="font-medium">{e.name}</p><p className="text-xs text-slate-500">{e.department}</p></div></div></Td>
            <Td className="min-w-[9rem]"><div className="flex items-center gap-2"><div className="flex-1"><Progress value={r.turnover} tone={tone(r.turnover)} /></div><b className="w-9 text-right">{r.turnover}%</b></div></Td>
            <Td className="min-w-[9rem]"><div className="flex items-center gap-2"><div className="flex-1"><Progress value={r.burnout} tone={tone(r.burnout)} /></div><b className="w-9 text-right">{r.burnout}%</b></div></Td>
            <Td className="text-xs text-slate-600 min-w-[14rem] whitespace-normal">{r.factors.join(' · ') || 'ไม่พบปัจจัยเสี่ยงเด่น'}</Td></tr>))}
        </Table>
      </Section>
    </div>
  );
}

/* ---------- ตารางกะ + กฎ OT ---------- */
export function ShiftEnginePanel() {
  return (
    <div className="space-y-4">
      <Section title="กะการทำงาน 6 รูปแบบ" sub="รองรับกะข้ามวัน กะแบ่ง และกะยืดหยุ่น">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">{shifts.map((s) => (
          <div key={s.id} className="rounded-lg border border-line p-3"><div className="flex justify-between gap-2"><b className="text-sm">{s.name}</b><span className="text-xs text-slate-500">{employees.filter((e) => e.shiftId === s.id).length} คน</span></div>
            <p className="text-lg font-bold text-brand mt-1">{s.split ? s.split.map((x) => `${x.start}–${x.end}`).join(' / ') : `${s.start}–${s.end}`}</p>
            <div className="flex gap-1.5 mt-1 flex-wrap">{s.crossDay && <Badge tone="indigo">ข้ามวัน</Badge>}{s.split && <Badge tone="amber">แบ่งช่วง</Badge>}</div><p className="text-xs text-slate-500 mt-2">{s.note}</p></div>))}</div>
      </Section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="กฎคำนวณ OT"><Table head={['อัตรา', 'กรณี']}>{otRules.map((r) => <tr key={r.rate}><Td><Badge tone="indigo">×{r.rate}</Badge></Td><Td className="whitespace-normal"><b>{r.label}</b><p className="text-xs text-slate-500">{r.description}</p></Td></tr>)}</Table></Section>
        <Section title="กฎหักมาสาย/ออกก่อนเวลา"><p className="text-sm text-slate-600 leading-relaxed">หักตามนาทีจริงด้วยสูตร <code className="bg-slate-100 px-1 rounded">เงินเดือน ÷ 30 ÷ 8 ÷ 60 × จำนวนนาที</code> เช่น เงินเดือน 38,000 มาสาย 20 นาที หัก {baht((38000 / 30 / 8 / 60) * 20)} และรวมอยู่ในสลิปเงินเดือนอัตโนมัติ</p></Section>
      </div>
    </div>
  );
}

/* ---------- สรุปคอมมิชชัน ---------- */
export function CommissionTable() {
  return <Section title="โครงสร้างคอมมิชชันหลายขั้น"><Table head={['ยอดขายส่วนที่อยู่ในช่วง', 'อัตรา']}>{commissionTiers.map((t, i) => <tr key={i}><Td>{i === 0 ? 'ไม่เกิน ' : i === 1 ? '100,001 – ' : 'เกิน '}{t.upTo === Infinity ? '300,000 บาท' : `${t.upTo.toLocaleString('th-TH')} บาท`}</Td><Td><Badge tone="green">{t.rate * 100}%</Badge></Td></tr>)}</Table><p className="text-xs text-slate-500 mt-3">ตัวอย่าง: ยอดขาย 420,000 บาท = {baht(commission(420000))}</p></Section>;
}
