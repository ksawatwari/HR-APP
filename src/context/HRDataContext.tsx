'use client';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  employees as seedEmployees, initialApprovals, initialCandidates, initialDocuments, initialEwa, initialKudos,
  initialLeaves, initialPermissions, leaveBalances, CURRENT_MONTH, TODAY,
} from '@/data/mock';
import { summarize } from '@/lib/attendance';
import { computePayroll, EWA_FEE, hourlyRate } from '@/lib/payroll';
import type {
  ApprovalItem, Candidate, CandidateStage, Employee, EwaRequest, HRDocument, Kudos, LeaveRequest, LeaveType, PayrollRecord, RequestStatus,
} from '@/types/hr';

export type LivePayroll = PayrollRecord & { reimb: number; takeHome: number; otHours: number };
type OTRate = 1.5 | 2 | 3;

interface State {
  employees: Employee[]; leaves: LeaveRequest[]; approvals: ApprovalItem[]; candidates: Candidate[]; documents: HRDocument[];
  kudos: Kudos[]; ewa: EwaRequest[]; permissions: Record<string, Record<string, boolean>>;
  otManual: Record<string, number>;   // ชม. OT (×1.5) ที่ HR กรอกเพิ่มเอง
  payrollClosed: boolean;
}

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
/** ชุดข้อมูลเริ่มต้น — เรียกใหม่ทุกครั้งที่โหลดหน้า หรือกดรีเซ็ต */
const makeInitial = (): State => ({
  employees: clone(seedEmployees), leaves: clone(initialLeaves), approvals: clone(initialApprovals), candidates: clone(initialCandidates),
  documents: clone(initialDocuments), kudos: clone(initialKudos), ewa: clone(initialEwa), permissions: clone(initialPermissions),
  otManual: {}, payrollClosed: false,
});

interface HRData extends State {
  balances: Record<string, Record<LeaveType, number>>;
  getEmp: (id: string) => Employee;
  payrollFor: (e: Employee) => LivePayroll;
  // พนักงาน / เงินเดือน
  updateEmployee: (id: string, patch: Partial<Employee>) => void;
  setOtManual: (id: string, hours: number) => void;
  closePayroll: () => void;
  reopenPayroll: () => void;
  // ลา / อนุมัติ
  submitLeave: (p: { employeeId: string; type: LeaveType; from: string; to: string; reason: string }) => LeaveRequest;
  decide: (id: string, approve: boolean) => void;
  revertDecision: (id: string) => void;
  addOT: (employeeId: string, date: string, hours: number, rate: OTRate, reason: string) => void;
  addExpense: (employeeId: string, title: string, amount: number) => void;
  // ATS
  moveCandidate: (id: string, stage: CandidateStage) => void;
  addCandidate: (c: Omit<Candidate, 'id' | 'stage'>) => void;
  removeCandidate: (id: string) => void;
  // อื่น ๆ
  signDocument: (id: string, signature: string) => void;
  giveKudos: (k: Omit<Kudos, 'id' | 'createdAt'>) => void;
  requestEwa: (employeeId: string, amount: number) => void;
  togglePermission: (role: string, module: string) => void;
  resetAll: () => void;
}

const Ctx = createContext<HRData | null>(null);
let seq = 100;
const nid = (p: string) => `${p}${++seq}`;
const dayCount = (a: string, b: string) => Math.max(1, Math.round((+new Date(b) - +new Date(a)) / 86400000) + 1);
const DONE: RequestStatus[] = ['อนุมัติแล้ว', 'อนุมัติอัตโนมัติ'];

