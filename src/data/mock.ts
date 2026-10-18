import type { AttendanceRecord, Candidate, Employee, HRDocument, JobPosting, Kudos, LeaveRequest, Objective, OTRule, Shift, ApprovalItem, EwaRequest } from '@/types/hr';

export const COMPANY = 'บริษัท สยามดิจิทัล จำกัด';
export const CURRENT_MONTH = 'ตุลาคม 2569';
export const TODAY = '2026-10-18';

const E = (id: string, name: string, position: string, department: Employee['department'], salary: number, managerId: string | null,
  shiftId: string, startDate: string, extra: Partial<Employee> = {}): Employee => ({
  id, name, position, department, salary, managerId, shiftId, startDate,
  email: id === 'E001' ? 'ceo@siamdigital.co.th' : id === 'E002' ? 'manager@siamdigital.co.th' : id === 'E003' ? 'hr@siamdigital.co.th' : id === 'E004' ? 'employee@siamdigital.co.th' : `${id.toLowerCase()}@siamdigital.co.th`,
  phone: `08${(1 + Number(id.slice(1)) % 9)}-${String(100 + Number(id.slice(1)) * 37).slice(0, 3)}-${String(1000 + Number(id.slice(1)) * 211).slice(0, 4)}`,
  salesThisMonth: 0, otHoursMonth: 0, unusedLeaveDays: 8, engagement: 78, tenureYears: 3, lastRaiseMonthsAgo: 10, ...extra,
});

export const employees: Employee[] = [
  E('E001', 'ธนพล เจริญกิจ', 'ประธานเจ้าหน้าที่บริหาร (CEO)', 'ผู้บริหาร', 250000, null, 'S1', '2015-03-01', { engagement: 88, tenureYears: 11, unusedLeaveDays: 14 }),
  E('E002', 'วิชัย ศรีสุวรรณ', 'ผู้จัดการฝ่ายขาย', 'ฝ่ายขาย', 85000, 'E001', 'S1', '2018-06-15', { salesThisMonth: 420000, otHoursMonth: 14, engagement: 74, tenureYears: 8, unusedLeaveDays: 12, lastRaiseMonthsAgo: 16 }),
  E('E003', 'ปราณี มีสุข', 'ผู้จัดการฝ่ายทรัพยากรบุคคล', 'ฝ่ายทรัพยากรบุคคล', 70000, 'E001', 'S1', '2019-02-01', { engagement: 82, tenureYears: 7 }),
  E('E004', 'นภัสสร วงศ์สวัสดิ์', 'เจ้าหน้าที่ขายอาวุโส', 'ฝ่ายขาย', 38000, 'E002', 'S1', '2021-04-12', { salesThisMonth: 235000, otHoursMonth: 10, engagement: 85, tenureYears: 5, unusedLeaveDays: 9 }),
  E('E005', 'กิตติพงษ์ แสงทอง', 'เจ้าหน้าที่ขาย', 'ฝ่ายขาย', 28000, 'E002', 'S6', '2023-01-09', { salesThisMonth: 118000, otHoursMonth: 32, engagement: 52, tenureYears: 3, unusedLeaveDays: 13, lastRaiseMonthsAgo: 22 }),
  E('E006', 'อรอุมา พิทักษ์กุล', 'เจ้าหน้าที่ขาย', 'ฝ่ายขาย', 26000, 'E002', 'S1', '2024-05-20', { salesThisMonth: 86000, otHoursMonth: 6, engagement: 80, tenureYears: 2, unusedLeaveDays: 6 }),
  E('E007', 'ธีรภัทร ลิมป์ปัญญา', 'ผู้จัดการฝ่ายไอที', 'ฝ่ายไอที', 92000, 'E001', 'S1', '2017-08-01', { otHoursMonth: 18, engagement: 70, tenureYears: 9, unusedLeaveDays: 11 }),
  E('E008', 'ศุภชัย บุญเรือง', 'วิศวกรซอฟต์แวร์อาวุโส', 'ฝ่ายไอที', 55000, 'E007', 'S6', '2020-10-05', { otHoursMonth: 46, engagement: 48, tenureYears: 6, unusedLeaveDays: 15, lastRaiseMonthsAgo: 20 }),
  E('E009', 'พิมพ์ลดา จันทร์เพ็ญ', 'วิศวกรซอฟต์แวร์', 'ฝ่ายไอที', 48000, 'E007', 'S1', '2022-03-14', { otHoursMonth: 22, engagement: 66, tenureYears: 4, unusedLeaveDays: 10 }),
  E('E010', 'สุรชัย มั่นคง', 'ผู้จัดการฝ่ายบัญชีการเงิน', 'ฝ่ายบัญชีการเงิน', 78000, 'E001', 'S1', '2016-11-01', { engagement: 79, tenureYears: 10, otHoursMonth: 8 }),
  E('E011', 'ชลธิชา อินทรประเสริฐ', 'นักบัญชี', 'ฝ่ายบัญชีการเงิน', 32000, 'E010', 'S1', '2022-07-18', { engagement: 76, tenureYears: 4, otHoursMonth: 12 }),
  E('E012', 'ณัฐวุฒิ ทองดี', 'ผู้จัดการฝ่ายปฏิบัติการ', 'ฝ่ายปฏิบัติการ', 72000, 'E001', 'S2', '2018-01-08', { otHoursMonth: 20, engagement: 72, tenureYears: 8 }),
  E('E013', 'วราภรณ์ สุขสวัสดิ์', 'เจ้าหน้าที่ปฏิบัติการ (กะ)', 'ฝ่ายปฏิบัติการ', 24000, 'E012', 'S4', '2023-09-04', { otHoursMonth: 38, engagement: 58, tenureYears: 3, unusedLeaveDays: 12, lastRaiseMonthsAgo: 18 }),
  E('E014', 'ปิยะพร รุ่งเรือง', 'ผู้จัดการฝ่ายการตลาด', 'ฝ่ายการตลาด', 68000, 'E001', 'S1', '2019-09-02', { engagement: 81, tenureYears: 7, otHoursMonth: 9 }),
  E('E015', 'อนุชา เพชรมณี', 'นักออกแบบกราฟิก', 'ฝ่ายการตลาด', 30000, 'E014', 'S5', '2024-02-12', { engagement: 77, tenureYears: 2, otHoursMonth: 15 }),
];

