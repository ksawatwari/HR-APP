import type { Employee, OTBreakdown, PayrollRecord } from '@/types/hr';

export const WORKING_DAYS = 26;
export const baht = (n: number) => '฿' + Math.round(n).toLocaleString('th-TH');

/** ประกันสังคม 5% ของเงินเดือน สูงสุด 750 บาท/เดือน */
export const socialSecurity = (salary: number) => Math.min(Math.round(salary * 0.05), 750);

/** คอมมิชชันแบบขั้นบันได (marginal): ≤100k=2%, 100k–300k=4%, >300k=6% */
export const commissionTiers = [
  { upTo: 100_000, rate: 0.02 }, { upTo: 300_000, rate: 0.04 }, { upTo: Infinity, rate: 0.06 },
];
export function commission(sales: number) {
  let prev = 0, total = 0;
  for (const t of commissionTiers) {
    if (sales > prev) total += (Math.min(sales, t.upTo) - prev) * t.rate;
    prev = t.upTo;
  }
  return Math.round(total);
}

/** ภาษีเงินได้บุคคลธรรมดา (อัตราก้าวหน้า) สำหรับ ภ.ง.ด.1 */
const brackets = [
  { upTo: 150_000, rate: 0 }, { upTo: 300_000, rate: 0.05 }, { upTo: 500_000, rate: 0.1 }, { upTo: 750_000, rate: 0.15 },
  { upTo: 1_000_000, rate: 0.2 }, { upTo: 2_000_000, rate: 0.25 }, { upTo: 5_000_000, rate: 0.3 }, { upTo: Infinity, rate: 0.35 },
];
export function annualTax(annualGross: number, annualSso: number) {
  const expense = Math.min(annualGross * 0.5, 100_000);
  const personal = 60_000;
  const taxable = Math.max(0, annualGross - expense - personal - annualSso);
  let prev = 0, tax = 0;
  for (const b of brackets) {
    if (taxable > prev) tax += (Math.min(taxable, b.upTo) - prev) * b.rate;
    prev = b.upTo;
  }
  return Math.round(tax);
}

export const hourlyRate = (salary: number) => salary / 30 / 8;
export const minuteRate = (salary: number) => hourlyRate(salary) / 60;

export function computePayroll(
  e: Employee, month: string, lateMin: number, earlyMin: number, ot: OTBreakdown, ewaDeduction = 0,
): PayrollRecord {
  const comm = commission(e.salesThisMonth);
  const otPay = Object.entries(ot).reduce((s, [r, h]) => s + (h ?? 0) * Number(r) * hourlyRate(e.salary), 0);
  const gross = e.salary + comm + otPay;
  const sso = socialSecurity(e.salary);
  const tax = Math.round(annualTax(gross * 12, sso * 12) / 12);
  const lateDeduction = Math.round((lateMin + earlyMin) * minuteRate(e.salary));
  const totalDeduction = sso + tax + lateDeduction + ewaDeduction;
  return {
    employeeId: e.id, month, baseSalary: e.salary, commission: comm, otPay: Math.round(otPay), gross: Math.round(gross),
    lateDeduction, socialSecurity: sso, withholdingTax: tax, ewaDeduction, totalDeduction, net: Math.round(gross - totalDeduction),
  };
}

/** Earned Wage Access: เบิกได้ไม่เกิน 50% ของรายได้ที่ได้รับแล้วตามวันทำงานจริง */
export function ewaAvailable(salary: number, workedDays: number, alreadyAdvanced: number) {
  const earned = (salary / WORKING_DAYS) * workedDays;
  return Math.max(0, Math.floor(earned * 0.5 - alreadyAdvanced));
}
export const EWA_FEE = 25;
