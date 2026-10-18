'use client';
import { useAuth } from '@/context/AuthContext';
import { EmployeePortal } from '@/components/portals/EmployeePortal';
import { ManagerPortal } from '@/components/portals/ManagerPortal';
import { HRPortal } from '@/components/portals/HRPortal';
import { ExecutivePortal } from '@/components/portals/ExecutivePortal';

/** เลือกพอร์ทัลตามบทบาทที่ตรวจจับจากโดเมนอีเมล — ไม่มีปุ่มสลับบทบาท */
export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;
  switch (user.role) {
    case 'employee': return <EmployeePortal />;
    case 'manager': return <ManagerPortal />;
    case 'hr': return <HRPortal />;
    case 'executive': return <ExecutivePortal />;
  }
}
