import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, ShieldAlert, Gauge, Lightbulb, Send, CornerDownRight } from 'lucide-react';
import { COPILOT_INITIAL, COPILOT_PROMPTS, type CopilotMessage } from './data';

const KIND_META = {
  summary: { icon: Sparkles, label: 'Investigation Summary', tone: 'text-sentinel-cyan border-sentinel-cyan/30' },
  pivot: { icon: Lightbulb, label: 'Suggested Next Pivot', tone: 'text-sentinel-warning border-sentinel-warning/30' },
  risk: { icon: ShieldAlert, label: 'Risk Analysis', tone: 'text-sentinel-error border-sentinel-error/30' },
  confidence: { icon: Gauge, label: 'Confidence Score', tone: 'text-sentinel-success border-sentinel-success/30' },
  text: { icon: Bot, label: 'Sentinel Copilot', tone: 'text-sentinel-cyan border-sentinel-cyan/30' },
} as const;

function streamReply(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('pivot')) {
    return 'Suggested next pivot: trace the 0.84 BTC inbound transaction to its originating exchange. KYC records on the deposit side could collapse the alias "Vex" to a real-world identity. Secondary pivot: subpoena Njalla for the shadowcraft.io registration metadata.';
  }
  if (p.includes('risk')) {
    return 'Risk is elevated (78/100) due to: operational-security hygiene suggesting actor tradecraft, breach-forum participation under alias "Vex", and private GitHub repos containing exfiltration tooling. Mitigating factors: no direct PII exposure and no confirmed malicious infrastructure.';
  }
  if (p.includes('confidence')) {
    return 'Confidence sits at 92%. Entity resolution is corroborated by 3+ independent source classes (infrastructure, crypto, social). The remaining 8% uncertainty centers on the "Vex" alias attribution — only one sighting links the handle to the subject.';
  }
  return 'Subject "ghost_op_47" resolves to a high-confidence identity cluster spanning 7 entities across 412 sources. Primary anchor is the ProtonMail address, reinforced by a privacy-registered domain and a BTC wallet with on-chain exchange exposure.';
}

export default function CopilotPanel() {
  const [messages, setMessages] = useState<CopilotMessage[]>(COPILOT_INITIAL);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim() || typing) return;
    const userMsg: CopilotMessage = { id: `u${Date.now()}`, role: 'user', content: text };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const reply: CopilotMessage = { id: `a${Date.now()}`, role: 'assistant', kind: 'text', content: streamReply(text) };
      setMessages((m) => [...m, reply]);
      setTyping(false);
    }, 1400);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl glass glass-reflection">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="relative grid h-8 w-8 place-items-center rounded-lg border border-sentinel-cyan/40 bg-sentinel-cyan/5">
            <Bot className="h-4 w-4 text-sentinel-cyan" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-sentinel-success" />
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold text-white">Sentinel Copilot</h3>
            <div className="font-mono text-[9px] uppercase tracking-wider text-sentinel-success">Online · Investigation Context</div>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((m) => (
          <Message key={m.id} m={m} />
        ))}

        <AnimatePresence>
          {typing && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 pl-11"
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-sentinel-cyan"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-sentinel-muted">Analyzing…</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap gap-2 px-5 pb-3">
        {COPILOT_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => send(p)}
            disabled={typing}
            className="rounded-md border border-white/10 bg-white/[0.02] px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-sentinel-muted transition-colors hover:border-sentinel-cyan/40 hover:text-sentinel-cyan disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="border-t border-white/5 p-3"
      >
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-sentinel-bg/60 px-3 py-2 transition-colors focus-within:border-sentinel-cyan/40">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the copilot about this investigation…"
            className="flex-1 bg-transparent text-sm text-sentinel-text placeholder:text-sentinel-muted/50 focus:outline-none"
          />
          <button
            type="submit"
            disabled={typing || !input.trim()}
            className="grid h-8 w-8 place-items-center rounded-md bg-sentinel-cyan text-sentinel-bg transition-all hover:shadow-cyan-glow disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

function Message({ m }: { m: CopilotMessage }) {
  if (m.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-lg rounded-tr-sm bg-sentinel-cyan/15 px-3.5 py-2.5 text-sm text-sentinel-text">
          {m.content}
        </div>
      </div>
    );
  }

  const meta = m.kind ? KIND_META[m.kind] : KIND_META.text;
  const Icon = meta.icon;

  return (
    <div className="flex gap-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-sentinel-cyan/30 bg-sentinel-cyan/5">
        <Icon className="h-4 w-4 text-sentinel-cyan" />
      </div>
      <div className="min-w-0 flex-1">
        <div className={`mb-1.5 inline-flex items-center gap-1.5 rounded border ${meta.tone} bg-white/[0.02] px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider`}>
          <CornerDownRight className="h-2.5 w-2.5" />
          {meta.label}
        </div>
        <div className="rounded-lg rounded-tl-sm border border-white/5 bg-white/[0.02] px-3.5 py-2.5 text-sm leading-relaxed text-sentinel-text/90">
          {m.content}
        </div>
      </div>
    </div>
  );
}
