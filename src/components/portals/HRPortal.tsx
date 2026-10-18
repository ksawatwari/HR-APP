'use client';
import { useState } from 'react';
import { Briefcase, Calculator, CheckCircle2, Clock, FileSignature, Lock, Network, Pencil, Plus, Radar, Save, Trash2, Unlock, Users, X } from 'lucide-react';
import { Avatar, Badge, Btn, Card, Field, Progress, Section, Stat, Table, Td, Tabs, inputCls } from '@/components/ui';
import { departments, jobs, onboardingTemplate, permissionModules, initialPermissions } from '@/data/mock';
import { baht } from '@/lib/payroll';
import { resumeMatch } from '@/lib/ai';
import { useHRData } from '@/context/HRDataContext';
import { ApprovalsPanel, CommissionTable, DocumentsPanel, RadarPanel, ShiftEnginePanel } from '@/components/modules';
import type { CandidateStage, Department, Employee } from '@/types/hr';

const numIn = 'w-28 rounded-md border border-line px-2 py-1 text-right text-sm focus:border-tech focus:outline-none disabled:bg-slate-100 disabled:text-slate-500';

function OrgNode({ e, all }: { e: Employee; all: Employee[] }) {
  const kids = all.filter((x) => x.managerId === e.id);
  return (
    <li>
      <div className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 shadow-card my-1 max-w-full">
        <Avatar name={e.name} size="h-8 w-8" />
        <div className="min-w-0"><p className="text-sm font-semibold truncate">{e.name}</p><p className="text-xs text-slate-500 truncate">{e.position}</p></div>
      </div>
      {kids.length > 0 && <ul className="ml-4 sm:ml-6 pl-4 border-l-2 border-blue-100">{kids.map((k) => <OrgNode key={k.id} e={k} all={all} />)}</ul>}
    </li>
  );
}

/* ---------- Core HR: แก้ไขข้อมูลพนักงานได้จริง ---------- */
function CoreHR() {
  const { employees, permissions, togglePermission, updateEmployee } = useHRData();
  const [dept, setDept] = useState('ทั้งหมด');
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ position: string; department: Department; salary: number }>({ position: '', department: 'ฝ่ายขาย', salary: 0 });
  const list = employees.filter((e) => dept === 'ทั้งหมด' || e.department === dept);
  const roles = [['employee', 'พนักงาน'], ['manager', 'ผู้จัดการ'], ['hr', 'ฝ่ายบุคคล'], ['executive', 'ผู้บริหาร']];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="โครงสร้างองค์กร (Org Chart)"><ul><OrgNode e={employees[0]} all={employees} /></ul></Section>
        <Section title="แผนก">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{departments.map((d) => {
            const m = employees.filter((e) => e.department === d);
            return <div key={d} className="rounded-lg border border-line p-3"><p className="font-semibold text-sm">{d}</p><p className="text-xs text-slate-500">{m.length} คน · เงินเดือนรวม {baht(m.reduce((a, e) => a + e.salary, 0))}</p></div>;
          })}</div>
        </Section>
      </div>

      <Section title="ทะเบียนพนักงานดิจิทัล" sub="กด “แก้ไข” เพื่อเปลี่ยนตำแหน่ง แผนก หรือเงินเดือน — ตารางเงินเดือนและสลิปจะอัปเดตทันที"
        action={<select aria-label="กรองแผนก" className="rounded-lg border border-line text-sm px-2 py-1.5" value={dept} onChange={(e) => setDept(e.target.value)}><option>ทั้งหมด</option>{departments.map((d) => <option key={d}>{d}</option>)}</select>}>
        <Table head={['รหัส', 'ชื่อ-สกุล', 'ตำแหน่ง', 'แผนก', 'เงินเดือน', 'จัดการ']}>{list.map((e) => {
          const on = editId === e.id;
          return (
            <tr key={e.id}>
              <Td>{e.id}</Td>
              <Td><div className="flex items-center gap-2"><Avatar name={e.name} size="h-8 w-8" />{e.name}</div></Td>
              <Td>{on ? <input className={inputCls} value={draft.position} onChange={(x) => setDraft({ ...draft, position: x.target.value })} /> : e.position}</Td>
              <Td>{on ? <select className={inputCls} value={draft.department} onChange={(x) => setDraft({ ...draft, department: x.target.value as Department })}>{departments.map((d) => <option key={d}>{d}</option>)}</select> : e.department}</Td>
              <Td>{on ? <input type="number" min={0} className={numIn} value={draft.salary} onChange={(x) => setDraft({ ...draft, salary: Number(x.target.value) || 0 })} /> : baht(e.salary)}</Td>
              <Td>{on
                ? <div className="flex gap-1.5"><Btn variant="success" className="!px-2.5 !py-1" onClick={() => { updateEmployee(e.id, draft); setEditId(null); }}><Save className="h-4 w-4" /> บันทึก</Btn><Btn variant="ghost" className="!px-2.5 !py-1" onClick={() => setEditId(null)}><X className="h-4 w-4" /></Btn></div>
                : <Btn variant="ghost" className="!px-2.5 !py-1" onClick={() => { setEditId(e.id); setDraft({ position: e.position, department: e.department, salary: e.salary }); }}><Pencil className="h-4 w-4" /> แก้ไข</Btn>}</Td>
            </tr>
          );
        })}</Table>
      </Section>

      <Section title="ตารางสิทธิ์การใช้งาน (Permission Matrix)" sub="คลิกสวิตช์เพื่อเปิด/ปิดสิทธิ์ของแต่ละบทบาท">
        <Table head={['โมดูล', ...roles.map((r) => r[1])]}>{permissionModules.map((m) => (
          <tr key={m}><Td className="font-medium">{m}</Td>{roles.map(([r]) => {
            const on = !!(permissions[r] ?? initialPermissions[r])[m];
            return <Td key={r}><button role="switch" aria-checked={on} aria-label={`${m} — ${r}`} onClick={() => togglePermission(r, m)} className={`h-6 w-11 rounded-full relative transition-colors ${on ? 'bg-ok' : 'bg-slate-300'}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? 'left-5' : 'left-0.5'}`} /></button></Td>;
          })}</tr>
        ))}</Table>
      </Section>
    </div>
  );
}

