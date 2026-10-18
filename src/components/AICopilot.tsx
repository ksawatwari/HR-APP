'use client';
import { useEffect, useRef, useState } from 'react';
import { Bot, Send, Sparkles, X } from 'lucide-react';
import { askHrAi } from '@/lib/ai';

const suggestions = ['ลาป่วยได้กี่วัน?', 'อัตรา OT คิดอย่างไร?', 'ประกันสังคมหักเท่าไร?', 'เบิกเงินเดือนล่วงหน้าได้เท่าไร?', 'ค่าชดเชยเลิกจ้าง'];

export function AICopilot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<{ from: 'ai' | 'me'; text: string }[]>([{ from: 'ai', text: 'สวัสดีค่ะ ฉันคือผู้ช่วย AI ของ SiamHR ถามเรื่องกฎหมายแรงงานไทยและนโยบายบริษัทได้เลยค่ะ' }]);
  const [typing, setTyping] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing, open]);

  function send(q: string) {
    if (!q.trim()) return;
    setMsgs((m) => [...m, { from: 'me', text: q }]); setInput(''); setTyping(true);
    setTimeout(() => { setMsgs((m) => [...m, { from: 'ai', text: askHrAi(q) }]); setTyping(false); }, 700);
  }
  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="เปิดผู้ช่วย AI" className="no-print fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-tech text-white shadow-lg px-4 py-3 font-semibold hover:bg-indigo-700">
        <Sparkles className="h-5 w-5" /> <span className="hidden sm:inline">ผู้ช่วย AI</span>
      </button>
      {open && <div className="fixed inset-0 bg-slate-900/30 z-40" onClick={() => setOpen(false)} />}
      <aside aria-hidden={!open} className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[400px] bg-white border-l border-line shadow-2xl flex flex-col transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <header className="flex items-center justify-between px-4 py-3 border-b border-line bg-tech text-white">
          <div className="flex items-center gap-2 font-semibold"><Bot className="h-5 w-5" /> ผู้ช่วย HR AI</div>
          <button onClick={() => setOpen(false)} aria-label="ปิด" className="p-1"><X className="h-5 w-5" /></button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-canvas">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
              <p className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${m.from === 'me' ? 'bg-brand text-white' : 'bg-white border border-line'}`}>{m.text}</p>
            </div>
          ))}
          {typing && <p className="text-sm text-slate-500">กำลังพิมพ์…</p>}
          <div ref={end} />
        </div>
        <div className="p-3 border-t border-line space-y-2">
          <div className="scroll-x flex gap-2">{suggestions.map((s) => <button key={s} onClick={() => send(s)} className="shrink-0 rounded-full border border-indigo-200 bg-indigo-50 text-tech px-3 py-1 text-xs">{s}</button>)}</div>
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="พิมพ์คำถามของคุณ…" className="flex-1 rounded-lg border border-line px-3 py-2 text-sm focus:border-tech focus:outline-none" />
            <button className="rounded-lg bg-tech text-white px-3" aria-label="ส่ง"><Send className="h-4 w-4" /></button>
          </form>
        </div>
      </aside>
    </>
  );
}
