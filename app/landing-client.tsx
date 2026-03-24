"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Shield, Zap, FileText, MapPin, Check } from "lucide-react";

/* ─── Brand tokens ──────────────────────────────────────────────────────────
   coral:      #EB7146   primary accent
   coral-dark: #C85A2E   gradient depth
   coral-lt:   #F4A079   light / glow
   ink:        #1A1A1A   text / dark surfaces
   slate:      #6B7280   secondary text
   hero-bg:    #0f0d0c   dark hero / nav background
   dust:       #F9F9F8   light section background
   ──────────────────────────────────────────────────────────────────────── */

/* ─── Crebrid hexagonal mark ────────────────────────────────────────────── */
function CrebridMark({ size = 32, gradId = "mark-g" }: { size?: number; gradId?: string }) {
  const outer = "20,4 33.86,12 33.86,28 20,36 6.14,28 6.14,12";
  const spokes: [number, number, number, number][] = [
    [20, 20, 20, 4], [20, 20, 33.86, 12], [20, 20, 33.86, 28],
    [20, 20, 20, 36], [20, 20, 6.14, 28], [20, 20, 6.14, 12],
  ];
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <polygon points={outer} stroke={`url(#${gradId})`} strokeWidth="1.4" fill="none" />
      {spokes.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={`url(#${gradId})`} strokeWidth="0.5" opacity="0.4" />
      ))}
      <circle cx="20" cy="20" r="2.2" fill={`url(#${gradId})`} />
      <defs>
        <linearGradient id={gradId} x1="6" y1="4" x2="34" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F4A079" />
          <stop offset="100%" stopColor="#D4633A" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Scramble animation helpers ────────────────────────────────────────── */
function scramble(value: string): string {
  return value.replace(/\d/g, () => String(Math.floor(Math.random() * 10)));
}

function AnimatedField({ label, value, locked }: { label: string; value: string; locked: boolean }) {
  // Initialize with real value so server/client initial render match (no hydration error)
  const [display, setDisplay] = useState(value);
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (locked) {
      if (ivRef.current) clearInterval(ivRef.current);
      setDisplay(value);
      return;
    }
    ivRef.current = setInterval(() => setDisplay(scramble(value)), 55);
    return () => { if (ivRef.current) clearInterval(ivRef.current); };
  }, [locked, value]);

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm" style={{ color: "#6B7280" }}>{label}</span>
      <span
        className="font-mono text-sm font-semibold tabular-nums transition-colors duration-100"
        style={{ color: locked ? "#1A1A1A" : "#CBD5E1" }}
      >
        {display}
      </span>
    </div>
  );
}

/* ─── Term Sheet Card ───────────────────────────────────────────────────── */
const TERM_FIELDS = [
  { label: "Loan Amount",    value: "$285,000" },
  { label: "ARV",            value: "$420,000" },
  { label: "Interest Rate",  value: "9.25%" },
  { label: "Loan Term",      value: "12 months" },
];

