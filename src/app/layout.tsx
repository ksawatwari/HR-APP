import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans_Thai } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { HRDataProvider } from '@/context/HRDataContext';

const thai = IBM_Plex_Sans_Thai({ subsets: ['thai', 'latin'], weight: ['400', '500', '600', '700'], variable: '--font-thai', display: 'swap' });
export const metadata: Metadata = { title: 'SiamHR — ระบบบริหารงานบุคคลและเงินเดือน', description: 'ระบบ HR & Payroll แบบครบวงจรสำหรับองค์กรไทย' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={thai.variable}>
      <body className="font-sans">
        <AuthProvider><HRDataProvider>{children}</HRDataProvider></AuthProvider>
      </body>
    </html>
  );
}
