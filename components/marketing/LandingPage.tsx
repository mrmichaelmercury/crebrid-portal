"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CrebridLogo } from "@/components/ui/CrebridLogo";
import {
  Menu,
  X,
  ShieldCheck,
  Zap,
  FileText,
  Users,
  TrendingUp,
  Building2,
  ChevronRight,
  Check,
} from "lucide-react";

// ── Animation hooks ───────────────────────────────────────────────────────────

function useScrollReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function useCounter(target: number, visible: boolean, duration = 1400) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [visible, target, duration]);

  return count;
}

// ── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur transition-shadow duration-300 ${
        scrolled ? "shadow-sm" : ""
      } border-b border-gray-100`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5">
          <CrebridLogo className="w-9 h-9" />
          <div>
            <span className="font-bold text-gray-900 text-base leading-none">Crebrid</span>
            <span className="block text-xs text-gray-400 leading-none mt-0.5">Broker Portal</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#programs" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Loan Programs</a>
          <a href="#why" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Why Crebrid</a>
          <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Log In
          </Link>
          <a
            href="mailto:support@crebrid.com?subject=Broker%20Partnership%20Request"
            className="text-sm font-semibold bg-crebrid-600 hover:bg-crebrid-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Apply to Partner
          </a>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          <a href="#programs" onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Loan Programs</a>
          <a href="#why" onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">Why Crebrid</a>
          <a href="#how-it-works" onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">How It Works</a>
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/login" className="text-center text-sm font-medium border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              Log In
            </Link>
            <a
              href="mailto:support@crebrid.com?subject=Broker%20Partnership%20Request"
              className="text-center text-sm font-semibold bg-crebrid-600 text-white px-4 py-2.5 rounded-lg hover:bg-crebrid-700 transition-colors"
            >
              Apply to Partner
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative bg-gray-950 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-crebrid-600/10 blur-3xl" />
        <div className="absolute bottom-0 -left-24 w-[400px] h-[400px] rounded-full bg-crebrid-800/10 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="max-w-2xl">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 bg-crebrid-600/20 border border-crebrid-600/30 text-crebrid-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6"
            style={{ animation: "fadeSlideUp 0.6s ease-out both" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-crebrid-400 animate-pulse" />
            Hard Money Done Right — Nationwide
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight"
            style={{ animation: "fadeSlideUp 0.7s ease-out 0.1s both" }}
          >
            Your Clients.{" "}
            <span className="text-crebrid-400">Your Brand.</span>{" "}
            Our Capital.
          </h1>

          {/* Subheadline */}
          <p
            className="mt-5 text-lg text-gray-400 leading-relaxed max-w-xl"
            style={{ animation: "fadeSlideUp 0.7s ease-out 0.25s both" }}
          >
            Crebrid is the hard money lender that works behind you, not around you.
            Bring us your deals — we move fast, protect your client relationships,
            and put a check in your hand at the closing table.
          </p>

          {/* CTAs */}
          <div
            className="mt-8 flex flex-wrap gap-3"
            style={{ animation: "fadeSlideUp 0.7s ease-out 0.4s both" }}
          >
            <a
              href="mailto:support@crebrid.com?subject=Broker%20Partnership%20Request"
              className="inline-flex items-center gap-2 bg-crebrid-600 hover:bg-crebrid-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Apply to Partner
              <ChevronRight className="w-4 h-4" />
            </a>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all border border-white/10 hover:scale-[1.02] active:scale-[0.98]"
            >
              Log In to Portal
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

// ── Stats bar ─────────────────────────────────────────────────────────────────

function StatItem({ value, suffix, label }: { value: number | null; suffix: string; label: string }) {
  const { ref, visible } = useScrollReveal(0.5);
  const count = useCounter(value ?? 0, visible && value !== null);
  const display = value === null ? suffix : `${count}${suffix}`;

  return (
    <div ref={ref} className="text-center">
      <p
        className={`text-2xl font-bold text-white transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        {display}
      </p>
      <p className={`text-xs text-crebrid-100 mt-0.5 transition-all duration-700 delay-100 ${visible ? "opacity-100" : "opacity-0"}`}>
        {label}
      </p>
    </div>
  );
}

