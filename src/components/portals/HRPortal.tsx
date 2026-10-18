'use client';
import { useMemo, useState } from 'react';
import { Briefcase, Calculator, CheckCircle2, Clock, FileSignature, Network, Radar, ShieldCheck, Users } from 'lucide-react';
import { Avatar, Badge, Btn, Section, Stat, Table, Td, Tabs, Card, Progress, statusTone } from '@/components/ui';
import { departments, employees, getEmp, initialPermissions, jobs, onboardingTemplate, permissionModules } from '@/data/mock';
import { baht } from '@/lib/payroll';
import { resumeMatch } from '@/lib/ai';
import { useHRData } from '@/context/HRDataContext';
import { ApprovalsPanel, CommissionTable, DocumentsPanel, RadarPanel, ShiftEnginePanel, payrollOf } from '@/components/modules';
import type { CandidateStage, Employee } from '@/types/hr';

function OrgNode({ e, depth = 0 }: { e: Employee; depth?: number }) {
  const kids = employees.filter((x) => x.managerId === e.id);
  return (
    <li className="relative">
      <div className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 shadow-card my-1 max-w-full"><Avatar name={e.name} size="h-8 w-8" /><div className="min-w-0"><p className="text-sm font-semibold truncate">{e.name}</p><p className="text-xs text-slate-500 truncate">{e.position}</p></div></div>
      {kids.length > 0 && <ul className="ml-4 sm:ml-6 pl-4 border-l-2 border-blue-100">{kids.map((k) => <OrgNode key={k.id} e={k} depth={depth + 1} />)}</ul>}
    </li>
  );
}

function CoreHR() {
  const { permissions, togglePermission } = useHRData();
  const [dept, setDept] = useState('ทั้งหมด');
  const list = employees.filter((e) => dept === 'ทั้งหมด' || e.department === dept);
  const roles = [['employee', 'พนักงาน'], ['manager', 'ผู้จัดการ'], ['hr', 'ฝ่ายบุคคล'], ['executive', 'ผู้บริหาร']];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="โครงสร้างองค์กร (Org Chart)"><ul>{<OrgNode e={employees[0]} />}</ul></Section>
        <Section title="แผนก"><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{departments.map((d) => { const m = employees.filter((e) => e.department === d); return <div key={d} className="rounded-lg border border-line p-3"><p className="font-semibold text-sm">{d}</p><p className="text-xs text-slate-500">{m.length} คน · เงินเดือนรวม {baht(m.reduce((a, e) => a + e.salary, 0))}</p></div>; })}</div></Section>
      </div>
      <Section title="ทะเบียนพนักงานดิจิทัล" action={<select aria-label="กรองแผนก" className="rounded-lg border border-line text-sm px-2 py-1.5" value={dept} onChange={(e) => setDept(e.target.value)}><option>ทั้งหมด</option>{departments.map((d) => <option key={d}>{d}</option>)}</select>}>
        <Table head={['รหัส', 'ชื่อ-สกุล', 'ตำแหน่ง', 'แผนก', 'อีเมล', 'วันเริ่มงาน', 'เงินเดือน']}>{list.map((e) => <tr key={e.id}><Td>{e.id}</Td><Td><div className="flex items-center gap-2"><Avatar name={e.name} size="h-8 w-8" />{e.name}</div></Td><Td>{e.position}</Td><Td>{e.department}</Td><Td className="text-slate-500">{e.email}</Td><Td>{e.startDate}</Td><Td>{baht(e.salary)}</Td></tr>)}</Table>
      </Section>
      <Section title="ตารางสิทธิ์การใช้งาน (Permission Matrix)" sub="คลิกที่ช่องเพื่อเปิด/ปิดสิทธิ์ของแต่ละบทบาท">
        <Table head={['โมดูล', ...roles.map((r) => r[1])]}>{permissionModules.map((m) => <tr key={m}><Td className="font-medium">{m}</Td>{roles.map(([r]) => { const on = !!(permissions[r] ?? initialPermissions[r])[m]; return <Td key={r}><button role="switch" aria-checked={on} aria-label={`${m} — ${r}`} onClick={() => togglePermission(r, m)} className={`h-6 w-11 rounded-full relative transition-colors ${on ? 'bg-ok' : 'bg-slate-300'}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? 'left-5' : 'left-0.5'}`} /></button></Td>; })}</tr>)}</Table>
      </Section>
    </div>
  );
}

