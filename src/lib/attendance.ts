import { attendanceByEmp } from '@/data/mock';

export function summarize(empId: string) {
  const recs = attendanceByEmp[empId] ?? [];
  const ot: Record<'1.5' | '2' | '3', number> = { '1.5': 0, '2': 0, '3': 0 };
  let late = 0, early = 0, worked = 0;
  recs.forEach((r) => {
    late += r.lateMin;
    early += r.earlyMin;
    (['1.5', '2', '3'] as const).forEach((k) => (ot[k] += r.otHours[k] ?? 0));
    if (r.checkIn) worked++;
  });
  return { late, early, ot, worked, recs };
}
