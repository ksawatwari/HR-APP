'use client';
import { Banknote, Lightbulb, Radar, TrendingUp, UserMinus, Users } from 'lucide-react';
import { Badge, Card, Section, Stat, Tabs } from '@/components/ui';
import { departments, employees, monthlyTrend } from '@/data/mock';
import { baht } from '@/lib/payroll';
import { riskOf } from '@/lib/ai';
import { RadarPanel, payrollOf } from '@/components/modules';

function LineChart({ data, keyName, unit, color }: { data: typeof monthlyTrend; keyName: 'cost' | 'turnover'; unit: string; color: string }) {
  const vals = data.map((d) => d[keyName]); const min = Math.min(...vals) * 0.9, max = Math.max(...vals) * 1.05;
  const W = 400, H = 160, x = (i: number) => 20 + (i * (W - 40)) / (data.length - 1), y = (v: number) => H - 24 - ((v - min) / (max - min)) * (H - 50);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`แนวโน้ม ${keyName}`}>
      <polyline fill="none" stroke={color} strokeWidth="2.5" points={data.map((d, i) => `${x(i)},${y(d[keyName])}`).join(' ')} />
      {data.map((d, i) => <g key={d.m}><circle cx={x(i)} cy={y(d[keyName])} r="4" fill={color} /><text x={x(i)} y={y(d[keyName]) - 9} textAnchor="middle" fontSize="11" fill="#334155">{d[keyName]}{unit}</text><text x={x(i)} y={H - 6} textAnchor="middle" fontSize="11" fill="#64748B">{d.m}</text></g>)}
    </svg>
  );
}

export function ExecutivePortal() {
  const rows = employees.map((e) => payrollOf(e));
  const cost = rows.reduce((a, r) => a + r.gross, 0);
  const risky = employees.map(riskOf).filter((r) => r.turnover >= 60);
  const byDept = departments.map((d) => ({ d, cost: rows.filter((r) => employees.find((e) => e.id === r.employeeId)!.department === d).reduce((a, r) => a + r.gross, 0) }));
  const maxC = Math.max(...byDept.map((x) => x.cost));
  const last = monthlyTrend[monthlyTrend.length - 1], first = monthlyTrend[0];
  const insights = [
    { tone: 'red' as const, title: 'อัตราลาออกเพิ่มขึ้นต่อเนื่อง 6 เดือน', body: `จาก ${first.turnover}% เป็น ${last.turnover}% — ฝ่ายไอทีและฝ่ายขายเสี่ยงสูงสุด (${risky.length} คนในกลุ่มตัวอย่างอยู่ในระดับเสี่ยงสูง)`, action: 'แนะนำ: ทบทวนโครงสร้างเงินเดือนผู้ที่ไม่ได้ปรับเกิน 15 เดือน' },
    { tone: 'amber' as const, title: 'ต้นทุนแรงงานโตเร็วกว่าจำนวนพนักงาน', body: `ต้นทุนเพิ่ม ${(((last.cost - first.cost) / first.cost) * 100).toFixed(1)}% ขณะที่พนักงานเพิ่ม ${(((last.headcount - first.headcount) / first.headcount) * 100).toFixed(1)}% สาเหตุหลักคือ OT ฝ่ายไอที`, action: 'แนะนำ: เปิดรับวิศวกรเพิ่ม 2 อัตราเพื่อลด OT' },
    { tone: 'green' as const, title: 'ความผูกพันฝ่ายบัญชีและบุคคลอยู่ในเกณฑ์ดี', body: 'คะแนนความผูกพันเฉลี่ยสูงกว่า 78 ต่อเนื่อง ควรใช้เป็นต้นแบบการจัดการทีม', action: 'แนะนำ: ถอดบทเรียนแนวทางบริหารทีมให้ผู้จัดการท่านอื่น' },
  ];
  return (
    <div className="space-y-5">
      <div><h1 className="text-xl font-bold">พอร์ทัลผู้บริหาร · ภาพรวมองค์กร</h1><p className="text-sm text-slate-500">ข้อมูลล่าสุด ตุลาคม 2569</p></div>
      <Tabs tabs={[{ id: 'dash', label: 'แดชบอร์ดวิเคราะห์', icon: TrendingUp }, { id: 'insight', label: 'ข้อเสนอแนะจาก AI', icon: Lightbulb }, { id: 'radar', label: 'AI Radar', icon: Radar }]}>{(t) => (<>
        {t === 'dash' && <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="พนักงานทั้งหมด" value={`${last.headcount} คน`} hint={`+${last.headcount - first.headcount} ใน 6 เดือน`} icon={Users} tone="blue" />
            <Stat label="ต้นทุนแรงงาน/เดือน" value={`${last.cost} ล้านบาท`} icon={Banknote} tone="indigo" /><Stat label="อัตราลาออก" value={`${last.turnover}%`} hint="สูงขึ้นจากเดือนก่อน" icon={UserMinus} tone="red" />
            <Stat label="ต้นทุนกลุ่มตัวอย่าง (15 คน)" value={baht(cost)} icon={Banknote} tone="green" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Section title="แนวโน้มต้นทุนแรงงาน (ล้านบาท)"><LineChart data={monthlyTrend} keyName="cost" unit="" color="#1E40AF" /></Section>
            <Section title="แนวโน้มอัตราลาออก (%)"><LineChart data={monthlyTrend} keyName="turnover" unit="%" color="#DC2626" /></Section>
          </div>
          <Section title="ต้นทุนแรงงานตามแผนก (กลุ่มตัวอย่าง)"><div className="space-y-3">{byDept.map((x) => <div key={x.d}><div className="flex justify-between text-sm mb-1 gap-3"><span>{x.d}</span><b>{baht(x.cost)}</b></div><div className="h-3 rounded bg-slate-100"><div className="h-full rounded bg-tech" style={{ width: `${(x.cost / maxC) * 100}%` }} /></div></div>)}</div></Section>
        </div>}
        {t === 'insight' && <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">{insights.map((i) => <Card key={i.title} className="p-4 space-y-2"><Badge tone={i.tone}>{i.tone === 'red' ? 'ความเสี่ยง' : i.tone === 'amber' ? 'ควรจับตา' : 'โอกาส'}</Badge><h3 className="font-semibold">{i.title}</h3><p className="text-sm text-slate-600 leading-relaxed">{i.body}</p><p className="text-sm font-medium text-tech">{i.action}</p></Card>)}</div>}
        {t === 'radar' && <RadarPanel />}
      </>)}</Tabs>
    </div>
  );
}