function PayrollTab() {
  const rows = useMemo(() => employees.map((e) => payrollOf(e)), []);
  const [run, setRun] = useState(false);
  const tot = (k: 'gross' | 'net' | 'socialSecurity' | 'withholdingTax') => rows.reduce((a, r) => a + r[k], 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><Stat label="รายได้รวม" value={baht(tot('gross'))} tone="blue" /><Stat label="ประกันสังคม" value={baht(tot('socialSecurity'))} tone="indigo" /><Stat label="ภาษี ภ.ง.ด.1" value={baht(tot('withholdingTax'))} tone="amber" /><Stat label="จ่ายสุทธิ" value={baht(tot('net'))} tone="green" /></div>
      <Section title="รอบเงินเดือน ตุลาคม 2569" action={<Btn variant={run ? 'success' : 'primary'} onClick={() => setRun(true)} disabled={run}>{run ? <><CheckCircle2 className="h-4 w-4" /> ปิดงวดและส่งสลิปแล้ว</> : <><Calculator className="h-4 w-4" /> ปิดงวดเงินเดือน</>}</Btn>}>
        <Table head={['พนักงาน', 'เงินเดือน', 'คอมมิชชัน', 'OT', 'รวม', 'ปกส.', 'ภาษี', 'หักสาย', 'สุทธิ']}>{rows.map((r) => <tr key={r.employeeId}><Td className="whitespace-nowrap">{getEmp(r.employeeId).name}</Td><Td>{baht(r.baseSalary)}</Td><Td>{baht(r.commission)}</Td><Td>{baht(r.otPay)}</Td><Td>{baht(r.gross)}</Td><Td>{baht(r.socialSecurity)}</Td><Td>{baht(r.withholdingTax)}</Td><Td>{baht(r.lateDeduction)}</Td><Td className="font-bold text-ok">{baht(r.net)}</Td></tr>)}</Table>
      </Section>
      <CommissionTable />
    </div>
  );
}

const stages: CandidateStage[] = ['สมัครใหม่', 'คัดกรอง', 'สัมภาษณ์', 'เสนอเงินเดือน', 'รับเข้าทำงาน'];
function ATS() {
  const { candidates, moveCandidate } = useHRData();
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const hired = candidates.filter((c) => c.stage === 'รับเข้าทำงาน');
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{jobs.map((j) => <Card key={j.id} className="p-4"><div className="flex justify-between gap-2"><b className="text-sm">{j.title}</b><Badge tone="green">{j.status}</Badge></div><p className="text-xs text-slate-500 mt-1">{j.department} · รับ {j.openings} อัตรา · ประสบการณ์ ≥ {j.minExp} ปี</p><div className="flex flex-wrap gap-1 mt-2">{j.skills.map((s) => <Badge key={s} tone="blue">{s}</Badge>)}</div></Card>)}</div>
      <div className="scroll-x pb-2"><div className="inline-flex gap-3 align-top">{stages.map((st) => (
        <div key={st} className="w-64 shrink-0 whitespace-normal rounded-xl bg-slate-100 p-2.5">
          <p className="text-sm font-semibold px-1 mb-2">{st} <span className="text-slate-500">({candidates.filter((c) => c.stage === st).length})</span></p>
          <div className="space-y-2">{candidates.filter((c) => c.stage === st).map((c) => { const job = jobs.find((j) => j.id === c.jobId)!; const m = resumeMatch(c, job); const i = stages.indexOf(st); return (
            <Card key={c.id} className="p-3 space-y-2"><p className="font-medium text-sm">{c.name}</p><p className="text-xs text-slate-500">{job.title}</p>
              <div><div className="flex justify-between text-xs mb-1"><span>AI Match</span><b className={m >= 80 ? 'text-ok' : m >= 55 ? 'text-amber-600' : 'text-red-600'}>{m}%</b></div><Progress value={m} tone={m >= 80 ? 'bg-ok' : m >= 55 ? 'bg-amber-500' : 'bg-red-500'} /></div>
              <p className="text-xs text-slate-600">{c.summary} · {c.experienceYears} ปี · {baht(c.expectedSalary)}</p>
              <div className="flex gap-1.5">{i > 0 && <Btn variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => moveCandidate(c.id, stages[i - 1])}>ย้อน</Btn>}{i < 4 && <Btn className="!px-2 !py-1 text-xs" onClick={() => moveCandidate(c.id, stages[i + 1])}>ถัดไป</Btn>}</div></Card>); })}</div>
        </div>))}</div></div>
      <Section title="รายการเตรียมความพร้อมพนักงานใหม่ (Onboarding)" sub={hired.length ? `สำหรับ ${hired.map((h) => h.name).join(', ')}` : 'ยังไม่มีผู้ได้รับการคัดเลือก'}>
        <ul className="space-y-2">{onboardingTemplate.map((t) => <li key={t}><label className="flex items-center gap-3 text-sm"><input type="checkbox" className="h-4 w-4 accent-emerald-600" checked={!!checks[t]} onChange={() => setChecks({ ...checks, [t]: !checks[t] })} /><span className={checks[t] ? 'line-through text-slate-400' : ''}>{t}</span></label></li>)}</ul>
        <div className="mt-3 max-w-xs"><Progress value={(Object.values(checks).filter(Boolean).length / onboardingTemplate.length) * 100} tone="bg-ok" /></div>
      </Section>
    </div>
  );
}

export function HRPortal() {
  const { approvals, documents } = useHRData();
  const pend = approvals.filter((a) => a.status === 'รออนุมัติ').length;
  const unsigned = documents.filter((d) => d.status === 'รอลงนาม').length;
  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-bold">พอร์ทัลฝ่ายทรัพยากรบุคคล</h1><p className="text-sm text-slate-500">ศูนย์กลางจัดการพนักงาน เงินเดือน การสรรหา และเอกสาร</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><Stat label="พนักงาน" value={`${employees.length} คน`} icon={Users} tone="blue" /><Stat label="รออนุมัติ" value={`${pend}`} icon={Clock} tone="amber" /><Stat label="เอกสารรอลงนาม" value={`${unsigned}`} icon={FileSignature} tone="indigo" /><Stat label="ตำแหน่งเปิดรับ" value={`${jobs.length}`} icon={Briefcase} tone="green" /></div>
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