export const getEmp = (id: string) => employees.find((e) => e.id === id)!;
export const departments = Array.from(new Set(employees.map((e) => e.department)));

export const shifts: Shift[] = [
  { id: 'S1', name: 'กะปกติ', start: '09:00', end: '18:00', crossDay: false, note: 'พักเที่ยง 1 ชม.' },
  { id: 'S2', name: 'กะเช้า', start: '06:00', end: '14:00', crossDay: false, note: 'พัก 30 นาที' },
  { id: 'S3', name: 'กะบ่าย', start: '14:00', end: '22:00', crossDay: false, note: 'พัก 30 นาที' },
  { id: 'S4', name: 'กะดึก (ข้ามวัน)', start: '22:00', end: '06:00', crossDay: true, note: 'สิ้นสุดวันถัดไป · ค่ากะดึก' },
  { id: 'S5', name: 'กะแบ่ง (Split Shift)', start: '08:00', end: '20:00', crossDay: false, split: [{ start: '08:00', end: '12:00' }, { start: '16:00', end: '20:00' }], note: 'ทำงาน 2 ช่วง พักกลางวันยาว' },
  { id: 'S6', name: 'กะยืดหยุ่น', start: '10:00', end: '19:00', crossDay: false, note: 'เข้าได้ 10:00–11:00' },
];
export const getShift = (id: string) => shifts.find((s) => s.id === id)!;

export const otRules: OTRule[] = [
  { rate: 1.5, label: 'OT วันทำงานปกติ', description: 'ทำงานเกินเวลาปกติในวันทำงาน' },
  { rate: 2, label: 'OT วันหยุดประจำสัปดาห์', description: 'ทำงานในวันหยุดประจำสัปดาห์' },
  { rate: 3, label: 'OT วันหยุดนักขัตฤกษ์ / เกินเวลาในวันหยุด', description: 'ทำงานล่วงเวลาในวันหยุด' },
];

const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));

