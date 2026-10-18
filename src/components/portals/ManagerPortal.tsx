'use client';
import { CheckSquare, Gift, LayoutDashboard, MapPin, Target, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useHRData } from '@/context/HRDataContext';
import { Avatar, Badge, Progress, Section, Stat, Table, Td, Tabs } from '@/components/ui';
import { employees, getEmp, objectives } from '@/data/mock';
import { baht } from '@/lib/payroll';
import { ApprovalsPanel, AttendancePanel, KudosPanel, OkrPanel, summarize } from '@/components/modules';
import { riskOf } from '@/lib/ai';

export function ManagerPortal() {
  const { user } = useAuth();
  const { approvals } = useHRData();
  if (!user) return null;
  const me = getEmp(user.employeeId);
  const team = employees.filter((e) => e.managerId === me.id);
  const pending = approvals.filter((a) => a.status === 'รออนุมัติ' && getEmp(a.employeeId).managerId === me.id).length;
  const salesTotal = team.reduce((a, e) => a + e.salesThisMonth, 0) + me.salesThisMonth;
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4"><Avatar name={me.name} size="h-14 w-14 text-xl" /><div><h1 className="text-xl font-bold">พอร์ทัลผู้จัดการ · {me.name}</h1><p className="text-sm text-slate-500">{me.position} · ลูกทีม {team.length} คน</p></div></div>
      <Tabs tabs={[
        { id: 'team', label: 'ภาพรวมทีม', icon: LayoutDashboard }, { id: 'appr', label: 'อนุมัติ', icon: CheckSquare, badge: pending }, { id: 'att', label: 'ลงเวลาของฉัน', icon: MapPin },
        { id: 'okr', label: 'OKR ทีม', icon: Target }, { id: 'kudos', label: 'Kudos', icon: Gift },
      ]}>{(t) => (
        <>
          {t === 'team' && <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat label="สมาชิกทีม" value={`${team.length} คน`} icon={Users} tone="blue" /><Stat label="รออนุมัติ" value={`${pending} รายการ`} icon={CheckSquare} tone={pending ? 'amber' : 'green'} />
              <Stat label="ยอดขายทีมเดือนนี้" value={baht(salesTotal)} icon={Target} tone="green" /><Stat label="OT รวมทีม" value={`${team.reduce((a, e) => a + e.otHoursMonth, 0)} ชม.`} icon={MapPin} tone="indigo" />
            </div>
            <Section title="สถานะลูกทีม"><Table head={['พนักงาน', 'ตำแหน่ง', 'มาสาย (นาที)', 'OT (ชม.)', 'ความผูกพัน', 'ความเสี่ยงหมดไฟ']}>{team.map((e) => { const r = riskOf(e); return (
              <tr key={e.id}><Td><div className="flex items-center gap-2"><Avatar name={e.name} size="h-8 w-8" />{e.name}</div></Td><Td>{e.position}</Td><Td>{summarize(e.id).late}</Td><Td>{e.otHoursMonth}</Td>
                <Td className="min-w-[8rem]"><Progress value={e.engagement} tone={e.engagement < 60 ? 'bg-red-500' : 'bg-ok'} /></Td><Td>{r.burnout >= 60 ? <Badge tone="red">สูง {r.burnout}%</Badge> : r.burnout >= 40 ? <Badge tone="amber">ปานกลาง</Badge> : <Badge tone="green">ต่ำ</Badge>}</Td></tr>); })}</Table></Section>
          </div>}
          {t === 'appr' && <ApprovalsPanel teamOnly={me.id} />}
          {t === 'att' && <AttendancePanel empId={me.id} />}
          {t === 'okr' && <div className="space-y-4"><Section title="ความคืบหน้า OKR ของลูกทีม"><Table head={['พนักงาน', 'เป้าหมาย', 'ความคืบหน้า']}>{objectives.map((o) => { const avg = Math.round(o.keyResults.reduce((a, k) => a + k.progress, 0) / o.keyResults.length); return <tr key={o.id}><Td>{getEmp(o.employeeId).name}</Td><Td className="whitespace-normal">{o.title}</Td><Td className="min-w-[9rem]"><div className="flex items-center gap-2"><div className="flex-1"><Progress value={avg} /></div><b>{avg}%</b></div></Td></tr>; })}</Table></Section><OkrPanel empId="E004" /></div>}
          {t === 'kudos' && <KudosPanel empId={me.id} />}
        </>)}</Tabs>
    </div>
  );
}
