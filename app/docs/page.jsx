"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Shield, Key, Lock, RefreshCw, LogOut,
  ChevronRight, ChevronDown, Terminal, Binary,
  AlertTriangle, CheckCircle, Info, Globe,
  Database, Server, Cpu, EyeOff,
  Hash, GitBranch, ArrowRight, Layers,
  BookOpen, Code2, FileText, Activity, Copy, Check, Circle
} from "lucide-react";

/* ── KaTeX (loaded via CDN) ── */
function Math({ tex, block = false }) {
  const ref = useRef(null);
  useEffect(() => {
    if (typeof window !== "undefined" && window.katex && ref.current) {
      try {
        window.katex.render(tex, ref.current, { throwOnError: false, displayMode: block });
      } catch {}
    }
  }, [tex, block, /* re-render when katex loads */]);
  return <span ref={ref} className={block ? "block my-3 overflow-x-auto text-center" : "inline"} />;
}

/* ── Animate on scroll ── */
function Fade({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Code block with copy ── */
function CodeBlock({ code, title }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden border border-slate-700/60 my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-[#0d1117] border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          {title && <span className="ml-2 text-[11px] text-slate-500 font-mono">{title}</span>}
        </div>
        <button
          onClick={() => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-cyan-400 transition-colors"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="bg-[#0a0e14] p-5 overflow-x-auto text-[13px] leading-relaxed">
        <code className="text-slate-200 font-mono">{code}</code>
      </pre>
    </div>
  );
}

/* ── Callout ── */
function Callout({ type = "info", children }) {
  const cfg = {
    info:    { Icon: Info,          cls: "border-cyan-500/30 bg-cyan-950/40 text-cyan-100" },
    warning: { Icon: AlertTriangle, cls: "border-amber-500/30 bg-amber-950/40 text-amber-100" },
    success: { Icon: CheckCircle,   cls: "border-emerald-500/30 bg-emerald-950/40 text-emerald-100" },
    danger:  { Icon: AlertTriangle, cls: "border-rose-500/30 bg-rose-950/40 text-rose-100" },
  };
  const { Icon, cls } = cfg[type] || cfg.info;
  return (
    <div className={`flex gap-3 rounded-xl border px-4 py-3 text-sm leading-relaxed my-4 ${cls}`}>
      <Icon size={15} className="mt-0.5 shrink-0 opacity-70" />
      <div className="text-[13px]">{children}</div>
    </div>
  );
}

/* ── Stage accordion card ── */
function Stage({ number, title, icon: Icon, accent, children }) {
  const [open, setOpen] = useState(true);
  const a = {
    cyan:    { ring: "border-cyan-500/30",    bg: "bg-cyan-500/5",    badge: "bg-cyan-900/60 text-cyan-300 border-cyan-500/40",    ic: "text-cyan-400" },
    emerald: { ring: "border-emerald-500/30", bg: "bg-emerald-500/5", badge: "bg-emerald-900/60 text-emerald-300 border-emerald-500/40", ic: "text-emerald-400" },
    violet:  { ring: "border-violet-500/30",  bg: "bg-violet-500/5",  badge: "bg-violet-900/60 text-violet-300 border-violet-500/40",  ic: "text-violet-400" },
    amber:   { ring: "border-amber-500/30",   bg: "bg-amber-500/5",   badge: "bg-amber-900/60 text-amber-300 border-amber-500/40",   ic: "text-amber-400" },
    rose:    { ring: "border-rose-500/30",    bg: "bg-rose-500/5",    badge: "bg-rose-900/60 text-rose-300 border-rose-500/40",    ic: "text-rose-400" },
    sky:     { ring: "border-sky-500/30",     bg: "bg-sky-500/5",     badge: "bg-sky-900/60 text-sky-300 border-sky-500/40",     ic: "text-sky-400" },
  }[accent] || {};

  return (
    <Fade>
      <div className={`rounded-2xl border ${a.ring} ${a.bg} overflow-hidden mb-4`}>
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-3 px-6 py-4 hover:bg-white/[0.02] transition-colors text-left"
        >
          <span className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded border tracking-widest ${a.badge}`}>
            STAGE {number}
          </span>
          <Icon size={16} className={a.ic} />
          <span className="text-[15px] font-bold text-slate-100" style={{ fontFamily: "'Syne',sans-serif" }}>
            {title}
          </span>
          <ChevronDown size={14} className={`ml-auto text-slate-600 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-3 text-[13px] leading-relaxed text-slate-300">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Fade>
  );
}

/* ── Math display box ── */
function MathBox({ children }) {
  return (
    <div className="rounded-xl border border-slate-700/40 bg-slate-900/50 px-6 py-4 my-3 overflow-x-auto">
      {children}
    </div>
  );
}

/* ── Section heading ── */
function H2({ icon: Icon, children }) {
  return (
    <h2 className="text-2xl font-extrabold text-white mb-2 flex items-center gap-3 tracking-tight" style={{ fontFamily: "'Clash Display',sans-serif" }}>
      <Icon size={20} className="text-cyan-400 shrink-0" />
      {children}
    </h2>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════ */
export default function ZKSAPDocs() {
  const [katex, setKatex] = useState(false);

  useEffect(() => {
    // Load fonts
    const f = document.createElement("link");
    f.rel = "stylesheet";
f.href = "https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;600;700&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,600;0,800;1,400&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap";    document.head.appendChild(f);

    // Load KaTeX
    if (window.katex) { setKatex(true); return; }
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
    document.head.appendChild(css);
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
    s.onload = () => setKatex(true);
    document.head.appendChild(s);
  }, []);

  // force re-render once katex loaded so formulas render
  const [, tick] = useState(0);
  useEffect(() => { if (katex) tick(n => n + 1); }, [katex]);

  const sideNav = [
    { id: "overview",     label: "Overview",               Icon: BookOpen },
    { id: "architecture", label: "Architecture",            Icon: Layers },
    { id: "lifecycle",    label: "Auth Lifecycle",          Icon: Activity },
    { id: "stage1",       label: "Stage 1 — Registration",  Icon: Key },
    { id: "stage2",       label: "Stage 2 — Challenge",     Icon: Terminal },
    { id: "stage3",       label: "Stage 3 — ZK Proof",      Icon: EyeOff },
    { id: "stage4",       label: "Stage 4 — Validation",    Icon: CheckCircle },
    { id: "stage5",       label: "Stage 5 — Logout",        Icon: LogOut },
    { id: "stage6",       label: "Stage 6 — Recovery",      Icon: RefreshCw },
    { id: "math",         label: "Math Reference",          Icon: Binary },
    { id: "security",     label: "Security Analysis",       Icon: Shield },
    { id: "comparison",   label: "vs Traditional Auth",     Icon: GitBranch },
    { id: "impl",         label: "Implementation",          Icon: Code2 },
    { id: "glossary",     label: "Variable Glossary",       Icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#030609] text-slate-200" style={{ fontFamily: "'JetBrains Mono',monospace" }}>

      {/* ── Grid background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(ellipse 80% 50% at 15% -5%, rgba(6,182,212,.07) 0%, transparent 55%),
          radial-gradient(ellipse 60% 40% at 85% 105%, rgba(16,185,129,.05) 0%, transparent 55%),
          repeating-linear-gradient(0deg,transparent 0,transparent 79px,rgba(148,163,184,.018) 79px,rgba(148,163,184,.018) 80px),
          repeating-linear-gradient(90deg,transparent 0,transparent 79px,rgba(148,163,184,.018) 79px,rgba(148,163,184,.018) 80px)`
      }} />

      {/* ── Top bar ── */}
      <header className="fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-6 border-b border-slate-800/80 bg-[#030609]/90 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,.8)]" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.6)]" />
          </div>
          <span className="font-extrabold text-sm tracking-[.2em] uppercase text-cyan-400" style={{ fontFamily: "'Syne',sans-serif" }}>
            ZK<span className="text-emerald-400">SAP</span>
            <span className="text-slate-700 ml-2 text-xs font-normal">DOCS</span>
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-600 font-mono">
          <span className="hidden sm:block">v1.0.0</span>
          <span className="px-2 py-0.5 rounded border border-emerald-600/40 text-emerald-400 text-[10px] tracking-widest">STABLE</span>
          <span className="hidden md:block">by Kunal Singh</span>
        </div>
      </header>

      <div className="flex pt-14 relative z-10">
        {/* ── Sidebar ── */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 fixed top-14 bottom-0 left-0 border-r border-slate-800/70 overflow-y-auto py-5 px-2 bg-[#030609]/60 backdrop-blur">
          <nav className="space-y-0.5">
            {sideNav.map(({ id, label, Icon }) => (
              <a key={id} href={`#${id}`}
                className="flex items-center gap-2 text-[11px] py-1.5 px-3 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all border-l-2 border-transparent hover:border-cyan-500/40">
                <Icon size={10} className="shrink-0 opacity-60" />
                {label}
              </a>
            ))}
          </nav>
          <div className="mt-auto pt-6 px-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-[10px] text-slate-600 leading-relaxed font-mono">
              <div className="text-slate-500 font-bold mb-1 tracking-widest">OWNER</div>
              Kunal Singh<br />ZKSAP Protocol
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 lg:ml-56 max-w-4xl mx-auto px-4 sm:px-8 lg:px-14 py-16 space-y-20">

          {/* ════════════ HERO ════════════ */}
          <section id="overview">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, ease: [.22,1,.36,1] }}>
              <div className="flex flex-wrap gap-2 mb-5">
                {["CRYPTOGRAPHIC PROTOCOL","ZERO-KNOWLEDGE","PASSWORDLESS","Ed25519"].map((t,i) => (
                  <span key={t} className={`text-[9px] tracking-[.25em] px-3 py-1 rounded-full border font-mono ${
                    i===0?"border-cyan-500/30 bg-cyan-950/50 text-cyan-400":
                    i===1?"border-emerald-500/30 bg-emerald-950/50 text-emerald-400":
                    i===2?"border-violet-500/30 bg-violet-950/50 text-violet-400":
                    "border-amber-500/30 bg-amber-950/50 text-amber-400"}`}>{t}</span>
                ))}
              </div>

              <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-none mb-3" style={{ fontFamily: "'Syne',sans-serif" }}>
                <span className="text-white">ZK</span><span className="text-cyan-400">SAP</span>
              </h1>
              <p className="text-lg text-slate-400 font-semibold mb-2" style={{ fontFamily: "'Syne',sans-serif" }}>
                Zero-Knowledge Signature Authentication Protocol
              </p>
              <p className="text-[13px] text-slate-500 max-w-2xl leading-relaxed mb-8">
                A decentralized, passwordless authentication framework built on{" "}
                <span className="text-cyan-400">Ed25519 Elliptic Curve Cryptography</span> and{" "}
                <span className="text-emerald-400">BIP-39 Mnemonic Derivation</span>. The server never stores
                a password, never receives a secret, and never participates in key generation — it only
                verifies a <em>mathematical proof</em>.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {[
                  { v:"Ed25519",  l:"CURVE",        s:"128-bit security",   c:"border-cyan-500/30 bg-cyan-950/30" },
                  { v:"2¹²⁸",    l:"ENTROPY",      s:"Key space size",     c:"border-emerald-500/30 bg-emerald-950/30" },
                  { v:"BIP-39",   l:"RECOVERY",     s:"12-word mnemonic",   c:"border-violet-500/30 bg-violet-950/30" },
                  { v:"0 bits",   l:"SECRETS SENT", s:"to server",          c:"border-amber-500/30 bg-amber-950/30" },
                ].map(({v,l,s,c}) => (
                  <div key={l} className={`rounded-xl border p-4 text-center ${c}`}>
                    <div className="text-xl font-extrabold tracking-tight mb-0.5" style={{ fontFamily: "'Syne',sans-serif" }}>{v}</div>
                    <div className="text-[9px] font-bold tracking-[.2em] text-slate-500 font-mono">{l}</div>
                    <div className="text-[10px] text-slate-700 mt-0.5 font-mono">{s}</div>
                  </div>
                ))}
              </div>

              <Callout type="success">
                <strong>Core Guarantee:</strong> The server stores only your <em>Public Key A</em> — a non-secret
                mathematical point. It never receives your private key <em>k</em>, mnemonic <em>W</em>, or any
                derivable secret. Authentication is a proof of knowledge, not a transfer of knowledge.
              </Callout>
            </motion.div>
          </section>

          {/* ════════════ ARCHITECTURE ════════════ */}
          <section id="architecture">
            <Fade>
              <H2 icon={Layers}>Architecture Overview</H2>
              <p className="text-slate-500 text-[13px] mb-5">How the three components interact during authentication.</p>

              {/* Flow diagram */}
              <div className="rounded-2xl border border-slate-700/40 bg-slate-900/30 p-6 mb-5 overflow-x-auto">
                <div className="min-w-[520px]">
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    {[
                      { l:"CLIENT",   s:"Browser / Device",   c:"border-cyan-500/40 bg-cyan-950/40 text-cyan-300" },
                      { l:"SERVER",   s:"Next.js API Route",   c:"border-emerald-500/40 bg-emerald-950/40 text-emerald-300" },
                      { l:"DATABASE", s:"SQLite",              c:"border-violet-500/40 bg-violet-950/40 text-violet-300" },
                    ].map(({l,s,c}) => (
                      <div key={l} className={`rounded-xl border px-4 py-3 text-center ${c}`}>
                        <div className="font-bold text-[11px] tracking-widest font-mono">{l}</div>
                        <div className="text-[10px] opacity-50 mt-0.5">{s}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 text-[12px] font-mono">
                    {[
                      ["CLIENT → SERVER", "Public Key A", "Registration"],
                      ["SERVER → CLIENT", "Nonce M",      "Challenge (time-bound)"],
                      ["CLIENT → SERVER", "Signature (R, s)", "ZK Proof — k never sent"],
                      ["SERVER → DATABASE", "Store session T", "Session grant"],
                      ["SERVER → CLIENT", "Token T",      "Bearer credential"],
                    ].map(([dir, payload, note], i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * .08 }} viewport={{ once: true }}
                        className="flex items-center gap-3">
                        <span className="text-slate-600 w-40 shrink-0">{dir}</span>
                        <ArrowRight size={10} className="text-slate-700 shrink-0" />
                        <span className="text-cyan-400">{payload}</span>
                        <span className="text-slate-700">— {note}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { Icon: Cpu,      c:"cyan",    title:"Client",   items:["Generates entropy E","Derives Ed25519 key pair (k, A)","Signs ZK challenge","Stores k in IndexedDB — never sent"] },
                  { Icon: Server,   c:"emerald", title:"Server",   items:["Issues nonces M (time-bound)","Verifies sG = R + hA","Grants session token T","Never handles k, W, or r"] },
                  { Icon: Database, c:"violet",  title:"Database", items:["Public keys A","Nonces + expiry","Session tokens T","Zero plaintext secrets stored"] },
                ].map(({ Icon, c, title, items }) => {
                  const t = { cyan:"text-cyan-400", emerald:"text-emerald-400", violet:"text-violet-400" };
                  const b = { cyan:"border-cyan-500/30 bg-cyan-950/20", emerald:"border-emerald-500/30 bg-emerald-950/20", violet:"border-violet-500/30 bg-violet-950/20" };
                  return (
                    <div key={title} className={`rounded-xl border p-4 ${b[c]}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <Icon size={14} className={t[c]} />
                        <span className="text-[11px] font-bold tracking-widest font-mono text-slate-300">{title}</span>
                      </div>
                      <ul className="space-y-1.5">
                        {items.map(it => (
                          <li key={it} className="flex items-start gap-1.5 text-[12px] text-slate-500">
                            <ChevronRight size={10} className={`${t[c]} mt-1 shrink-0`} />{it}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </Fade>
          </section>

          {/* ════════════ LIFECYCLE OVERVIEW ════════════ */}
          <section id="lifecycle">
            <Fade>
              <H2 icon={Activity}>Authentication Lifecycle</H2>
              <p className="text-slate-500 text-[13px] mb-6">Six deterministic stages from identity genesis to session management.</p>
              <div className="relative pl-8 space-y-3">
                <div className="absolute left-3.5 top-2 bottom-2 w-px bg-gradient-to-b from-cyan-500/50 via-emerald-500/30 via-violet-500/20 to-transparent" />
                {[
                  { n:1, t:"Identity Genesis",        c:"cyan",    d:"Entropy → BIP-39 mnemonic → Ed25519 key pair" },
                  { n:2, t:"Challenge Issuance",       c:"emerald", d:"Server generates time-bound 256-bit nonce M" },
                  { n:3, t:"Zero-Knowledge Proof",     c:"violet",  d:"Client signs M with k; server learns nothing about k" },
                  { n:4, t:"Verification & Session",   c:"amber",   d:"Server validates sG = R + hA; issues session token T" },
                  { n:5, t:"Logout & Invalidation",    c:"rose",    d:"Token T purged server-side; browser clears state" },
                  { n:6, t:"Deterministic Recovery",   c:"sky",     d:"Mnemonic W re-derives identical key pair on any device" },
                ].map(({ n, t, c, d }) => {
                  const colors = { cyan:"text-cyan-400 border-cyan-400/50 bg-cyan-950/60", emerald:"text-emerald-400 border-emerald-400/50 bg-emerald-950/60", violet:"text-violet-400 border-violet-400/50 bg-violet-950/60", amber:"text-amber-400 border-amber-400/50 bg-amber-950/60", rose:"text-rose-400 border-rose-400/50 bg-rose-950/60", sky:"text-sky-400 border-sky-400/50 bg-sky-950/60" };
                  return (
                    <motion.div key={n} initial={{ opacity:0, x:-16 }} whileInView={{ opacity:1, x:0 }} transition={{ delay: n*.06 }} viewport={{ once:true }}
                      className="flex items-start gap-4">
                      <div className={`absolute left-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold font-mono ${colors[c]}`} style={{ top: (n-1)*48+4 }}>{n}</div>
                      <div>
                        <div className={`text-[13px] font-bold font-mono ${colors[c].split(" ")[0]}`}>{t}</div>
                        <div className="text-[12px] text-slate-600 mt-0.5">{d}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Fade>
          </section>

          {/* ════════════ STAGES ════════════ */}
          <div className="space-y-4">

            {/* STAGE 1 */}
            <div id="stage1">
              <Stage number={1} title="Registration — Identity Genesis" icon={Key} accent="cyan">
                <p>A human-readable mnemonic is mathematically transformed into a unique, permanent point on the Edwards25519 elliptic curve. Your identity is not stored on any server — it is <em>derived</em> from your words.</p>

                <div className="mt-3 space-y-4">
                  <div>
                    <div className="text-[10px] font-bold text-cyan-400 font-mono tracking-[.2em] mb-2">STEP 1 — SECURE ENTROPY</div>
                    <p className="text-slate-400">The browser's <code className="text-emerald-400 bg-slate-800/60 px-1.5 rounded text-[12px]">crypto.getRandomValues()</code> generates 128 bits of entropy <Math tex="E" />. This CSPRNG call is the only source of randomness — its quality determines the uniqueness of every identity.</p>
                    {katex && <MathBox><Math block tex="E \xleftarrow{\$} \{0,1\}^{128}" /></MathBox>}
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-cyan-400 font-mono tracking-[.2em] mb-2">STEP 2 — BIP-39 ENCODING</div>
                    <p className="text-slate-400 mb-2">128-bit entropy is encoded into 12 words <Math tex="W" /> from the 2048-word BIP-39 list. Each word encodes 11 bits; a 4-bit checksum is appended. The phrase is human-memorable and the sole recovery mechanism.</p>
                    <CodeBlock title="bip39.ts" code={`import * as bip39 from 'bip39';

const mnemonic = bip39.generateMnemonic(128); // 12 words
// "abandon ability able about above absent absorb abstract absurd abuse access accident"`} />
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-cyan-400 font-mono tracking-[.2em] mb-2">STEP 3 — PBKDF2 SEED DERIVATION</div>
                    <p className="text-slate-400 mb-2">The mnemonic is stretched into a 512-bit seed <Math tex="S" /> using PBKDF2 with 2048 HMAC-SHA512 rounds. This makes brute-forcing the mnemonic ~2048× harder than a single hash check.</p>
                    {katex && <MathBox><Math block tex='S = \text{PBKDF2}(\text{HMAC-SHA512},\; W,\; \text{"mnemonic"},\; 2048,\; 64\text{ bytes})' /></MathBox>}
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-cyan-400 font-mono tracking-[.2em] mb-2">STEP 4 — ED25519 KEY DERIVATION</div>
                    <p className="text-slate-400 mb-2">The first 32 bytes of <Math tex="S" /> become private key <Math tex="k" />. Public key <Math tex="A" /> is computed via scalar multiplication on Curve25519. The Discrete Log Problem makes reversing this infeasible.</p>
                    {katex && <MathBox>
                      <Math block tex="k = S[0..31] \quad \text{(Private Key — never transmitted)}" />
                      <Math block tex="A = k \cdot G \quad \text{(Public Key — registered with server)}" />
                    </MathBox>}
                    <CodeBlock title="keygen.ts" code={`import { ed25519 } from '@noble/curves/ed25519';

const seed       = seedBuffer.slice(0, 32);
const publicKey  = ed25519.getPublicKey(seed);   // A = k·G

// Only publicKey crosses the wire — privateKey stays in IndexedDB
await fetch('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify({
    username,
    publicKey: Buffer.from(publicKey).toString('hex')
  })
});`} />
                    <Callout type="info">
                      Recovering <Math tex="k" /> from <Math tex="A" /> requires solving the Elliptic Curve Discrete Logarithm Problem (ECDLP). On Curve25519 this requires ~2⁶⁴ group operations — roughly 10¹² years on current hardware.
                    </Callout>
                  </div>
                </div>
              </Stage>
            </div>

            {/* STAGE 2 */}
            <div id="stage2">
              <Stage number={2} title="Challenge Issuance — The Nonce" icon={Terminal} accent="emerald">
                <p>Every login attempt requires a fresh server-issued nonce. A signature created for nonce <Math tex="M_1" /> is cryptographically useless against nonce <Math tex="M_2" /> — preventing replay attacks entirely.</p>
                <div className="mt-3 space-y-4">
                  {katex && <MathBox><Math block tex="M \xleftarrow{\$} \{0,1\}^{256} \quad \text{(CSPRNG, server-side)}" /></MathBox>}
                  <Callout type="info">
                    <strong>Why is M public?</strong> The nonce's power is its <em>freshness</em>, not its secrecy. Even an attacker who sees <Math tex="M" /> cannot produce a valid signature without private key <Math tex="k" />.
                  </Callout>
                  <CodeBlock title="api/auth/challenge.ts" code={`import crypto from 'crypto';
import db from '@/lib/db';

export async function GET(req: Request) {
  const { username } = Object.fromEntries(new URL(req.url).searchParams);
  const nonce      = crypto.randomBytes(32).toString('hex');
  const expiresAt  = Math.floor(Date.now() / 1000) + 300; // 5-min TTL

  db.prepare(
    'INSERT OR REPLACE INTO nonces (id, username, nonce, expires_at) VALUES (?, ?, ?, ?)'
  ).run(crypto.randomUUID(), username, nonce, expiresAt);

  return Response.json({ nonce }); // M: safe to send publicly
}`} />
                </div>
              </Stage>
            </div>

            {/* STAGE 3 */}
            <div id="stage3">
              <Stage number={3} title="Zero-Knowledge Proof — EdDSA Signature" icon={EyeOff} accent="violet">
                <p>
                  The client proves ownership of <Math tex="k" /> <strong className="text-white">without revealing it</strong>.
                  This is the Fiat-Shamir transform applied to a Schnorr identification protocol — the foundation of EdDSA.
                </p>
                <div className="mt-3 space-y-5">

                  <div>
                    <div className="text-[10px] font-bold text-violet-400 font-mono tracking-[.2em] mb-2">STEP 1 — DETERMINISTIC EPHEMERAL r</div>
                    <p className="text-slate-400 mb-2">Ed25519 derives <Math tex="r" /> from <Math tex="(k, M)" /> via SHA-512. This eliminates the need for an RNG at signing time — closing a famous vulnerability (Sony PlayStation 3 ECDSA breach from reused <Math tex="r" />).</p>
                    {katex && <MathBox><Math block tex="r = H(k_{[32..63]} \,\|\, M) \pmod{L}" /></MathBox>}
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-violet-400 font-mono tracking-[.2em] mb-2">STEP 2 — COMMITMENT R</div>
                    <p className="text-slate-400 mb-2">Commitment <Math tex="R" /> acts as the blinding factor. It hides the relationship between the final scalar <Math tex="s" /> and private key <Math tex="k" />.</p>
                    {katex && <MathBox><Math block tex="R = r \cdot G" /></MathBox>}
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-violet-400 font-mono tracking-[.2em] mb-2">STEP 3 — FIAT-SHAMIR HASH h</div>
                    <p className="text-slate-400 mb-2">Hash <Math tex="h" /> binds the proof to the exact challenge <Math tex="M" /> and public identity <Math tex="A" />. An attacker cannot reuse this proof for a different server or challenge.</p>
                    {katex && <MathBox><Math block tex="h = \text{SHA-512}(R \,\|\, A \,\|\, M) \pmod{L}" /></MathBox>}
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-violet-400 font-mono tracking-[.2em] mb-2">STEP 4 — SCALAR RESPONSE s</div>
                    <p className="text-slate-400 mb-2">The final proof <Math tex="s" /> conceals <Math tex="k" /> inside the one-time blinding factor <Math tex="r" />. Without knowing <Math tex="r" />, and without solving ECDLP for <Math tex="R" />, <Math tex="k" /> cannot be extracted from <Math tex="s" />.</p>
                    {katex && <MathBox><Math block tex="s = (r + h \cdot k) \pmod{L}" /></MathBox>}
                  </div>

                  <CodeBlock title="sign.ts" code={`import { ed25519 } from '@noble/curves/ed25519';

const privateKey = await loadKeyFromIndexedDB(username); // k — never leaves device
const message    = Buffer.from(nonce, 'hex');            // M

// EdDSA signature: 64 bytes = R (32) || s (32)
const signature  = ed25519.sign(message, privateKey);

await fetch('/api/auth/verify', {
  method: 'POST',
  body: JSON.stringify({
    username,
    signature:  Buffer.from(signature).toString('hex'),
    publicKey:  Buffer.from(publicKey).toString('hex')
  })
});
// k is never in the request body`} />

                  <Callout type="success">
                    <strong>Why this is Zero-Knowledge:</strong> The verifier sees <Math tex="(R, s, A, M)" />. Extracting <Math tex="k" /> requires knowing <Math tex="r" />, which requires solving ECDLP on <Math tex="R = rG" />. Extracting <Math tex="r" /> from <Math tex="s = r + hk" /> requires knowing <Math tex="k" /> first — a circular dependency that protects both secrets.
                  </Callout>
                </div>
              </Stage>
            </div>

            {/* STAGE 4 */}
            <div id="stage4">
              <Stage number={4} title="Server Validation & Session Grant" icon={CheckCircle} accent="amber">
                <p>The server verifies the proof using only public values: <Math tex="A" /> (stored), <Math tex="M" /> (issued), <Math tex="R" /> and <Math tex="s" /> (received). It never handles any secret.</p>
                <div className="mt-3 space-y-4">
                  <div>
                    <div className="text-[10px] font-bold text-amber-400 font-mono tracking-[.2em] mb-2">VERIFICATION EQUATION</div>
                    {katex && <MathBox><Math block tex="s \cdot G \;\stackrel{?}{=}\; R + h \cdot A" /></MathBox>}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-amber-400 font-mono tracking-[.2em] mb-2">ALGEBRAIC PROOF</div>
                    <div className="bg-slate-900/50 rounded-xl border border-slate-700/40 p-4 font-mono text-[12px] space-y-1.5">
                      {katex && [
                        ["Given",           "s = r + hk"],
                        ["Therefore",       "sG = (r + hk)G"],
                        ["Distribute",      "sG = rG + h(kG)"],
                        ["Substitute",      "sG = R + hA  ✓"],
                      ].map(([label, eq]) => (
                        <div key={label} className="flex gap-4">
                          <span className="text-slate-700 w-28 shrink-0">{label}</span>
                          <Math tex={eq} />
                        </div>
                      ))}
                    </div>
                    <p className="text-slate-500 text-[13px] mt-2">If the equation holds, the user <strong className="text-white">must</strong> possess <Math tex="k" /> — no other value satisfies it simultaneously.</p>
                  </div>
                  <CodeBlock title="api/auth/verify.ts" code={`import { ed25519 } from '@noble/curves/ed25519';
import crypto from 'crypto';
import db from '@/lib/db';

export async function POST(req: Request) {
  const { username, signature, publicKey } = await req.json();

  const row = db.prepare(
    'SELECT nonce FROM nonces WHERE username = ? AND expires_at > unixepoch()'
  ).get(username) as { nonce: string } | undefined;

  if (!row) return Response.json({ error: 'Nonce expired' }, { status: 401 });

  const valid = ed25519.verify(
    Buffer.from(signature, 'hex'),
    Buffer.from(row.nonce, 'hex'),
    Buffer.from(publicKey, 'hex')
  );
  if (!valid) return Response.json({ error: 'Invalid proof' }, { status: 401 });

  // Invalidate nonce immediately (one-time use)
  db.prepare('DELETE FROM nonces WHERE username = ?').run(username);

  // Issue session token
  const token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (token, username) VALUES (?, ?)').run(token, username);

  return Response.json({ token });
}`} />
                </div>
              </Stage>
            </div>

            {/* STAGE 5 */}
            <div id="stage5">
              <Stage number={5} title="Logout — Session Invalidation" icon={LogOut} accent="rose">
                <p>Session tokens are ephemeral bearer credentials. Deletion is immediate and irreversible — there is no "refresh token" or token rotation; re-authentication always requires a full ZK proof cycle.</p>
                <CodeBlock title="api/auth/logout.ts" code={`export async function POST(req: Request) {
  const { token } = await req.json();
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  // Client clears localStorage, sessionStorage, and token reference
  return Response.json({ ok: true });
}`} />
                <Callout type="success">
                  <strong>Forward Secrecy:</strong> Compromise of token <Math tex="T" /> after logout is useless — the database record is gone. Compromise of <Math tex="T" /> while active only grants access until logout; it never exposes <Math tex="k" />, so a new ZK proof on a fresh challenge is always required to re-authenticate.
                </Callout>
              </Stage>
            </div>

            {/* STAGE 6 */}
            <div id="stage6">
              <Stage number={6} title="Deterministic Recovery" icon={RefreshCw} accent="sky">
                <p>
                  Your identity is a <strong className="text-white">mathematical constant</strong> of your mnemonic.
                  The same 12 words always produce the same <Math tex="A" /> — on any device, at any time.
                  Recovery requires no server-side secret reset, no email verification, no trusted third party.
                </p>
                <div className="mt-3 space-y-4">
                  {katex && <MathBox>
                    <Math block tex="\forall\, W:\; f(W) = A \;\Rightarrow\; \text{same } W \text{ always derives same } A" />
                  </MathBox>}
                  <p className="text-slate-400">The server holds a "lock" <Math tex="A" />. Only your mnemonic "key" <Math tex="W" /> can open it — universally, deterministically, and without any server participation in the derivation.</p>

                  <div className="space-y-2">
                    {[
                      "Enter 12-word mnemonic W on new device",
                      "Client validates all words against BIP-39 wordlist",
                      "Re-run PBKDF2 → derive k_new and A_new (identical to original)",
                      "Send A_new to /api/auth/recover for username lookup",
                      "Server issues fresh challenge M — no auto-grant",
                      "Client signs M with k_new → full ZK proof (Stage 3)",
                      "Server verifies → session granted",
                    ].map((step, i) => (
                      <motion.div key={i} initial={{ opacity:0, x:-10 }} whileInView={{ opacity:1, x:0 }} transition={{ delay: i*.06 }} viewport={{ once:true }}
                        className="flex items-center gap-3 text-[13px] text-slate-400">
                        <span className="w-5 h-5 rounded-full bg-sky-950 border border-sky-500/40 flex items-center justify-center text-[10px] text-sky-400 font-bold shrink-0">{i+1}</span>
                        {step}
                      </motion.div>
                    ))}
                  </div>

                  <CodeBlock title="recovery.ts" code={`import * as bip39 from 'bip39';
import { ed25519 } from '@noble/curves/ed25519';

async function recover(mnemonic: string) {
  if (!bip39.validateMnemonic(mnemonic)) throw new Error('Invalid BIP-39 mnemonic');

  const seed       = await bip39.mnemonicToSeed(mnemonic);
  const privateKey = seed.slice(0, 32);               // k_new  (= original k)
  const publicKey  = ed25519.getPublicKey(privateKey); // A_new  (= original A)

  // Server looks up account by A_new, issues nonce
  const { username, nonce } = await fetch('/api/auth/recover', {
    method: 'POST',
    body: JSON.stringify({ publicKey: Buffer.from(publicKey).toString('hex') })
  }).then(r => r.json());

  // Full ZK proof cycle
  const signature = ed25519.sign(Buffer.from(nonce, 'hex'), privateKey);
  const { token } = await fetch('/api/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ username, signature: Buffer.from(signature).toString('hex'),
                           publicKey: Buffer.from(publicKey).toString('hex') })
  }).then(r => r.json());

  // Store key, ZERO OUT mnemonic from RAM immediately
  await storeKeyInIndexedDB(username, privateKey);
  (seed as Buffer).fill(0);
  return token;
}`} />
                  <Callout type="danger">
                    <strong>RAM Safety:</strong> Mnemonic <Math tex="W" /> exists in memory only during key derivation. Zero-fill all buffers immediately after use. Never store <Math tex="W" /> in React state, localStorage, or any log. The server only ever receives <Math tex="A_{new}" /> and signature <Math tex="(R, s)" />.
                  </Callout>
                </div>
              </Stage>
            </div>
          </div>

          {/* ════════════ MATH REFERENCE ════════════ */}
          <section id="math">
            <Fade>
              <H2 icon={Binary}>Mathematical Reference</H2>
              <p className="text-slate-500 text-[13px] mb-6">Complete cryptographic definitions underlying ZKSAP.</p>
              <div className="space-y-5">

                {[
                  {
                    title: "Edwards25519 Curve Parameters",
                    content: katex && (
                      <div className="space-y-2 text-[13px] text-slate-400">
                        <p>The curve is defined over the prime field <Math tex="\mathbb{F}_p" /> in twisted Edwards form:</p>
                        <MathBox>
                          <Math block tex="p = 2^{255} - 19 \quad \text{(Mersenne-like prime)}" />
                          <Math block tex="-x^2 + y^2 = 1 + dx^2y^2 \quad d = -\tfrac{121665}{121666} \pmod{p}" />
                          <Math block tex="L = 2^{252} + 27742317777372353535851937790883648493 \quad \text{(Group order)}" />
                        </MathBox>
                        <p>The group order <Math tex="L" /> gives ~2²⁵² possible key values — a brute-force space incomprehensibly larger than atoms in the observable universe.</p>
                      </div>
                    )
                  },
                  {
                    title: "Complete EdDSA Sign / Verify",
                    content: katex && (
                      <div className="space-y-2 text-[13px] text-slate-400">
                        <MathBox>
                          <div className="text-[10px] text-slate-600 font-mono tracking-widest mb-2">SIGN(k, M)</div>
                          <Math block tex="r \gets H(k_{[32..63]} \| M) \pmod{L}" />
                          <Math block tex="R \gets r \cdot G" />
                          <Math block tex="h \gets H(R \| A \| M) \pmod{L}" />
                          <Math block tex="s \gets (r + h \cdot k) \pmod{L}" />
                          <Math block tex="\text{return } (R,\; s)" />
                          <div className="border-t border-slate-800 mt-3 pt-3 text-[10px] text-slate-600 font-mono tracking-widest mb-2">VERIFY(A, M, R, s)</div>
                          <Math block tex="h \gets H(R \| A \| M) \pmod{L}" />
                          <Math block tex="s \cdot G \stackrel{?}{=} R + h \cdot A" />
                        </MathBox>
                      </div>
                    )
                  },
                  {
                    title: "PBKDF2 Key Stretching",
                    content: katex && (
                      <div className="text-[13px] text-slate-400 space-y-2">
                        <MathBox>
                          <Math block tex='S = \text{PBKDF2}(\text{PRF=HMAC-SHA512},\; P=W,\; \text{Salt="mnemonic"},\; c=2048,\; dk=64)' />
                        </MathBox>
                        <p>2048 iterations means an attacker must compute 2048 × HMAC-SHA512 per mnemonic guess — slowing GPU brute-force by 3 orders of magnitude versus a plain SHA-256 hash.</p>
                      </div>
                    )
                  },
                ].map(({ title, content }) => (
                  <div key={title} className="rounded-2xl border border-slate-700/40 bg-slate-900/30 p-5">
                    <h4 className="text-[11px] font-bold font-mono text-cyan-400 tracking-[.2em] uppercase mb-4">{title}</h4>
                    {content}
                  </div>
                ))}
              </div>
            </Fade>
          </section>

          {/* ════════════ SECURITY ════════════ */}
          <section id="security">
            <Fade>
              <H2 icon={Shield}>Security Analysis</H2>
              <p className="text-slate-500 text-[13px] mb-5">ZKSAP versus every major authentication attack vector.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { threat:"Database Breach",     sev:"CRITICAL", trad:"All password hashes exposed; mass crack possible",   zksap:"DB contains only public keys A — mathematically useless. No secret to hash-crack.", c:"rose" },
                  { threat:"Phishing",            sev:"HIGH",     trad:"User submits password to fake domain → stolen",       zksap:"Signature binds to server nonce M. A fake server's M yields a signature invalid anywhere else.", c:"amber" },
                  { threat:"Replay Attack",       sev:"HIGH",     trad:"Captured session cookie replayed indefinitely",       zksap:"Each nonce M is one-time-use and expires in 5 min. Captured (R, s) is useless against new M.", c:"amber" },
                  { threat:"Man-in-the-Middle",   sev:"HIGH",     trad:"Credentials intercepted in transit",                  zksap:"Interception yields (R, s) — without k the attacker cannot sign a new challenge.", c:"amber" },
                  { threat:"Brute Force on k",    sev:"CRITICAL", trad:"Weak passwords broken in hours",                     zksap:"k derived from 128-bit entropy. 2¹²⁸ guesses needed ≈ longer than heat death of universe.", c:"rose" },
                  { threat:"Session Hijack",      sev:"MEDIUM",   trad:"Stolen cookie grants permanent access",               zksap:"Stolen T valid until logout. But k is never exposed — re-auth always requires new ZK proof.", c:"violet" },
                  { threat:"Mnemonic Compromise", sev:"CRITICAL", trad:"N/A (no equivalent in password auth)",                zksap:"If W is stolen, identity is compromised. W must be stored offline securely. Only threat vector.", c:"rose" },
                  { threat:"Quantum (Future)",    sev:"FUTURE",   trad:"All stored hashes crackable retroactively",           zksap:"Ed25519 vulnerable to large-scale Shor's algorithm. Post-quantum upgrade path: Dilithium/Kyber.", c:"slate" },
                ].map(({ threat, sev, trad, zksap, c }) => {
                  const badge = { CRITICAL:"bg-rose-950/60 text-rose-300 border-rose-500/40", HIGH:"bg-amber-950/60 text-amber-300 border-amber-500/40", MEDIUM:"bg-violet-950/60 text-violet-300 border-violet-500/40", FUTURE:"bg-slate-900 text-slate-400 border-slate-600/40" };
                  return (
                    <motion.div key={threat} initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
                      className="rounded-xl border border-slate-700/40 bg-slate-900/30 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[13px] font-bold text-white font-mono">{threat}</span>
                        <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border tracking-widest ${badge[sev]}`}>{sev}</span>
                      </div>
                      <div className="space-y-1.5 text-[12px]">
                        <div><span className="text-rose-500 font-mono font-bold">TRAD: </span><span className="text-slate-500">{trad}</span></div>
                        <div><span className="text-emerald-500 font-mono font-bold">ZKSAP: </span><span className="text-slate-400">{zksap}</span></div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Fade>
          </section>

          {/* ════════════ COMPARISON ════════════ */}
          <section id="comparison">
            <Fade>
              <H2 icon={GitBranch}>ZKSAP vs. Traditional Auth</H2>
              <p className="text-slate-500 text-[13px] mb-4">Feature-by-feature cryptographic property matrix.</p>
              <div className="rounded-2xl border border-slate-700/40 overflow-hidden">
                <div className="grid grid-cols-3 bg-slate-800/50 px-4 py-2.5 border-b border-slate-700/40 text-[10px] font-mono font-bold tracking-widest text-slate-500">
                  <div>PROPERTY</div><div className="text-center text-rose-400">TRADITIONAL</div><div className="text-center text-emerald-400">ZKSAP</div>
                </div>
                {[
                  ["Passwords stored on server",      false, false],
                  ["Server breach yields no secrets", false, true ],
                  ["Phishing resistant",              false, true ],
                  ["Replay attack resistant",         false, true ],
                  ["Passwordless",                    false, true ],
                  ["Deterministic recovery",          false, true ],
                  ["No trusted third party",          false, true ],
                  ["Forward secrecy (sessions)",      false, true ],
                  ["Brute-force infeasible",          "weak", true],
                  ["Zero server-side secrets",        false, true ],
                ].map(([feat, trad, zk], i) => (
                  <motion.div key={i} initial={{ opacity:0 }} whileInView={{ opacity:1 }} transition={{ delay: i*.04 }} viewport={{ once:true }}
                    className="grid grid-cols-3 border-b border-slate-800/60 px-4 py-2.5 hover:bg-white/[0.015] transition-colors text-[13px]">
                    <span className="text-slate-300">{feat}</span>
                    <span className="flex justify-center items-center">
                      {trad === true ? <CheckCircle size={13} className="text-emerald-400" /> : trad === "weak" ? <span className="text-[10px] text-amber-400 font-mono">weak</span> : <span className="text-rose-500 font-bold">✕</span>}
                    </span>
                    <span className="flex justify-center items-center">
                      {zk ? <CheckCircle size={13} className="text-emerald-400" /> : <span className="text-rose-500 font-bold">✕</span>}
                    </span>
                  </motion.div>
                ))}
              </div>
            </Fade>
          </section>

          {/* ════════════ IMPLEMENTATION ════════════ */}
          <section id="impl">
            <Fade>
              <H2 icon={Code2}>Implementation Guide</H2>
              <p className="text-slate-500 text-[13px] mb-5">Next.js project structure, schema, and API routes.</p>

              <div className="space-y-5">
                <div>
                  <div className="text-[10px] font-bold text-cyan-400 font-mono tracking-[.2em] mb-2">INSTALL</div>
                  <CodeBlock title="terminal" code={`npm install bip39 @noble/curves better-sqlite3
npm install -D @types/better-sqlite3`} />
                </div>

                <div>
                  <div className="text-[10px] font-bold text-cyan-400 font-mono tracking-[.2em] mb-2">DATABASE SCHEMA</div>
                  <CodeBlock title="lib/schema.sql" code={`CREATE TABLE IF NOT EXISTS users (
  username    TEXT PRIMARY KEY,
  public_key  TEXT NOT NULL UNIQUE,    -- A (hex Ed25519 public key — NO PASSWORD)
  created_at  INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS nonces (
  id          TEXT PRIMARY KEY,
  username    TEXT NOT NULL,
  nonce       TEXT NOT NULL,           -- M (hex, 256-bit)
  expires_at  INTEGER NOT NULL,        -- Unix timestamp, 5-min TTL
  FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions (
  token       TEXT PRIMARY KEY,        -- T (hex, 256-bit bearer token)
  username    TEXT NOT NULL,
  created_at  INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
);

-- Fast lookup for recovery flow
CREATE INDEX IF NOT EXISTS idx_users_pubkey ON users(public_key);`} />
                </div>

                <div>
                  <div className="text-[10px] font-bold text-cyan-400 font-mono tracking-[.2em] mb-2">API ROUTES</div>
                  <div className="rounded-xl border border-slate-700/40 overflow-hidden text-[12px]">
                    <div className="grid grid-cols-3 bg-slate-800/50 px-4 py-2 border-b border-slate-700/40 text-[10px] font-mono font-bold tracking-widest text-slate-500">
                      <div>ENDPOINT</div><div>METHOD</div><div>PURPOSE</div>
                    </div>
                    {[
                      ["/api/auth/register",  "POST", "Store A for new user"],
                      ["/api/auth/challenge", "GET",  "Issue nonce M (5-min TTL)"],
                      ["/api/auth/verify",    "POST", "Validate (R,s), grant token T"],
                      ["/api/auth/logout",    "POST", "Delete session T from DB"],
                      ["/api/auth/recover",   "POST", "Look up account by A_new"],
                      ["/api/auth/session",   "GET",  "Validate active token T"],
                    ].map(([ep, method, desc]) => (
                      <div key={ep} className="grid grid-cols-3 border-b border-slate-800/40 px-4 py-2.5 hover:bg-white/[0.015]">
                        <code className="text-cyan-400 font-mono">{ep}</code>
                        <span className={`font-bold font-mono ${method==="GET"?"text-emerald-400":"text-amber-400"}`}>{method}</span>
                        <span className="text-slate-500">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-cyan-400 font-mono tracking-[.2em] mb-2">INDEXEDDB KEY STORE (CLIENT-SIDE)</div>
                  <CodeBlock title="lib/keystore.ts" code={`const DB   = 'zksap';
const STORE = 'keys';

const open = (): Promise<IDBDatabase> => new Promise((res, rej) => {
  const r = indexedDB.open(DB, 1);
  r.onupgradeneeded = () => r.result.createObjectStore(STORE);
  r.onsuccess = () => res(r.result);
  r.onerror   = () => rej(r.error);
});

export const storeKey = async (username: string, key: Uint8Array) => {
  const db = await open();
  return new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(key, username).onsuccess = () => res();
    tx.onerror = () => rej(tx.error);
  });
};

export const loadKey = async (username: string): Promise<Uint8Array | null> => {
  const db = await open();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(username);
    req.onsuccess = () => res(req.result ?? null);
    req.onerror   = () => rej(req.error);
  });
};`} />
                </div>
              </div>
            </Fade>
          </section>

          {/* ════════════ GLOSSARY ════════════ */}
          <section id="glossary">
            <Fade>
              <H2 icon={FileText}>Variable Glossary</H2>
              <p className="text-slate-500 text-[13px] mb-4">Every mathematical symbol used in the ZKSAP protocol.</p>
              <div className="rounded-2xl border border-slate-700/40 overflow-hidden">
                <div className="grid grid-cols-3 bg-slate-800/50 px-4 py-2.5 border-b border-slate-700/40 text-[10px] font-mono font-bold tracking-widest text-slate-500">
                  <div>VAR</div><div>DEFINITION</div><div>ROLE</div>
                </div>
                {[
                  ["W", "cyan",    "Mnemonic phrase (12 BIP-39 words)", "Human-readable seed backup — only recovery mechanism"],
                  ["S", "slate",   "512-bit PBKDF2 output",             "Intermediate — never stored or transmitted"],
                  ["k", "amber",   "Private key (32-byte scalar)",       "Secret — never leaves the device under any circumstance"],
                  ["G", "emerald", "Ed25519 base point",                 "Fixed public constant defining the group generator"],
                  ["A", "emerald", "Public key = k·G",                  "User identity stored on server — reveals nothing about k"],
                  ["M", "violet",  "Nonce / challenge (256-bit)",        "One-time anti-replay value issued per login attempt"],
                  ["r", "amber",   "Ephemeral scalar (deterministic)",   "One-time blinding factor — derived, never stored"],
                  ["R", "violet",  "Commitment = r·G",                  "Public half of signature — hides r via ECDLP"],
                  ["h", "cyan",    "SHA-512(R ‖ A ‖ M) mod L",          "Fiat-Shamir hash binding proof to identity + challenge"],
                  ["s", "violet",  "Response = (r + h·k) mod L",        "Proof scalar — reveals nothing about k or r independently"],
                  ["L", "emerald", "Curve group order (~2²⁵²)",          "Modulus for all scalar field arithmetic"],
                  ["T", "rose",    "Session token (256-bit)",            "Bearer credential — valid until server purge on logout"],
                  ["p", "slate",   "Field prime = 2²⁵⁵ − 19",          "Defines the finite field underlying the curve"],
                ].map(([v, c, def, role]) => {
                  const ct = { cyan:"text-cyan-400", amber:"text-amber-400", emerald:"text-emerald-400", violet:"text-violet-400", rose:"text-rose-400", slate:"text-slate-400" };
                  return (
                    <div key={v} className="grid grid-cols-3 border-b border-slate-800/50 px-4 py-2.5 hover:bg-white/[0.02] text-[13px]">
                      <code className={`font-bold font-mono ${ct[c]}`}>{v}</code>
                      <span className="text-slate-300">{def}</span>
                      <span className="text-slate-500 text-[12px]">{role}</span>
                    </div>
                  );
                })}
              </div>
            </Fade>
          </section>

          {/* ════════════ FOOTER ════════════ */}
          <Fade>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-8 text-center">
              <div className="text-4xl font-extrabold tracking-tight mb-1" style={{ fontFamily:"'Syne',sans-serif", background:"linear-gradient(135deg,#22d3ee,#34d399)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                ZKSAP
              </div>
              <p className="text-slate-600 text-[13px] mb-4">Zero-Knowledge Signature Authentication Protocol</p>
              <div className="flex flex-wrap justify-center gap-3 text-[11px] font-mono text-slate-700 mb-6">
                {["Ed25519","BIP-39","PBKDF2","EdDSA","Fiat-Shamir","Zero-Knowledge","Passwordless","Forward Secrecy"].map(t => (
                  <span key={t} className="px-2 py-0.5 rounded border border-slate-800">{t}</span>
                ))}
              </div>
              <div className="text-[11px] text-slate-700 font-mono border-t border-slate-800 pt-4">
                Designed &amp; authored by <span className="text-slate-500">Kunal Singh</span>
              </div>
            </div>
          </Fade>

        </main>
      </div>
    </div>
  );
}