export function HRDataProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<State>(makeInitial);
  const patch = useCallback((p: Partial<State> | ((prev: State) => Partial<State>)) =>
    setS((prev) => ({ ...prev, ...(typeof p === 'function' ? p(prev) : p) })), []);

  const getEmp = useCallback((id: string) => s.employees.find((e) => e.id === id) ?? s.employees[0], [s.employees]);

  /** ยอดลาคงเหลือ = โควต้า − วันลาที่อนุมัติแล้ว (คำนวณสดจากรายการลา จึงย้อนการอนุมัติได้) */
  const balances = useMemo(() => {
    const out: Record<string, Record<LeaveType, number>> = {};
    for (const e of s.employees) {
      const b = { ...leaveBalances } as Record<LeaveType, number>;
      s.leaves.filter((l) => l.employeeId === e.id && DONE.includes(l.status)).forEach((l) => { b[l.type] -= l.days; });
      out[e.id] = b;
    }
    return out;
  }, [s.employees, s.leaves]);

  /** คำนวณเงินเดือนสด: เงินเดือน + คอมมิชชัน + OT (ลงเวลา + HR กรอก + OT ที่อนุมัติแล้ว) − หักต่าง ๆ + เบิกคืนค่าใช้จ่ายที่อนุมัติ */
  const payrollFor = useCallback((e: Employee): LivePayroll => {
    const a = summarize(e.id);
    const ot = { ...a.ot };
    ot['1.5'] += s.otManual[e.id] ?? 0;
    let reimb = 0;
    s.approvals.forEach((x) => {
      if (x.employeeId !== e.id || x.status !== 'อนุมัติแล้ว') return;
      if (x.kind === 'OT' && x.ot) ot[String(x.ot.rate) as '1.5' | '2' | '3'] += x.ot.hours;
      if (x.kind === 'ค่าใช้จ่าย') reimb += x.amount ?? 0;
    });
    const ewaDed = s.ewa.filter((w) => w.employeeId === e.id).reduce((n, w) => n + w.amount + w.fee, 0);
    const rec = computePayroll(e, CURRENT_MONTH, a.late, a.early, ot, ewaDed);
    return { ...rec, reimb, takeHome: rec.net + reimb, otHours: ot['1.5'] + ot['2'] + ot['3'] };
  }, [s.otManual, s.approvals, s.ewa]);

  const submitLeave: HRData['submitLeave'] = useCallback((p) => {
    const days = dayCount(p.from, p.to);
    const bal = balances[p.employeeId]?.[p.type] ?? leaveBalances[p.type];
    const auto = p.type !== 'ลาคลอด' && days <= 3 && bal >= days; // อนุมัติอัตโนมัติ
    const status: RequestStatus = auto ? 'อนุมัติอัตโนมัติ' : 'รออนุมัติ';
    const req: LeaveRequest = { id: nid('L'), ...p, days, status, createdAt: TODAY };
    patch((prev) => ({
      leaves: [req, ...prev.leaves],
      approvals: auto ? prev.approvals : [{ id: nid('A'), kind: 'ลา', employeeId: p.employeeId, title: `${p.type} ${days} วัน`, detail: `${p.from} ถึง ${p.to} — ${p.reason}`, status, refId: req.id }, ...prev.approvals],
    }));
    return req;
  }, [balances, patch]);

  const setDecision = useCallback((id: string, status: RequestStatus) => patch((prev) => {
    const item = prev.approvals.find((a) => a.id === id);
    return {
      approvals: prev.approvals.map((a) => (a.id === id ? { ...a, status } : a)),
      leaves: prev.leaves.map((l) => (item?.refId && l.id === item.refId ? { ...l, status } : l)),
    };
  }), [patch]);

  const value = useMemo<HRData>(() => ({
    ...s, balances, getEmp, payrollFor, submitLeave,
    updateEmployee: (id, p) => patch((prev) => ({ employees: prev.employees.map((e) => (e.id === id ? { ...e, ...p } : e)) })),
    setOtManual: (id, hours) => patch((prev) => ({ otManual: { ...prev.otManual, [id]: Math.max(0, hours) } })),
    closePayroll: () => patch({ payrollClosed: true }),
    reopenPayroll: () => patch({ payrollClosed: false }),
    decide: (id, approve) => setDecision(id, approve ? 'อนุมัติแล้ว' : 'ไม่อนุมัติ'),
    revertDecision: (id) => setDecision(id, 'รออนุมัติ'),
    addOT: (employeeId, date, hours, rate, reason) => patch((prev) => {
      const emp = prev.employees.find((e) => e.id === employeeId)!;
      return { approvals: [{ id: nid('A'), kind: 'OT', employeeId, title: `ขอทำ OT — ${reason || 'งานเร่งด่วน'}`, detail: `${date} (${hours} ชม. × ${rate})`, amount: hours * rate * hourlyRate(emp.salary), status: 'รออนุมัติ', ot: { hours, rate } }, ...prev.approvals] };
    }),
    addExpense: (employeeId, title, amount) => patch((prev) => ({ approvals: [{ id: nid('A'), kind: 'ค่าใช้จ่าย', employeeId, title, detail: 'ส่งผ่านระบบ', amount, status: 'รออนุมัติ' }, ...prev.approvals] })),
    moveCandidate: (id, stage) => patch((prev) => ({ candidates: prev.candidates.map((c) => (c.id === id ? { ...c, stage } : c)) })),
    addCandidate: (c) => patch((prev) => ({ candidates: [{ ...c, id: nid('C'), stage: 'สมัครใหม่' }, ...prev.candidates] })),
    removeCandidate: (id) => patch((prev) => ({ candidates: prev.candidates.filter((c) => c.id !== id) })),
    signDocument: (id, signature) => patch((prev) => ({ documents: prev.documents.map((d) => (d.id === id ? { ...d, status: 'ลงนามแล้ว', signature, signedAt: `${TODAY} ${new Date().toTimeString().slice(0, 5)}` } : d)) })),
    giveKudos: (k) => patch((prev) => ({ kudos: [{ ...k, id: nid('K'), createdAt: TODAY }, ...prev.kudos] })),
    requestEwa: (employeeId, amount) => patch((prev) => ({ ewa: [{ id: nid('W'), employeeId, amount, fee: EWA_FEE, status: 'โอนแล้ว', createdAt: TODAY }, ...prev.ewa] })),
    togglePermission: (role, module) => patch((prev) => ({ permissions: { ...prev.permissions, [role]: { ...prev.permissions[role], [module]: !prev.permissions[role]?.[module] } } })),
    resetAll: () => setS(makeInitial()),
  }), [s, balances, getEmp, payrollFor, submitLeave, patch, setDecision]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useHRData = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useHRData ต้องอยู่ใน HRDataProvider');
  return c;
};