function StatsBar() {
  return (
    <section className="bg-crebrid-600">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <StatItem value={null} suffix="24hr" label="Decision Turnaround" />
          <StatItem value={null} suffix="$0" label="Volume Minimums" />
          <StatItem value={100} suffix="%" label="Broker Protection" />
          <StatItem value={4} suffix=" Programs" label="Loan Types We Fund" />
        </div>
      </div>
    </section>
  );
}

// ── Why Crebrid ───────────────────────────────────────────────────────────────

const benefits = [
  {
    icon: ShieldCheck,
    title: "We'll Never Go Around You",
    body: "Your borrower is your borrower — period. We don't make unsolicited contact with your clients, and we never will. Your fee is locked in on the commitment letter and paid directly to you at closing. No surprises, no end-arounds.",
  },
  {
    icon: Zap,
    title: "Decisions in 24 Hours",
    body: "We underwrite in-house in Dallas. No loan committees, no waiting weeks to hear back. Submit a complete package and you'll have a decision the next business day — often sooner.",
  },
  {
    icon: FileText,
    title: "Instant White-Labeled Term Sheets",
    body: "Walk into your next client meeting with a branded term sheet already in hand. Generate one in under a minute through the portal — your company name, your contact info. Crebrid stays in the background until close.",
  },
  {
    icon: Users,
    title: "One Team, Start to Finish",
    body: "You get a dedicated point of contact from the day you submit to the day it closes. No getting passed around, no re-explaining the deal to someone new. The same person who opens your file sees it through.",
  },
  {
    icon: TrendingUp,
    title: "Transparent, Competitive Pay",
    body: "Your compensation is disclosed on the commitment letter the day the deal gets approved — no surprises, no negotiating after the fact. A check goes out directly to you at the closing table.",
  },
  {
    icon: Building2,
    title: "Your Entire Pipeline, One Login",
    body: "Log in any time to see where every deal stands — outstanding conditions, document status, approval updates. No more calling to chase a status. The portal shows you everything, 24/7.",
  },
];