/* ---------- Payroll: แก้ตัวเลขแล้วยอดสุทธิเปลี่ยนทันที ---------- */
function PayrollTab() {
  const { employees, payrollFor, updateEmployee, otManual, setOtManual, payrollClosed, closePayroll, reopenPayroll } = useHRData();
  const rows = employees.map((e) => ({ e, p: payrollFor(e) }));
  const sum = (f: (r: (typeof rows)[number]) => number) => rows.reduce((a, r) => a + f(r), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="รายได้รวม" value={baht(sum((r) => r.p.gross))} tone="blue" />
        <Stat label="ประกันสังคม" value={baht(sum((r) => r.p.socialSecurity))} tone="indigo" />
        <Stat label="ภาษี ภ.ง.ด.1" value={baht(sum((r) => r.p.withholdingTax))} tone="amber" />
        <Stat label="จ่ายสุทธิรวม" value={baht(sum((r) => r.p.takeHome))} tone="green" />
      </div>

      {payrollClosed && <p role="status" className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">ปิดงวดแล้ว — ออกสลิป {rows.length} ฉบับ ยอดจ่ายสุทธิ {baht(sum((r) => r.p.takeHome))} (ล็อกการแก้ไขชั่วคราว กด “เปิดงวดใหม่” เพื่อแก้ไขต่อ)</p>}

      <Section title="รอบเงินเดือน ตุลาคม 2569" sub={payrollClosed ? 'สถานะ: ปิดงวดแล้ว' : 'แก้ไขเงินเดือน ยอดขาย หรือ OT ในช่องได้เลย ยอดสุทธิจะคำนวณใหม่ทันที'}
        action={payrollClosed
          ? <Btn variant="ghost" onClick={reopenPayroll}><Unlock className="h-4 w-4" /> เปิดงวดใหม่</Btn>
          : <Btn onClick={closePayroll}><Lock className="h-4 w-4" /> ปิดงวดเงินเดือน</Btn>}>
        <Table head={['พนักงาน', 'เงินเดือน', 'ยอดขาย', 'OT เพิ่ม (ชม.)', 'คอมมิชชัน', 'OT รวม (฿)', 'รายได้รวม', 'ปกส.', 'ภาษี', 'หักสาย', 'หัก EWA', 'คืนค่าใช้จ่าย', 'สุทธิ']}>
          {rows.map(({ e, p }) => (
            <tr key={e.id}>
              <Td className="whitespace-nowrap">{e.name}</Td>
              <Td><input aria-label={`เงินเดือน ${e.name}`} type="number" min={0} step={500} disabled={payrollClosed} className={numIn} value={e.salary} onChange={(x) => updateEmployee(e.id, { salary: Number(x.target.value) || 0 })} /></Td>
              <Td><input aria-label={`ยอดขาย ${e.name}`} type="number" min={0} step={5000} disabled={payrollClosed} className={numIn} value={e.salesThisMonth} onChange={(x) => updateEmployee(e.id, { salesThisMonth: Number(x.target.value) || 0 })} /></Td>
              <Td><input aria-label={`OT เพิ่ม ${e.name}`} type="number" min={0} step={1} disabled={payrollClosed} className="w-20 rounded-md border border-line px-2 py-1 text-right text-sm disabled:bg-slate-100" value={otManual[e.id] ?? 0} onChange={(x) => setOtManual(e.id, Number(x.target.value) || 0)} /></Td>
              <Td>{baht(p.commission)}</Td><Td>{baht(p.otPay)}</Td><Td>{baht(p.gross)}</Td><Td>{baht(p.socialSecurity)}</Td><Td>{baht(p.withholdingTax)}</Td>
              <Td>{baht(p.lateDeduction)}</Td><Td>{p.ewaDeduction ? baht(p.ewaDeduction) : '—'}</Td><Td>{p.reimb ? baht(p.reimb) : '—'}</Td>
              <Td className="font-bold text-ok whitespace-nowrap">{baht(p.takeHome)}</Td>
            </tr>
          ))}
        </Table>
      </Section>
      <CommissionTable />
    </div>
  );
}

/* ---------- ATS ---------- */
const stages: CandidateStage[] = ['สมัครใหม่', 'คัดกรอง', 'สัมภาษณ์', 'เสนอเงินเดือน', 'รับเข้าทำงาน'];

function ATS() {
  const { candidates, moveCandidate, addCandidate, removeCandidate } = useHRData();
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [f, setF] = useState({ name: '', jobId: jobs[0].id, skills: '', exp: 2, salary: 40000 });
  const hired = candidates.filter((c) => c.stage === 'รับเข้าทำงาน');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{jobs.map((j) => (
        <Card key={j.id} className="p-4"><div className="flex justify-between gap-2"><b className="text-sm">{j.title}</b><Badge tone="green">{j.status}</Badge></div>
          <p className="text-xs text-slate-500 mt-1">{j.department} · รับ {j.openings} อัตรา · ประสบการณ์ ≥ {j.minExp} ปี</p>
          <div className="flex flex-wrap gap-1 mt-2">{j.skills.map((s) => <Badge key={s} tone="blue">{s}</Badge>)}</div></Card>
      ))}</div>

      <Section title="เพิ่มผู้สมัครใหม่" sub="ใส่ทักษะคั่นด้วยคอมมา ระบบจะคำนวณคะแนน AI Match ให้ทันที">
        <form className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end" onSubmit={(e) => {
          e.preventDefault();
          if (!f.name.trim()) return;
          addCandidate({ name: f.name.trim(), jobId: f.jobId, skills: f.skills.split(',').map((s) => s.trim()).filter(Boolean), experienceYears: f.exp, expectedSalary: f.salary, summary: 'เพิ่มโดยฝ่ายบุคคล' });
          setF({ ...f, name: '', skills: '' });
        }}>
          <div className="md:col-span-2"><Field label="ชื่อผู้สมัคร"><input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field></div>
          <Field label="ตำแหน่ง"><select className={inputCls} value={f.jobId} onChange={(e) => setF({ ...f, jobId: e.target.value })}>{jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}</select></Field>
          <div className="md:col-span-2"><Field label="ทักษะ"><input className={inputCls} value={f.skills} onChange={(e) => setF({ ...f, skills: e.target.value })} placeholder="Next.js, TypeScript" /></Field></div>
          <Field label="ประสบการณ์ (ปี)"><input type="number" min={0} className={inputCls} value={f.exp} onChange={(e) => setF({ ...f, exp: Number(e.target.value) || 0 })} /></Field>
          <Btn type="submit" variant="indigo"><Plus className="h-4 w-4" /> เพิ่ม</Btn>
        </form>
      </Section>

      <div className="scroll-x pb-2"><div className="inline-flex gap-3 align-top">{stages.map((st) => (
        <div key={st} className="w-64 shrink-0 whitespace-normal rounded-xl bg-slate-100 p-2.5">
          <p className="text-sm font-semibold px-1 mb-2">{st} <span className="text-slate-500">({candidates.filter((c) => c.stage === st).length})</span></p>
          <div className="space-y-2">{candidates.filter((c) => c.stage === st).map((c) => {
            const job = jobs.find((j) => j.id === c.jobId)!;
            const m = resumeMatch(c, job);
            const i = stages.indexOf(st);
            return (
              <Card key={c.id} className="p-3 space-y-2">
                <div className="flex justify-between gap-2"><p className="font-medium text-sm">{c.name}</p><button aria-label={`ไม่ผ่านการคัดเลือก ${c.name}`} title="ไม่ผ่าน / ลบออก" onClick={() => removeCandidate(c.id)} className="text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div>
                <p className="text-xs text-slate-500">{job.title}</p>
                <div><div className="flex justify-between text-xs mb-1"><span>AI Match</span><b className={m >= 80 ? 'text-ok' : m >= 55 ? 'text-amber-600' : 'text-red-600'}>{m}%</b></div><Progress value={m} tone={m >= 80 ? 'bg-ok' : m >= 55 ? 'bg-amber-500' : 'bg-red-500'} /></div>
                <p className="text-xs text-slate-600">{c.summary} · {c.experienceYears} ปี · {baht(c.expectedSalary)}</p>
                <div className="flex gap-1.5">
                  {i > 0 && <Btn variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => moveCandidate(c.id, stages[i - 1])}>ย้อน</Btn>}
                  {i < stages.length - 1 && <Btn className="!px-2 !py-1 text-xs" onClick={() => moveCandidate(c.id, stages[i + 1])}>ถัดไป</Btn>}
                </div>
              </Card>
            );
          })}</div>
        </div>
      ))}</div></div>

      <Section title="รายการเตรียมความพร้อมพนักงานใหม่ (Onboarding)" sub={hired.length ? `สำหรับ ${hired.map((h) => h.name).join(', ')}` : 'ยังไม่มีผู้ได้รับการคัดเลือก'}>
        <ul className="space-y-2">{onboardingTemplate.map((t) => (
          <li key={t}><label className="flex items-center gap-3 text-sm"><input type="checkbox" className="h-4 w-4 accent-emerald-600" checked={!!checks[t]} onChange={() => setChecks({ ...checks, [t]: !checks[t] })} /><span className={checks[t] ? 'line-through text-slate-400' : ''}>{t}</span></label></li>
        ))}</ul>
        <div className="mt-3 max-w-xs"><Progress value={(Object.values(checks).filter(Boolean).length / onboardingTemplate.length) * 100} tone="bg-ok" /></div>
      </Section>
    </div>
  );
}

