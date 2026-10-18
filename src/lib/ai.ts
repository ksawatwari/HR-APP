import type { Candidate, Employee, JobPosting } from '@/types/hr';

/** คะแนนความเหมาะสมของผู้สมัคร (0-100): ทักษะ 70% + ประสบการณ์ 30% */
export function resumeMatch(c: Candidate, job: JobPosting) {
  const have = job.skills.filter((s) => c.skills.map((x) => x.toLowerCase()).includes(s.toLowerCase())).length;
  const skillPart = (have / job.skills.length) * 70;
  const expPart = Math.min(c.experienceYears / Math.max(job.minExp, 1), 1) * 30;
  return Math.round(skillPart + expPart);
}

export interface RiskResult { id: string; turnover: number; burnout: number; factors: string[] }
/** AI Predictive Radar (heuristic): ความเสี่ยงลาออก และภาวะหมดไฟ */
export function riskOf(e: Employee): RiskResult {
  const factors: string[] = [];
  let burnout = 10 + Math.max(0, e.otHoursMonth - 20) * 1.4 + Math.max(0, e.unusedLeaveDays - 8) * 3;
  if (e.otHoursMonth > 30) factors.push(`OT สูง ${e.otHoursMonth} ชม./เดือน`);
  if (e.unusedLeaveDays > 12) factors.push(`วันลาคงเหลือสะสม ${e.unusedLeaveDays} วัน (ไม่ได้พัก)`);
  let turnover = 10 + (100 - e.engagement) * 0.6 + Math.max(0, e.lastRaiseMonthsAgo - 12) * 1.6;
  if (e.engagement < 60) factors.push(`คะแนนความผูกพันต่ำ ${e.engagement}`);
  if (e.lastRaiseMonthsAgo > 15) factors.push(`ไม่ได้ปรับเงินเดือน ${e.lastRaiseMonthsAgo} เดือน`);
  if (e.tenureYears >= 3 && e.tenureYears <= 6) turnover += 6;
  turnover += burnout * 0.15;
  return { id: e.id, turnover: Math.min(98, Math.round(turnover)), burnout: Math.min(98, Math.round(burnout)), factors };
}

/** ผู้ช่วย HR AI — ตอบคำถามกฎหมายแรงงานไทยและนโยบายบริษัท (rule-based เดโม; เปลี่ยนเป็น LLM API ได้ที่ฟังก์ชันนี้) */
export function askHrAi(q: string): string {
  const t = q.toLowerCase();
  const has = (...k: string[]) => k.some((x) => t.includes(x));
  if (has('ลาป่วย')) return 'ตาม พ.ร.บ.คุ้มครองแรงงาน มาตรา 32 ลูกจ้างลาป่วยได้เท่าที่ป่วยจริง และได้รับค่าจ้างไม่เกิน 30 วันทำงานต่อปี หากลาเกิน 3 วันทำงานติดต่อกัน นายจ้างขอใบรับรองแพทย์ได้ ส่วนนโยบายบริษัทอนุญาตให้ลงนามใบรับรองแพทย์แบบดิจิทัลในเมนู "เอกสาร" ค่ะ';
  if (has('พักร้อน', 'หยุดพักผ่อน')) return 'ตามกฎหมาย (มาตรา 30) ลูกจ้างที่ทำงานครบ 1 ปีมีสิทธิหยุดพักผ่อนประจำปีไม่น้อยกว่า 6 วันทำงาน บริษัทเรามอบ 10 วันต่อปี และอนุมัติอัตโนมัติเมื่อลาไม่เกิน 3 วันและมียอดคงเหลือพอค่ะ';
  if (has('ลาคลอด')) return 'ลูกจ้างหญิงลาคลอดได้ 98 วัน (รวมวันหยุด) โดยนายจ้างจ่ายค่าจ้างไม่เกิน 45 วัน และสำนักงานประกันสังคมจ่ายอีก 45 วัน ตามมาตรา 41 ค่ะ';
  if (has('ot', 'ล่วงเวลา')) return 'อัตราค่าล่วงเวลาตามกฎหมาย: วันทำงานปกติ 1.5 เท่า, วันหยุด 2 เท่า (สำหรับลูกจ้างรายวัน) และทำล่วงเวลาในวันหยุด 3 เท่า ระบบ SiamHR คำนวณ OT อัตรา 1.5 / 2 / 3 เท่าให้อัตโนมัติ และต้องได้รับอนุมัติจากหัวหน้า 1 ขั้นก่อนค่ะ';
  if (has('ประกันสังคม')) return 'เงินสมทบประกันสังคมคิด 5% ของค่าจ้าง โดยฐานค่าจ้างสูงสุด 15,000 บาท จึงหักสูงสุด 750 บาทต่อเดือน (นายจ้างสมทบเท่ากัน) ค่ะ';
  if (has('ภาษี', 'ภงด', 'ภ.ง.ด')) return 'ภาษีเงินได้ (ภ.ง.ด.1) คำนวณจากเงินได้สุทธิ หลังหักค่าใช้จ่าย 50% (ไม่เกิน 100,000 บาท) และค่าลดหย่อน เช่น ส่วนตัว 60,000 บาท และประกันสังคม อัตราก้าวหน้า 0–35% ดูรายละเอียดได้ในสลิปเงินเดือนค่ะ';
  if (has('ลาออก', 'เลิกจ้าง', 'ชดเชย')) return 'ลูกจ้างที่ถูกเลิกจ้างโดยไม่มีความผิดมีสิทธิ์ได้ค่าชดเชยตามอายุงาน (มาตรา 118) เช่น ครบ 120 วัน = 30 วัน, ครบ 1 ปี = 90 วัน, ครบ 3 ปี = 180 วัน, ครบ 6 ปี = 240 วัน, ครบ 10 ปี = 300 วัน ส่วนการลาออกเอง ต้องแจ้งล่วงหน้าตามสัญญาจ้างค่ะ';
  if (has('เบิกเงินเดือน', 'ewa', 'ล่วงหน้า')) return 'เบิกเงินเดือนล่วงหน้า (EWA) ได้สูงสุด 50% ของรายได้ที่สะสมตามวันทำงานจริง ค่าธรรมเนียมครั้งละ 25 บาท และหักคืนอัตโนมัติในรอบเงินเดือนค่ะ';
  if (has('wfh', 'ไฮบริด', 'ทำงานที่บ้าน')) return 'นโยบายไฮบริดของบริษัทอนุญาตให้ทำงานที่บ้านได้สัปดาห์ละ 2 วัน โดยต้องแจ้งหัวหน้าล่วงหน้า และเช็กอินผ่านระบบทุกวันค่ะ';
  return 'ขอบคุณสำหรับคำถามค่ะ ฉันตอบเรื่องกฎหมายแรงงานไทย (ลา, OT, ประกันสังคม, ภาษี, ค่าชดเชย) และนโยบายบริษัท (EWA, ไฮบริด) ได้ ลองถามให้เจาะจงขึ้นอีกนิดนะคะ';
}