function WhyCrebrid() {
  const { ref, visible } = useScrollReveal();

  return (
    <section id="why" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div
          ref={ref}
          className={`text-center max-w-2xl mx-auto mb-12 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Built for Brokers Who Close Deals
          </h2>
          <p className="mt-3 text-gray-500">
            We built the Crebrid Broker Program around one idea: make it as easy as possible
            for you to bring us deals and get paid.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((b, i) => (
            <BenefitCard key={b.title} benefit={b} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitCard({
  benefit,
  delay,
}: {
  benefit: (typeof benefits)[0];
  delay: number;
}) {
  const { ref, visible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`bg-gray-50 rounded-2xl p-6 border border-gray-100 transition-all duration-700 hover:shadow-md hover:-translate-y-0.5 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      <div className="inline-flex p-2.5 bg-crebrid-50 rounded-xl mb-4">
        <benefit.icon className="w-5 h-5 text-crebrid-600" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{benefit.body}</p>
    </div>
  );
}

// ── Loan Programs ─────────────────────────────────────────────────────────────

const programs = [
  {
    name: "Fix & Flip",
    desc: "Short-term financing for acquisitions and rehab projects. We move fast so your investors don't miss deals.",
    details: ["Up to 75% of As-Is Value", "Up to 90% of ARV", "12-month terms", "Rates from 8.99%"],
  },
  {
    name: "Bridge Loan",
    desc: "Speed-focused acquisition lending for investors who can't wait. Close in days, not weeks.",
    details: ["Up to 70% LTV", "12-month terms", "As-is or light value-add", "Rates from 9.49%"],
  },
  {
    name: "DSCR / Rental",
    desc: "Long-term rental financing that qualifies on the property's cash flow — not the borrower's tax returns.",
    details: ["Up to 75% LTV", "30-year amortization", "Min. DSCR 1.20", "Rates from 7.49%"],
  },
  {
    name: "New Construction",
    desc: "Ground-up construction loans with structured draw schedules for experienced builders and developers.",
    details: ["Up to 85% of Total Cost", "Up to 75% of ARV", "18-month terms", "Rates from 9.99%"],
  },
];

function LoanPrograms() {
  const { ref, visible } = useScrollReveal();

  return (
    <section id="programs" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div
          ref={ref}
          className={`text-center max-w-2xl mx-auto mb-12 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Every Deal Has a Home Here
          </h2>
          <p className="mt-3 text-gray-500">
            Fix &amp; Flip, Bridge, DSCR, or Construction — one lender, one portal,
            one relationship.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {programs.map((p, i) => (
            <ProgramCard key={p.name} program={p} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProgramCard({
  program,
  delay,
}: {
  program: (typeof programs)[0];
  delay: number;
}) {
  const { ref, visible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`bg-white rounded-2xl border border-gray-200 p-6 shadow-sm transition-all duration-700 hover:shadow-md hover:-translate-y-0.5 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      <h3 className="font-bold text-gray-900 text-lg mb-1">{program.name}</h3>
      <p className="text-sm text-gray-500 mb-4">{program.desc}</p>
      <ul className="space-y-1.5">
        {program.details.map((d) => (
          <li key={d} className="flex items-center gap-2 text-sm text-gray-700">
            <Check className="w-4 h-4 text-crebrid-500 flex-shrink-0" />
            {d}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────

const steps = [
  {
    num: "01",
    title: "Get Approved as a Partner",
    body: "Apply in minutes. We review your info and set you up with portal access — usually same or next day. No volume minimums, no hoops to jump through.",
  },
  {
    num: "02",
    title: "Present Your Client a Term Sheet",
    body: "Enter the deal details and generate a white-labeled term sheet in seconds. Hand it to your borrower with your name on it before the competition even calls back.",
  },
  {
    num: "03",
    title: "Submit, Track, and Get Paid",
    body: "Submit the deal through the portal, upload docs, and track every update in real time. We handle underwriting — you handle your client. Collect your fee at closing.",
  },
];

function HowItWorks() {
  const { ref, visible } = useScrollReveal();

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div
          ref={ref}
          className={`text-center max-w-2xl mx-auto mb-12 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            From Introduction to Paycheck
          </h2>
          <p className="mt-3 text-gray-500">
            Three steps. No fluff.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <StepCard key={s.num} step={s} index={i} total={steps.length} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({
  step,
  index,
  total,
}: {
  step: (typeof steps)[0];
  index: number;
  total: number;
}) {
  const { ref, visible } = useScrollReveal();

  return (
    <div
      ref={ref}
      className={`relative transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      style={{ transitionDelay: visible ? `${index * 120}ms` : "0ms" }}
    >
      {index < total - 1 && (
        <div className="hidden md:block absolute top-8 left-[calc(50%+2.5rem)] w-full h-px bg-gray-200" />
      )}
      <div className="relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-crebrid-600 text-white font-bold text-lg mb-4 shadow-md shadow-crebrid-200">
          {step.num}
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{step.body}</p>
      </div>
    </div>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────

function CtaSection() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="bg-gray-950 py-20">
      <div
        ref={ref}
        className={`max-w-3xl mx-auto px-4 sm:px-6 text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Your Clients Deserve a Lender You Can Count On.{" "}
          <span className="text-crebrid-400">So Do You.</span>
        </h2>
        <p className="mt-4 text-gray-400 text-lg">
          Crebrid moves fast, pays on time, and never cuts you out.
          Apply to partner today — no volume minimums, no upfront costs, no catch.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="mailto:support@crebrid.com?subject=Broker%20Partnership%20Request"
            className="inline-flex items-center gap-2 bg-crebrid-600 hover:bg-crebrid-500 text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Apply to Partner
            <ChevronRight className="w-4 h-4" />
          </a>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 border border-white/20 hover:bg-white/5 text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Log In to Portal
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-white/5 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <CrebridLogo className="w-7 h-7" />
          <span className="text-sm font-semibold text-gray-300">Crebrid</span>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
          <a href="mailto:support@crebrid.com" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            support@crebrid.com
          </a>
          <span className="text-xs text-gray-600">Dallas, TX</span>
          <span className="text-xs text-gray-600">Equal Housing Lender</span>
        </div>
        <p className="text-xs text-gray-600">
          &copy; {new Date().getFullYear()} Crebrid LLC. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1">
        <Hero />
        <StatsBar />
        <WhyCrebrid />
        <LoanPrograms />
        <HowItWorks />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
