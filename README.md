# SiamHR — ระบบ HR & Payroll (Next.js 14 + Tailwind + Firebase)

```bash
npm install
npm run dev     # http://localhost:3000
```
- โหมดเดโม (ไม่ตั้งค่า Firebase): รหัสผ่านทุกบัญชี `SiamHR@2026` — employee@ / manager@ / hr@ / ceo@ siamdigital.co.th
- โหมด Firebase: คัดลอก `.env.example` เป็น `.env.local` แล้วกรอกค่า สร้างผู้ใช้ใน Firebase Auth และ (ไม่บังคับ) เอกสาร `users/{uid}` ที่มีฟิลด์ `role`
- กฎคำนวณอยู่ใน `src/lib/payroll.ts`, ตัวตรวจจับบทบาทใน `src/context/AuthContext.tsx`