function TermSheetCard() {
  const [locked, setLocked] = useState<Set<number>>(new Set());
  const [approved, setApproved] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [approvedKey, setApprovedKey] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const run = useCallback(() => {
    if (animating) return;
    clearTimers();
    setLocked(new Set());
    setApproved(false);
    setAnimating(true);

    TERM_FIELDS.forEach((_, i) => {
      const t = setTimeout(
        () => setLocked((prev) => new Set([...Array.from(prev), i])),
        400 + i * 320
      );
      timers.current.push(t);
    });

    const done = setTimeout(() => {
      setApproved(true);
      setApprovedKey((k) => k + 1);
      setAnimating(false);
    }, 400 + TERM_FIELDS.length * 320 + 300);
    timers.current.push(done);
  }, [animating]);

  useEffect(() => {
    const t = setTimeout(run, 900);
    return () => { clearTimeout(t); clearTimers(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden w-full"
      style={{
        boxShadow: approved
          ? "0 0 0 1.5px rgba(235,113,70,0.15), 0 20px 60px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.12)"
          : "0 8px 48px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1)",
        transition: "box-shadow 0.6s ease",
        cursor: approved && !animating ? "pointer" : "default",
      }}
      onMouseEnter={() => { if (approved && !animating) run(); }}
      title={approved && !animating ? "Hover to replay" : undefined}
    >
      {/* Header: dark with badges */}
      <div className="px-5 pt-4 pb-3.5" style={{ background: "#1A1A1A" }}>
        <div className="flex items-center gap-2 mb-2.5">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
            style={{ background: "rgba(235,113,70,0.18)", color: "#F4A079" }}
          >
            White-Labeled
          </span>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
          >
            Fix & Flip
          </span>
        </div>
        <p className="text-xs font-semibold tracking-[0.22em] uppercase" style={{ color: "rgba(255,255,255,0.4)" }}>
          Term Sheet
        </p>
      </div>

      {/* Address row */}
      <div
        className="flex items-center gap-2 px-5 py-3"
        style={{ borderBottom: "1px solid #F3F4F6", background: "#FAFAFA" }}
      >
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#EB7146" }} />
        <span className="text-xs font-medium" style={{ color: "#6B7280" }}>
          2847 Oak Creek Dr, Dallas, TX 75208
        </span>
      </div>

      {/* Animated fields */}
      <div className="px-5 pt-1 pb-1">
        {TERM_FIELDS.map((f, i) => (
          <AnimatedField key={f.label} label={f.label} value={f.value} locked={locked.has(i)} />
        ))}
      </div>

      {/* Pre-Approved stamp */}
      <div
        className="mx-5 overflow-hidden"
        style={{
          height: approved ? 48 : 0,
          transition: "height 0.25s cubic-bezier(0.4,0,0.2,1)",
          marginBottom: approved ? 4 : 0,
          marginTop: approved ? 8 : 0,
        }}
      >
        <div
          key={approvedKey}
          className="flex items-center justify-center gap-2 rounded-xl py-3"
          style={{
            background: "linear-gradient(135deg, #059669, #047857)",
            animation: "stampIn 0.45s cubic-bezier(0.34,1.4,0.64,1) forwards",
            opacity: 0,
            boxShadow: "0 3px 12px rgba(5,150,105,0.3)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
            <path d="M6.5 10.5L8.8 12.8L13.5 7.5" stroke="white" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-white font-bold text-xs tracking-[0.2em] uppercase">Pre-Approved</span>
        </div>
      </div>

      {/* Card footer */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderTop: "1px solid #F3F4F6" }}
      >
        <span className="text-[11px]" style={{ color: "#9CA3AF" }}>
          Underwritten in-house · Dallas, TX
        </span>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: "rgba(235,113,70,0.1)", color: "#EB7146" }}
        >
          18 hrs
        </span>
      </div>
    </div>
  );
}

/* ─── Full landing page ─────────────────────────────────────────────────── */
export default function LandingClient() {
  return (
    <div className="min-h-screen" style={{ background: "#FFFFFF" }}>

      {/* ════════════════════════════════════════════════════════════════
          NAV + HERO  (dark background, seamless)
          ════════════════════════════════════════════════════════════ */}
      <div style={{ background: "#0f0d0c" }}>

        {/* ── Navigation ─────────────────────────────────────────────── */}
        <header
          className="sticky top-0 z-30"
          style={{
            background: "rgba(15,13,12,0.9)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <CrebridMark size={28} gradId="nav-grad" />
              <div>
                <span className="font-semibold text-white text-sm" style={{ letterSpacing: "0.02em" }}>
                  Crebrid
                </span>
                <span className="text-[10px] tracking-widest uppercase ml-2" style={{ color: "rgba(244,160,121,0.7)" }}>
                  Broker Portal
                </span>
              </div>
            </div>

            {/* Nav links (desktop) */}
            <nav className="hidden md:flex items-center gap-6">
              {["Loan Programs", "Why Crebrid", "How It Works"].map((label) => (
                <a
                  key={label}
                  href={`#${label.toLowerCase().replace(/ /g, "-")}`}
                  className="text-sm transition-colors duration-150"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.9)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
                >
                  {label}
                </a>
              ))}
            </nav>

            {/* Right CTA group */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                href="/login"
                className="hidden md:inline-flex text-sm transition-colors duration-150 font-medium"
                style={{ color: "rgba(255,255,255,0.6)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.95)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
              >
                Log In
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-lg transition-all duration-150"
                style={{
                  background: "linear-gradient(135deg, #EB7146, #C85A2E)",
                  boxShadow: "0 2px 10px rgba(235,113,70,0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 18px rgba(235,113,70,0.5)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 10px rgba(235,113,70,0.3)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Apply to Partner
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </header>

        {/* ── Hero section ───────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-28 md:pt-24 md:pb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 lg:gap-20 items-center">

            {/* Left: copy */}
            <div>
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 text-xs font-semibold rounded-full px-3.5 py-1.5 mb-7 tracking-wider"
                style={{
                  background: "rgba(235,113,70,0.12)",
                  color: "#F4A079",
                  border: "1px solid rgba(235,113,70,0.22)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#EB7146" }} />
                Hard Money Done Right — Nationwide
              </div>

              {/* Headline */}
              <h1
                className="font-bold leading-[1.07] tracking-tight mb-5"
                style={{ fontSize: "clamp(2.4rem, 5vw, 3.4rem)", color: "#FFFFFF" }}
              >
                <span style={{ color: "#EB7146" }}>Your</span> Clients.{" "}
                <span style={{ color: "#EB7146" }}>Your</span>{" "}
                <span style={{ color: "#EB7146" }}>Brand.</span>
                <br />
                Our Capital.
              </h1>

              <p
                className="text-base leading-relaxed mb-9"
                style={{ color: "rgba(255,255,255,0.5)", maxWidth: 460 }}
              >
                Crebrid is the hard money lender that works behind you, not around you.
                Bring us your deals — we move fast, protect your client relationships,
                and put a check in your hand at the closing table.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all duration-150"
                  style={{
                    background: "linear-gradient(135deg, #EB7146 0%, #C85A2E 100%)",
                    boxShadow: "0 4px 20px rgba(235,113,70,0.38)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 6px 28px rgba(235,113,70,0.55)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(235,113,70,0.38)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  Apply to Partner
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-150"
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                  }}
                >
                  Log In to Portal
                </Link>
              </div>
            </div>

            {/* Right: Term sheet card + floating elements */}
            <div className="flex justify-center md:justify-end">
              <div className="relative" style={{ width: "100%", maxWidth: 390 }}>

                {/* Floating: Decision in 24hrs badge */}
                <div
                  className="absolute z-10 flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold"
                  style={{
                    top: -16,
                    right: -8,
                    background: "rgba(15,13,12,0.95)",
                    border: "1px solid rgba(235,113,70,0.3)",
                    color: "#F4A079",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: "#EB7146" }}
                  />
                  Decision in 24hrs
                </div>

                {/* Term sheet card */}
                <TermSheetCard />

                {/* Floating: Broker fee card */}
                <div
                  className="absolute z-10 rounded-xl px-4 py-3"
                  style={{
                    bottom: -20,
                    left: -16,
                    background: "rgba(255,255,255,0.97)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)",
                    backdropFilter: "blur(12px)",
                    minWidth: 178,
                    border: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <p
                    className="text-[9px] font-semibold tracking-[0.2em] uppercase mb-0.5"
                    style={{ color: "#9CA3AF" }}
                  >
                    Your Broker Fee
                  </p>
                  <p
                    className="text-2xl font-bold leading-none"
                    style={{ color: "#1A1A1A" }}
                  >
                    $8,500
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "#059669" }}
                    />
                    <p className="text-[11px]" style={{ color: "#6B7280" }}>
                      Wired at closing
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>
      </div>{/* end dark hero */}


      {/* ════════════════════════════════════════════════════════════════
          SECTION 2 — Built for Brokers Who Close Deals
          ════════════════════════════════════════════════════════════ */}
      <section id="why-crebrid" style={{ background: "#FFFFFF" }}>
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <div className="mb-12 md:mb-14 max-w-2xl">
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
              style={{ color: "#1A1A1A" }}
            >
              Built for Brokers Who Close Deals
            </h2>
            <p className="text-lg leading-relaxed" style={{ color: "#6B7280" }}>
              We built the Crebrid Broker Program around one idea: make it as easy as
              possible for you to bring us deals and get paid.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                Icon: Shield,
                title: "We'll Never Go Around You",
                body: "Your borrower is your borrower — period. We don't make unsolicited contact with your clients, and we never will. Your fee is locked in on the commitment letter and paid directly to you at closing. No surprises, no end-arounds.",
              },
              {
                Icon: Zap,
                title: "Decisions in 24 Hours",
                body: "We underwrite in-house in Dallas. No loan committees, no waiting weeks to hear back. Submit a complete package and you'll have a decision the next business day — often sooner.",
              },
              {
                Icon: FileText,
                title: "Instant White-Labeled Term Sheets",
                body: "Walk into your next client meeting with a branded term sheet already in hand. Generate one in under a minute through the portal — your company name, your contact info. Crebrid stays in the background until close.",
              },
            ].map(({ Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl p-7 flex flex-col gap-4"
                style={{
                  background: "#FAFAFA",
                  border: "1px solid #F0F0F0",
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(235,113,70,0.1)" }}
                >
                  <Icon className="w-5 h-5" style={{ color: "#EB7146" }} />
                </div>
                <h3 className="font-bold text-base" style={{ color: "#1A1A1A" }}>
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════════════════════════
          SECTION 3 — Every Deal Has a Home Here
          ════════════════════════════════════════════════════════════ */}
      <section id="loan-programs" style={{ background: "#F9F9F8", borderTop: "1px solid #F0F0F0" }}>
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <div className="mb-12 max-w-2xl">
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
              style={{ color: "#1A1A1A" }}
            >
              Every Deal Has a Home Here
            </h2>
            <p className="text-lg leading-relaxed" style={{ color: "#6B7280" }}>
              Fix & Flip, Bridge, DSCR, or Construction — one lender, one portal, one relationship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                type: "Fix & Flip",
                desc: "Short-term financing for acquisitions and rehab projects. We move fast so your investors don't miss deals.",
                bullets: [
                  "Up to 75% of As-Is Value",
                  "Up to 90% of ARV",
                  "12-month terms",
                  "Rates from 8.99%",
                ],
              },
              {
                type: "Bridge Loan",
                desc: "Speed-focused acquisition lending for investors who can't wait. Close in days, not weeks.",
                bullets: [
                  "Up to 70% LTV",
                  "12-month terms",
                  "As-is or light value-add",
                  "Rates from 9.49%",
                ],
              },
            ].map(({ type, desc, bullets }) => (
              <div
                key={type}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #EBEBEB",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}
              >
                <div className="px-7 py-5" style={{ background: "#1A1A1A" }}>
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full tracking-wide"
                    style={{ background: "rgba(235,113,70,0.18)", color: "#F4A079" }}
                  >
                    {type}
                  </span>
                </div>
                <div className="px-7 py-6">
                  <p className="text-sm leading-relaxed mb-5" style={{ color: "#6B7280" }}>
                    {desc}
                  </p>
                  <ul className="space-y-2.5">
                    {bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#EB7146" }} />
                        <span className="text-sm font-medium" style={{ color: "#1A1A1A" }}>
                          {b}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════════════════════════
          SECTION 4 — From Introduction to Paycheck
          ════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" style={{ background: "#FFFFFF", borderTop: "1px solid #F0F0F0" }}>
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-24">
          <div className="mb-12 max-w-xl">
            <h2
              className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
              style={{ color: "#1A1A1A" }}
            >
              From Introduction to Paycheck
            </h2>
            <p className="text-lg leading-relaxed" style={{ color: "#6B7280" }}>
              Three steps. No fluff.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-0 md:gap-0 relative">
            {[
              {
                n: "1",
                title: "Get Approved as a Partner",
                body: "Apply in minutes. We review your info and set you up with portal access — usually same or next day. No volume minimums, no hoops to jump through.",
              },
              {
                n: "2",
                title: "Present Your Client a Term Sheet",
                body: "Enter the deal details and generate a white-labeled term sheet in seconds. Hand it to your borrower with your name on it before the competition even calls back.",
              },
              {
                n: "3",
                title: "Submit, Track, and Get Paid",
                body: "Submit the deal through the portal, upload docs, and track every update in real time. We handle underwriting — you handle your client. Collect your fee at closing.",
              },
            ].map(({ n, title, body }, i, arr) => (
              <div key={n} className="flex flex-col md:flex-row flex-1 items-start">
                {/* Step */}
                <div className="flex flex-col md:flex-col flex-1 pt-0">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base text-white flex-shrink-0 mb-4"
                    style={{
                      background: "linear-gradient(135deg, #EB7146, #C85A2E)",
                      boxShadow: "0 4px 14px rgba(235,113,70,0.3)",
                    }}
                  >
                    {n}
                  </div>
                  <h3 className="font-bold text-base mb-2" style={{ color: "#1A1A1A" }}>
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>
                    {body}
                  </p>
                </div>

                {/* Connector line between steps */}
                {i < arr.length - 1 && (
                  <div className="hidden md:flex items-start justify-center pt-5 px-6 flex-shrink-0">
                    <div
                      className="w-16 h-px"
                      style={{
                        background: "linear-gradient(90deg, #EB7146, rgba(235,113,70,0.2))",
                        marginTop: 6,
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-14 flex flex-wrap items-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all duration-150"
              style={{
                background: "linear-gradient(135deg, #EB7146 0%, #C85A2E 100%)",
                boxShadow: "0 4px 18px rgba(235,113,70,0.32)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 6px 26px rgba(235,113,70,0.48)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 18px rgba(235,113,70,0.32)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Apply to Partner
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="mailto:support@crebrid.com"
              className="text-sm font-medium transition-colors duration-150"
              style={{ color: "#9CA3AF" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#6B7280"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#9CA3AF"; }}
            >
              Questions? Email us →
            </a>
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════════════════════════
          FOOTER  (dark)
          ════════════════════════════════════════════════════════════ */}
      <footer style={{ background: "#111110", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Logo + details */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <CrebridMark size={24} gradId="footer-grad" />
              <span className="font-semibold text-white text-sm" style={{ letterSpacing: "0.02em" }}>
                Crebrid
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <a
                href="mailto:support@crebrid.com"
                className="text-xs transition-colors duration-150"
                style={{ color: "rgba(255,255,255,0.4)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
              >
                support@crebrid.com
              </a>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                Dallas, TX · Equal Housing Lender
              </span>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            © {new Date().getFullYear()} Crebrid LLC. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
