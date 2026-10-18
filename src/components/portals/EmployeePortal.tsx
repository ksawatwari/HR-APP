'use client';
import { CalendarCheck, FileSignature, Gift, Home, MapPin, Receipt, Target, Wallet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useHRData } from '@/context/HRDataContext';
import { Avatar, Badge, Card, Section, Stat, Tabs } from '@/components/ui';
import { getEmp, getShift, CURRENT_MONTH } from '@/data/mock';
import { baht } from '@/lib/payroll';
import { AttendancePanel, DocumentsPanel, EwaPanel, KudosPanel, LeavePanel, OkrPanel, PayslipPanel, payrollOf, summarize } from '@/components/modules';

export function EmployeePortal() {
  const { user } = useAuth();
  const { documents, leaves } = useHRData();
  if (!user) return null;
  const emp = getEmp(user.employeeId), sh = getShift(emp.shiftId), p = payrollOf(emp), s = summarize(emp.id);
  const pendingDocs = documents.filter((d) => d.assigneeId === emp.id && d.status === 'รอลงนาม').length;
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4"><Avatar name={emp.name} size="h-14 w-14 text-xl" /><div><h1 className="text-xl font-bold">สวัสดี คุณ{emp.name.split(' ')[0]}</h1><p className="text-sm text-slate-500">{emp.position} · {emp.department} · รหัส {emp.id}</p></div></div>
      <Tabs tabs={[
        { id: 'home', label: 'ภาพรวม', icon: Home }, { id: 'att', label: 'ลงเวลา', icon: MapPin }, { id: 'pay', label: 'สลิปเงินเดือน', icon: Receipt },
        { id: 'leave', label: 'การลา', icon: CalendarCheck }, { id: 'ewa', label: 'เบิกล่วงหน้า (EWA)', icon: Wallet }, { id: 'okr', label: 'เป้าหมาย OKR', icon: Target },
        { id: 'kudos', label: 'Kudos', icon: Gift }, { id: 'docs', label: 'เอกสาร', icon: FileSignature, badge: pendingDocs },
      ]}>{(t) => (
        <>
          {t === 'home' && <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat label={`เงินสุทธิ ${CURRENT_MONTH}`} value={baht(p.net)} icon={Receipt} tone="green" hint="โอนวันที่ 25" />
              <Stat label="วันทำงานเดือนนี้" value={`${s.worked} วัน`} icon={CalendarCheck} tone="blue" />
              <Stat label="ชั่วโมง OT" value={`${s.ot['1.5'] + s.ot['2'] + s.ot['3']} ชม.`} hint={`รับ ${baht(p.otPay)}`} icon={Target} tone="indigo" />
              <Stat label="เอกสารรอลงนาม" value={`${pendingDocs} ฉบับ`} icon={FileSignature} tone={pendingDocs ? 'amber' : 'green'} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Section title="กะการทำงานของฉัน"><p className="text-2xl font-bold text-brand">{sh.name}</p><p className="text-slate-600">{sh.start}–{sh.end} น. {sh.crossDay && '(ข้ามวัน)'}</p><p className="text-sm text-slate-500 mt-1">{sh.note}</p></Section>
              <Section title="คำขอลาล่าสุด">{leaves.filter((l) => l.employeeId === emp.id).slice(0, 3).map((l) => <div key={l.id} className="flex justify-between gap-2 py-1.5 text-sm"><span>{l.type} {l.days} วัน</span><Badge tone={l.status === 'รออนุมัติ' ? 'amber' : 'green'}>{l.status}</Badge></div>)}</Section>
            </div>
          </div>}
          {t === 'att' && <AttendancePanel empId={emp.id} />}
          {t === 'pay' && <PayslipPanel empId={emp.id} />}
          {t === 'leave' && <LeavePanel empId={emp.id} />}
          {t === 'ewa' && <EwaPanel empId={emp.id} />}
          {t === 'okr' && <OkrPanel empId={emp.id} />}
          {t === 'kudos' && <KudosPanel empId={emp.id} />}
          {t === 'docs' && <DocumentsPanel empId={emp.id} />}
        </>)}</Tabs>
    </div>
  );
}