/** สร้างข้อมูลลงเวลาเดือนตุลาคม 2569 (วันที่ 1–16) แบบกำหนดค่าตายตัว */
export function buildAttendance(employeeId: string): AttendanceRecord[] {
  const emp = getEmp(employeeId);
  const sh = getShift(emp.shiftId);
  const n = Number(employeeId.slice(1));
  const out: AttendanceRecord[] = [];
  for (let d = 1; d <= 16; d++) {
    const date = `2026-10-${String(d).padStart(2, '0')}`;
    const dow = new Date(date + 'T00:00:00').getDay();
    if (dow === 0 || dow === 6) { out.push({ id: `${employeeId}-${date}`, employeeId, date, checkIn: null, checkOut: null, shiftId: sh.id, lateMin: 0, earlyMin: 0, otHours: {}, status: 'วันหยุด' }); continue; }
    if ((d * 3 + n) % 11 === 0) { out.push({ id: `${employeeId}-${date}`, employeeId, date, checkIn: null, checkOut: null, shiftId: sh.id, lateMin: 0, earlyMin: 0, otHours: {}, status: 'ลา' }); continue; }
    const late = (d * 5 + n * 3) % 7 === 0 ? 8 + ((d + n) % 4) * 6 : 0;
    const early = (d * 2 + n) % 13 === 0 ? 20 : 0;
    const ot = (d + n) % 4 === 0 ? 1 + ((d + n) % 3) : 0;
    const inM = toMin(sh.start) + late - ((d + n) % 5);
    const outM = toMin(sh.end) - early + ot * 60;
    out.push({
      id: `${employeeId}-${date}`, employeeId, date, checkIn: hhmm(inM % 1440), checkOut: hhmm(((outM % 1440) + 1440) % 1440), shiftId: sh.id,
      lateMin: late, earlyMin: early, otHours: ot ? { '1.5': ot } : {}, status: late ? 'สาย' : early ? 'ออกก่อน' : 'ปกติ',
      geo: { lat: 13.7563 + (n % 5) * 0.00002, lng: 100.5018, accuracyM: 8 + (n % 6), insideFence: true },
    });
  }
  return out;
}
export const attendanceByEmp: Record<string, AttendanceRecord[]> = Object.fromEntries(employees.map((e) => [e.id, buildAttendance(e.id)]));

export const officeGeofence = { name: 'สำนักงานใหญ่ อาคารสยามทาวเวอร์ ชั้น 18', lat: 13.7563, lng: 100.5018, radiusM: 150 };

export const initialLeaves: LeaveRequest[] = [
  { id: 'L001', employeeId: 'E004', type: 'ลาพักร้อน', from: '2026-09-21', to: '2026-09-22', days: 2, reason: 'ท่องเที่ยวกับครอบครัว', status: 'อนุมัติอัตโนมัติ', createdAt: '2026-09-10' },
  { id: 'L002', employeeId: 'E005', type: 'ลากิจ', from: '2026-10-22', to: '2026-10-24', days: 3, reason: 'ธุระที่ต่างจังหวัด', status: 'รออนุมัติ', createdAt: '2026-10-16' },
];
export const leaveBalances = { ลาพักร้อน: 10, ลาป่วย: 30, ลากิจ: 6, ลาคลอด: 98 } as const;

export const initialApprovals: ApprovalItem[] = [
  { id: 'A001', kind: 'OT', employeeId: 'E004', title: 'ขอทำ OT ปิดดีลลูกค้า', detail: '15 ต.ค. 18:00–21:00 (3 ชม. × 1.5)', amount: 3 * 1.5 * (38000 / 240), status: 'รออนุมัติ' },
  { id: 'A002', kind: 'ค่าใช้จ่าย', employeeId: 'E006', title: 'ค่าเดินทางพบลูกค้า จ.ชลบุรี', detail: 'ค่าน้ำมัน + ทางด่วน 14 ต.ค.', amount: 1280, status: 'รออนุมัติ' },
  { id: 'A003', kind: 'OT', employeeId: 'E005', title: 'ขอทำ OT เตรียมข้อเสนอประมูล', detail: '17 ต.ค. (เสาร์) 09:00–13:00 (4 ชม. × 2)', amount: 4 * 2 * (28000 / 240), status: 'รออนุมัติ' },
  { id: 'A004', kind: 'ค่าใช้จ่าย', employeeId: 'E004', title: 'ค่ารับรองลูกค้า', detail: 'มื้อกลางวัน 4 ท่าน ร้านอาหารไทย', amount: 2450, status: 'รออนุมัติ' },
];

export const jobs: JobPosting[] = [
  { id: 'J1', title: 'นักพัฒนา Full-Stack (Next.js)', department: 'ฝ่ายไอที', openings: 2, skills: ['Next.js', 'TypeScript', 'Firebase', 'Tailwind'], minExp: 3, status: 'เปิดรับ' },
  { id: 'J2', title: 'ผู้จัดการบัญชีลูกค้าองค์กร', department: 'ฝ่ายขาย', openings: 1, skills: ['B2B Sales', 'การเจรจา', 'CRM', 'ภาษาอังกฤษ'], minExp: 4, status: 'เปิดรับ' },
  { id: 'J3', title: 'นักการตลาดดิจิทัล', department: 'ฝ่ายการตลาด', openings: 1, skills: ['SEO', 'Google Ads', 'Content', 'Analytics'], minExp: 2, status: 'เปิดรับ' },
];

