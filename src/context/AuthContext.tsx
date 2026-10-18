'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured, COLLECTIONS } from '@/lib/firebase';
import { employees } from '@/data/mock';
import type { AppUser, Role } from '@/types/hr';

export const COMPANY_DOMAIN = 'siamdigital.co.th';
export const DEMO_PASSWORD = 'SiamHR@2026';

/** กฎตรวจจับบทบาทจากอีเมล (Domain-Based Smart Login) */
const LOCAL_PART_ROLE: Record<string, Role> = { employee: 'employee', manager: 'manager', hr: 'hr', ceo: 'executive' };
export const ROLE_HOME: Record<Role, string> = { employee: 'พอร์ทัลพนักงาน', manager: 'พอร์ทัลผู้จัดการ', hr: 'พอร์ทัลฝ่ายทรัพยากรบุคคล', executive: 'พอร์ทัลผู้บริหาร' };

export function detectRole(email: string): Role | null {
  const [local, domain] = email.trim().toLowerCase().split('@');
  if (domain !== COMPANY_DOMAIN) return null;
  return LOCAL_PART_ROLE[local] ?? 'employee'; // อีเมลบริษัทอื่น ๆ = พนักงานทั่วไป
}

/** สิทธิ์การใช้งานโมดูลตามบทบาท (ค่าเริ่มต้น — แก้ไขได้ใน Permission Matrix) */
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  employee: ['self.profile', 'self.attendance', 'self.payslip', 'self.leave', 'self.ewa', 'self.documents', 'self.okr', 'ai.copilot'],
  manager: ['self.*', 'team.view', 'team.approve', 'team.okr', 'ai.copilot'],
  hr: ['hr.*', 'payroll.*', 'ats.*', 'documents.*', 'permissions.edit', 'ai.copilot', 'ai.radar'],
  executive: ['exec.dashboard', 'payroll.view', 'ai.radar', 'ai.copilot'],
};
export const can = (role: Role | undefined, perm: string) =>
  !!role && ROLE_PERMISSIONS[role].some((p) => p === perm || (p.endsWith('.*') && perm.startsWith(p.slice(0, -1))));

interface AuthState {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}
const Ctx = createContext<AuthState | null>(null);
const KEY = 'siamhr.session';

function buildUser(uid: string, email: string, role: Role): AppUser {
  const emp = employees.find((e) => e.email === email.toLowerCase());
  return { uid, email: email.toLowerCase(), role, displayName: emp?.name ?? email.split('@')[0], employeeId: emp?.id ?? 'E004' };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      return onAuthStateChanged(auth, async (fu) => {
        if (!fu?.email) { setUser(null); setLoading(false); return; }
        let role = detectRole(fu.email);
        try { // บทบาทจริงมาจาก Firestore users/{uid}.role (ตั้งโดย HR/ผู้ดูแลระบบ) — ถ้าไม่มีใช้การตรวจจับจากโดเมน
          const snap = db ? await getDoc(doc(db, COLLECTIONS.users, fu.uid)) : null;
          if (snap?.exists() && snap.data().role) role = snap.data().role as Role;
        } catch { /* ใช้ role จากโดเมน */ }
        setUser(role ? buildUser(fu.uid, fu.email, role) : null);
        setLoading(false);
      });
    }
    try { const raw = sessionStorage.getItem(KEY); if (raw) setUser(JSON.parse(raw)); } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const login = useCallback<AuthState['login']>(async (email, password) => {
    const role = detectRole(email);
    if (!role) return { ok: false, error: `ต้องใช้อีเมลองค์กร @${COMPANY_DOMAIN} เท่านั้น` };
    if (!password) return { ok: false, error: 'กรุณากรอกรหัสผ่าน' };
    if (isFirebaseConfigured && auth) {
      try { await signInWithEmailAndPassword(auth, email.trim(), password); return { ok: true }; }
      catch { return { ok: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }; }
    }
    if (password !== DEMO_PASSWORD) return { ok: false, error: 'รหัสผ่านไม่ถูกต้อง (โหมดเดโมใช้รหัสผ่านตามที่แสดงบนหน้านี้)' };
    const u = buildUser('demo-' + email.toLowerCase(), email, role);
    sessionStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    if (isFirebaseConfigured && auth) await signOut(auth);
    sessionStorage.removeItem(KEY);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useAuth = () => { const c = useContext(Ctx); if (!c) throw new Error('useAuth ต้องอยู่ใน AuthProvider'); return c; };
