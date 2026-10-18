'use client';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { initialApprovals, initialCandidates, initialDocuments, initialEwa, initialKudos, initialLeaves, initialPermissions, leaveBalances, TODAY } from '@/data/mock';
import type { ApprovalItem, Candidate, CandidateStage, HRDocument, Kudos, LeaveRequest, LeaveType, EwaRequest, RequestStatus } from '@/types/hr';
import { EWA_FEE } from '@/lib/payroll';

interface HRData {
  leaves: LeaveRequest[]; approvals: ApprovalItem[]; candidates: Candidate[]; documents: HRDocument[]; kudos: Kudos[]; ewa: EwaRequest[];
  permissions: Record<string, Record<string, boolean>>; balances: Record<string, Record<LeaveType, number>>;
  submitLeave: (p: { employeeId: string; type: LeaveType; from: string; to: string; reason: string }) => LeaveRequest;
  decide: (id: string, approve: boolean) => void;
  addExpense: (employeeId: string, title: string, amount: number) => void;
  moveCandidate: (id: string, stage: CandidateStage) => void;
  signDocument: (id: string, signature: string) => void;
  giveKudos: (k: Omit<Kudos, 'id' | 'createdAt'>) => void;
  requestEwa: (employeeId: string, amount: number) => void;
  togglePermission: (role: string, module: string) => void;
}
const Ctx = createContext<HRData | null>(null);
let seq = 100;
const nid = (p: string) => `${p}${++seq}`;
const dayCount = (a: string, b: string) => Math.max(1, Math.round((+new Date(b) - +new Date(a)) / 86400000) + 1);

export function HRDataProvider({ children }: { children: ReactNode }) {
  const [leaves, setLeaves] = useState(initialLeaves);
  const [approvals, setApprovals] = useState(initialApprovals);
  const [candidates, setCandidates] = useState(initialCandidates);
  const [documents, setDocuments] = useState(initialDocuments);
  const [kudos, setKudos] = useState(initialKudos);
  const [ewa, setEwa] = useState(initialEwa);
  const [permissions, setPermissions] = useState(initialPermissions);
  const [balances, setBalances] = useState<Record<string, Record<LeaveType, number>>>({ E004: { ...leaveBalances } as Record<LeaveType, number> });

  const submitLeave: HRData['submitLeave'] = useCallback((p) => {
    const days = dayCount(p.from, p.to);
    const bal = balances[p.employeeId]?.[p.type] ?? leaveBalances[p.type];
    // กฎอนุมัติอัตโนมัติ: ยอดคงเหลือเพียงพอ และลาไม่เกิน 3 วัน (ลาคลอดต้องผ่านหัวหน้า)
    const auto = p.type !== 'ลาคลอด' && days <= 3 && bal >= days;
    const status: RequestStatus = auto ? 'อนุมัติอัตโนมัติ' : 'รออนุมัติ';
    const req: LeaveRequest = { id: nid('L'), ...p, days, status, createdAt: TODAY };
    setLeaves((l) => [req, ...l]);
    if (auto) setBalances((b) => ({ ...b, [p.employeeId]: { ...(b[p.employeeId] ?? (leaveBalances as Record<LeaveType, number>)), [p.type]: bal - days } }));
    else setApprovals((a) => [{ id: nid('A'), kind: 'ลา', employeeId: p.employeeId, title: `${p.type} ${days} วัน`, detail: `${p.from} ถึง ${p.to} — ${p.reason}`, status, refId: req.id }, ...a]);
    return req;
  }, [balances]);

  const decide = useCallback((id: string, approve: boolean) => {
    const status: RequestStatus = approve ? 'อนุมัติแล้ว' : 'ไม่อนุมัติ';
    setApprovals((a) => a.map((x) => (x.id === id ? { ...x, status } : x)));
    setLeaves((l) => l.map((x) => (approvals.find((a) => a.id === id)?.refId === x.id ? { ...x, status } : x)));
  }, [approvals]);

  const value = useMemo<HRData>(() => ({
    leaves, approvals, candidates, documents, kudos, ewa, permissions, balances, submitLeave, decide,
    addExpense: (employeeId, title, amount) => setApprovals((a) => [{ id: nid('A'), kind: 'ค่าใช้จ่าย', employeeId, title, detail: 'ส่งผ่านระบบ', amount, status: 'รออนุมัติ' }, ...a]),
    moveCandidate: (id, stage) => setCandidates((c) => c.map((x) => (x.id === id ? { ...x, stage } : x))),
    signDocument: (id, signature) => setDocuments((d) => d.map((x) => (x.id === id ? { ...x, status: 'ลงนามแล้ว', signature, signedAt: `${TODAY} ${new Date().toTimeString().slice(0, 5)}` } : x))),
    giveKudos: (k) => setKudos((x) => [{ ...k, id: nid('K'), createdAt: TODAY }, ...x]),
    requestEwa: (employeeId, amount) => setEwa((w) => [{ id: nid('W'), employeeId, amount, fee: EWA_FEE, status: 'โอนแล้ว', createdAt: TODAY }, ...w]),
    togglePermission: (role, module) => setPermissions((p) => ({ ...p, [role]: { ...p[role], [module]: !p[role]?.[module] } })),
  }), [leaves, approvals, candidates, documents, kudos, ewa, permissions, balances, submitLeave, decide]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useHRData = () => { const c = useContext(Ctx); if (!c) throw new Error('useHRData ต้องอยู่ใน HRDataProvider'); return c; };