export const initialCandidates: Candidate[] = [
  { id: 'C1', name: 'ภูมิพัฒน์ วัฒนากุล', jobId: 'J1', stage: 'สัมภาษณ์', skills: ['Next.js', 'TypeScript', 'Firebase', 'Tailwind', 'Node.js'], experienceYears: 5, expectedSalary: 65000, summary: 'เคยพัฒนาระบบ SaaS ให้ลูกค้า 3 ราย' },
  { id: 'C2', name: 'กัญญารัตน์ สุวรรณชาติ', jobId: 'J1', stage: 'คัดกรอง', skills: ['React', 'TypeScript', 'Tailwind'], experienceYears: 3, expectedSalary: 52000, summary: 'ประสบการณ์ฟรอนต์เอนด์ในสตาร์ทอัป' },
  { id: 'C3', name: 'เอกชัย ปัญญาดี', jobId: 'J1', stage: 'สมัครใหม่', skills: ['PHP', 'Laravel', 'MySQL'], experienceYears: 6, expectedSalary: 58000, summary: 'ถนัดงานหลังบ้านและฐานข้อมูล' },
  { id: 'C4', name: 'ธัญญลักษณ์ เกษมสุข', jobId: 'J2', stage: 'เสนอเงินเดือน', skills: ['B2B Sales', 'การเจรจา', 'CRM', 'ภาษาอังกฤษ'], experienceYears: 7, expectedSalary: 75000, summary: 'ปิดยอดขายองค์กรเฉลี่ย 8 ล้านบาทต่อปี' },
  { id: 'C5', name: 'ศิรสิทธิ์ ภักดีวงศ์', jobId: 'J2', stage: 'สัมภาษณ์', skills: ['การเจรจา', 'CRM', 'Retail Sales'], experienceYears: 4, expectedSalary: 55000, summary: 'มาจากสายขายปลีก ต้องการเปลี่ยนมา B2B' },
  { id: 'C6', name: 'มณีรัตน์ ชัยมงคล', jobId: 'J3', stage: 'สมัครใหม่', skills: ['SEO', 'Content', 'Analytics', 'Google Ads'], experienceYears: 2, expectedSalary: 34000, summary: 'ดูแลแคมเปญเติบโต 40% ภายใน 6 เดือน' },
  { id: 'C7', name: 'วรเมธ อัศวเดช', jobId: 'J3', stage: 'รับเข้าทำงาน', skills: ['SEO', 'Content', 'Google Ads'], experienceYears: 3, expectedSalary: 38000, summary: 'เริ่มงาน 1 พ.ย. 2569' },
];
export const onboardingTemplate = ['ลงนามสัญญาจ้าง', 'ส่งเอกสารส่วนตัว (สำเนาบัตร/ทะเบียนบ้าน)', 'สร้างอีเมลและบัญชีระบบ', 'ออกบัตรพนักงานและมอบอุปกรณ์', 'อบรมปฐมนิเทศและนโยบายบริษัท', 'พบหัวหน้าทีมและวางเป้าหมาย 30-60-90 วัน'];

export const initialDocuments: HRDocument[] = [
  { id: 'D1', title: 'นโยบายความปลอดภัยของข้อมูล (PDPA) ฉบับปี 2569', category: 'นโยบาย', assigneeId: 'E004', status: 'รอลงนาม' },
  { id: 'D2', title: 'ใบรับรองแพทย์ (ลาป่วย 2 วัน) — 3-4 ก.ย. 2569', category: 'ใบรับรองแพทย์', assigneeId: 'E004', status: 'ลงนามแล้ว', signedAt: '2026-09-05 09:12', signature: 'นภัสสร วงศ์สวัสดิ์' },
  { id: 'D3', title: 'ข้อตกลงการทำงานแบบไฮบริด', category: 'สัญญา', assigneeId: 'E004', status: 'รอลงนาม' },
  { id: 'D4', title: 'นโยบายความปลอดภัยของข้อมูล (PDPA) ฉบับปี 2569', category: 'นโยบาย', assigneeId: 'E005', status: 'รอลงนาม' },
  { id: 'D5', title: 'นโยบายความปลอดภัยของข้อมูล (PDPA) ฉบับปี 2569', category: 'นโยบาย', assigneeId: 'E008', status: 'ลงนามแล้ว', signedAt: '2026-10-02 14:20', signature: 'ศุภชัย บุญเรือง' },
];

