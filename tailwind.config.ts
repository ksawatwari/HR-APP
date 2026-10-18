import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { brand: { DEFAULT: '#1E40AF', soft: '#DBEAFE' }, tech: '#4F46E5', ok: '#059669', canvas: '#F8FAFC', line: '#E2E8F0' },
      fontFamily: { sans: ['var(--font-thai)', 'system-ui', 'sans-serif'] },
      boxShadow: { card: '0 1px 2px rgba(15,23,42,.05), 0 1px 3px rgba(15,23,42,.04)' },
    },
  },
  plugins: [],
};
export default config;