export function HRPortal() {
  const { approvals, documents, employees } = useHRData();
  const pend = approvals.filter((a) => a.status === 'รออนุมัติ').length;
  const unsigned = documents.filter((d) => d.status === 'รอลงนาม').length;
  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-bold">พอร์ทัลฝ่ายทรัพยากรบุคคล</h1><p className="text-sm text-slate-500">ศูนย์กลางจัดการพนักงาน เงินเดือน การสรรหา และเอกสาร</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="พนักงาน" value={`${employees.length} คน`} icon={Users} tone="blue" />
        <Stat label="รออนุมัติ" value={`${pend}`} icon={Clock} tone="amber" />
        <Stat label="เอกสารรอลงนาม" value={`${unsigned}`} icon={FileSignature} tone="indigo" />
        <Stat label="ตำแหน่งเปิดรับ" value={`${jobs.length}`} icon={Briefcase} tone="green" />
      </div>
      <Tabs tabs={[
        { id: 'core', label: 'Core HR', icon: Network }, { id: 'shift', label: 'กะ & OT', icon: Clock }, { id: 'pay', label: 'เงินเดือน & ภาษี', icon: Calculator },
        { id: 'ats', label: 'สรรหา (ATS)', icon: Briefcase }, { id: 'appr', label: 'อนุมัติ', icon: CheckCircle2, badge: pend }, { id: 'docs', label: 'เอกสาร e-Sign', icon: FileSignature },
        { id: 'radar', label: 'AI Radar', icon: Radar },
      ]}>{(t) => (<>
        {t === 'core' && <CoreHR />}{t === 'shift' && <ShiftEnginePanel />}{t === 'pay' && <PayrollTab />}{t === 'ats' && <ATS />}
        {t === 'appr' && <ApprovalsPanel />}{t === 'docs' && <DocumentsPanel all />}{t === 'radar' && <RadarPanel />}
      </>)}</Tabs>
    </div>
  );
}