export const kudosBadges = ['ทำงานเป็นทีม', 'ลูกค้าต้องมาก่อน', 'คิดนอกกรอบ', 'ช่วยเหลือเพื่อนร่วมงาน', 'ส่งมอบตรงเวลา'];
export const initialKudos: Kudos[] = [
  { id: 'K1', fromId: 'E002', toId: 'E004', badge: 'ลูกค้าต้องมาก่อน', message: 'ขอบคุณที่ดูแลลูกค้ารายใหญ่จนปิดดีลได้ก่อนกำหนด', createdAt: '2026-10-14' },
  { id: 'K2', fromId: 'E006', toId: 'E004', badge: 'ช่วยเหลือเพื่อนร่วมงาน', message: 'ช่วยสอนใช้ระบบ CRM ใหม่อย่างใจเย็นมากค่ะ', createdAt: '2026-10-09' },
  { id: 'K3', fromId: 'E009', toId: 'E008', badge: 'ส่งมอบตรงเวลา', message: 'แก้บั๊กด่วนข้ามคืนจนระบบกลับมาใช้งานได้ตามปกติ', createdAt: '2026-10-12' },
];

export const objectives: Objective[] = [
  { id: 'O1', employeeId: 'E004', title: 'เพิ่มยอดขายองค์กรไตรมาส 4', keyResults: [
    { id: 'KR1', text: 'ปิดยอดขายสะสม 700,000 บาท', progress: 68 }, { id: 'KR2', text: 'เพิ่มลูกค้าองค์กรรายใหม่ 5 ราย', progress: 60 }, { id: 'KR3', text: 'อัตราต่อสัญญา ≥ 85%', progress: 90 }] },
  { id: 'O2', employeeId: 'E004', title: 'พัฒนาทักษะการนำเสนอ', keyResults: [{ id: 'KR4', text: 'ผ่านอบรม Presentation Skills 1 หลักสูตร', progress: 100 }, { id: 'KR5', text: 'นำเสนอต่อลูกค้า C-Level 3 ครั้ง', progress: 33 }] },
];
export const initialEwa: EwaRequest[] = [{ id: 'W1', employeeId: 'E004', amount: 3000, fee: 25, status: 'โอนแล้ว', createdAt: '2026-10-05' }];

export const permissionModules = ['ข้อมูลพนักงาน', 'ลงเวลา/กะ', 'เงินเดือน', 'สรรหา (ATS)', 'อนุมัติลา/OT', 'เอกสาร e-Sign', 'แดชบอร์ดผู้บริหาร', 'ตั้งค่าสิทธิ์'];
export const initialPermissions: Record<string, Record<string, boolean>> = {
  employee: { 'ข้อมูลพนักงาน': true, 'ลงเวลา/กะ': true, 'เอกสาร e-Sign': true },
  manager: { 'ข้อมูลพนักงาน': true, 'ลงเวลา/กะ': true, 'อนุมัติลา/OT': true, 'เอกสาร e-Sign': true },
  hr: { 'ข้อมูลพนักงาน': true, 'ลงเวลา/กะ': true, 'เงินเดือน': true, 'สรรหา (ATS)': true, 'อนุมัติลา/OT': true, 'เอกสาร e-Sign': true, 'ตั้งค่าสิทธิ์': true },
  executive: { 'ข้อมูลพนักงาน': true, 'เงินเดือน': true, 'แดชบอร์ดผู้บริหาร': true, 'ลงเวลา/กะ': true, 'อนุมัติลา/OT': true },
};
export const monthlyTrend = [
  { m: 'พ.ค.', cost: 4.12, headcount: 142, turnover: 1.8 }, { m: 'มิ.ย.', cost: 4.18, headcount: 144, turnover: 1.6 }, { m: 'ก.ค.', cost: 4.31, headcount: 147, turnover: 2.2 },
  { m: 'ส.ค.', cost: 4.40, headcount: 149, turnover: 2.9 }, { m: 'ก.ย.', cost: 4.52, headcount: 151, turnover: 3.1 }, { m: 'ต.ค.', cost: 4.61, headcount: 152, turnover: 3.4 },
];
