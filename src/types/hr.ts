export type Role = 'employee' | 'manager' | 'hr' | 'executive';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  employeeId: string;
}

export type Department = 'ผู้บริหาร' | 'ฝ่ายขาย' | 'ฝ่ายไอที' | 'ฝ่ายทรัพยากรบุคคล' | 'ฝ่ายบัญชีการเงิน' | 'ฝ่ายปฏิบัติการ' | 'ฝ่ายการตลาด';

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: Department;
  email: string;
  phone: string;
  salary: number;
  managerId: string | null;
  shiftId: string;
  startDate: string;
  salesThisMonth: number;
  otHoursMonth: number;
  unusedLeaveDays: number;
  engagement: number;
  tenureYears: number;
  lastRaiseMonthsAgo: number;
}

export interface Shift {
  id: string;
  name: string;
  start: string;
  end: string;
  crossDay: boolean;
  split?: { start: string; end: string }[];
  note: string;
}

export interface OTRule { rate: 1.5 | 2 | 3; label: string; description: string }

export type OTBreakdown = Partial<Record<'1.5' | '2' | '3', number>>;

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  shiftId: string;
  lateMin: number;
  earlyMin: number;
  otHours: OTBreakdown;
  status: 'ปกติ' | 'สาย' | 'ออกก่อน' | 'ลา' | 'วันหยุด';
  geo?: { lat: number; lng: number; accuracyM: number; insideFence: boolean };
}

export interface PayrollRecord {
  employeeId: string;
  month: string;
  baseSalary: number;
  commission: number;
  otPay: number;
  gross: number;
  lateDeduction: number;
  socialSecurity: number;
  withholdingTax: number;
  ewaDeduction: number;
  totalDeduction: number;
  net: number;
}

export type LeaveType = 'ลาพักร้อน' | 'ลาป่วย' | 'ลากิจ' | 'ลาคลอด';
export type RequestStatus = 'รออนุมัติ' | 'อนุมัติอัตโนมัติ' | 'อนุมัติแล้ว' | 'ไม่อนุมัติ';

export interface LeaveRequest {
  id: string; employeeId: string; type: LeaveType; from: string; to: string; days: number; reason: string; status: RequestStatus; createdAt: string;
}

export interface ApprovalItem {
  id: string; kind: 'OT' | 'ค่าใช้จ่าย' | 'ลา'; employeeId: string; title: string; detail: string; amount?: number; status: RequestStatus; refId?: string;
}

export type CandidateStage = 'สมัครใหม่' | 'คัดกรอง' | 'สัมภาษณ์' | 'เสนอเงินเดือน' | 'รับเข้าทำงาน';
export interface Candidate {
  id: string; name: string; jobId: string; stage: CandidateStage; skills: string[]; experienceYears: number; expectedSalary: number; summary: string;
}
export interface JobPosting { id: string; title: string; department: Department; openings: number; skills: string[]; minExp: number; status: 'เปิดรับ' | 'ปิดรับ' }

export interface HRDocument {
  id: string; title: string; category: 'นโยบาย' | 'ใบรับรองแพทย์' | 'สัญญา'; assigneeId: string; status: 'รอลงนาม' | 'ลงนามแล้ว'; signedAt?: string; signature?: string;
}

export interface Kudos { id: string; fromId: string; toId: string; badge: string; message: string; createdAt: string }
export interface KeyResult { id: string; text: string; progress: number }
export interface Objective { id: string; employeeId: string; title: string; keyResults: KeyResult[] }
export interface EwaRequest { id: string; employeeId: string; amount: number; fee: number; status: 'โอนแล้ว' | 'รออนุมัติ'; createdAt: string }
