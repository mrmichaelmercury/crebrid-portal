"use client";

import { useState } from "react";
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

// ── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <CrebridLogo className="w-9 h-9" />
          <div>
            <span className="font-bold text-gray-900 text-base leading-none">Crebrid</span>
            <span className="block text-xs text-gray-400 leading-none mt-0.5">Broker Portal</span>
          </div>
        </Link>

        {/* Desktop nav */}
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

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
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
      {/* Subtle background geometry */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-crebrid-600/10 blur-3xl" />
        <div className="absolute bottom-0 -left-24 w-[400px] h-[400px] rounded-full bg-crebrid-800/10 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-crebrid-600/20 border border-crebrid-600/30 text-crebrid-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-crebrid-400 animate-pulse" />
            Dallas, TX — Lending Nationwide
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
            Partner with Texas&apos; Premier{" "}
            <span className="text-crebrid-400">Hard Money</span> Lender
          </h1>

          <p className="mt-5 text-lg text-gray-400 leading-relaxed max-w-xl">
            The Crebrid Broker Portal gives you instant rate quotes, white-labeled term sheets,
            and real-time deal tracking — everything you need to close faster and earn more.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="mailto:support@crebrid.com?subject=Broker%20Partnership%20Request"
              className="inline-flex items-center gap-2 bg-crebrid-600 hover:bg-crebrid-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
            >
              Apply to Partner
              <ChevronRight className="w-4 h-4" />
            </a>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors border border-white/10"
            >
              Log In to Portal
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Stats bar ─────────────────────────────────────────────────────────────────

const stats = [
  { value: "24hr", label: "Pre-Approval Turnaround" },
  { value: "4", label: "Loan Programs" },
  { value: "50", label: "States Lending" },
  { value: "100%", label: "Broker Protection" },
];

function StatsBar() {
  return (
    <section className="bg-crebrid-600">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-crebrid-100 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Why Crebrid ───────────────────────────────────────────────────────────────

const benefits = [
  {
    icon: ShieldCheck,
    title: "Your Clients Stay Yours",
    body: "We will never reach out to your borrowers directly. Your relationships are protected — full stop. Broker fees are disclosed upfront on the commitment letter and paid directly to you at closing.",
  },
  {
    icon: Zap,
    title: "24-Hour Pre-Approvals",
    body: "Submit a complete package and get a decision within 24 hours. We underwrite in-house, right here in Dallas — no middlemen, no committee delays, no runaround.",
  },
  {
    icon: FileText,
    title: "White-Labeled Term Sheets",
    body: "Generate instant estimated term sheets branded with your company name and contact info. Your client sees your business — never Crebrid's. Print or download as a PDF in seconds.",
  },
  {
    icon: Users,
    title: "Dedicated Lending Team",
    body: "You'll work with the same team from submission to close. We handle the details so you can focus on building client relationships and finding the next deal.",
  },
  {
    icon: TrendingUp,
    title: "Competitive Compensation",
    body: "Flexible compensation structures with yield spread, points, and fees. Your earnings are clearly disclosed on the commitment letter and wired directly to you at the closing table.",
  },
  {
    icon: Building2,
    title: "Real-Time Deal Tracking",
    body: "Log in to the portal any time to see exactly where your deal stands — docs needed, underwriting status, approval conditions, and more. No more chasing status updates.",
  },
];

function WhyCrebrid() {
  return (
    <section id="why" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Built for Brokers Who Close Deals
          </h2>
          <p className="mt-3 text-gray-500">
            We built the Crebrid Broker Program around one idea: make it as easy as possible
            for you to bring us deals and get paid.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((b) => (
            <div key={b.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="inline-flex p-2.5 bg-crebrid-50 rounded-xl mb-4">
                <b.icon className="w-5 h-5 text-crebrid-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{b.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Loan Programs ─────────────────────────────────────────────────────────────

const programs = [
  {
    name: "Fix & Flip",
    desc: "Short-term bridge financing for acquisitions and light-to-heavy rehab projects.",
    details: ["Up to 75% of As-Is Value", "Up to 90% of ARV", "12-month terms", "Rates from 8.99%"],
  },
  {
    name: "Bridge Loan",
    desc: "Quick-close acquisition loans for investors who need speed and flexibility.",
    details: ["Up to 70% LTV", "12-month terms", "As-is or light value-add", "Rates from 9.49%"],
  },
  {
    name: "DSCR / Rental",
    desc: "Long-term rental financing based on property cash flow — no personal income required.",
    details: ["Up to 75% LTV", "30-year amortization", "Min. DSCR 1.20", "Rates from 7.49%"],
  },
  {
    name: "New Construction",
    desc: "Ground-up construction financing with draw schedules for experienced builders.",
    details: ["Up to 85% of Total Cost", "Up to 75% of ARV", "18-month terms", "Rates from 9.99%"],
  },
];

function LoanPrograms() {
  return (
    <section id="programs" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Loan Programs
          </h2>
          <p className="mt-3 text-gray-500">
            Fix &amp; Flip, Bridge, DSCR, and Construction — one lender, one portal,
            one relationship.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {programs.map((p) => (
            <div key={p.name} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 text-lg mb-1">{p.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{p.desc}</p>
              <ul className="space-y-1.5">
                {p.details.map((d) => (
                  <li key={d} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-crebrid-500 flex-shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────

const steps = [
  {
    num: "01",
    title: "Apply to Become a Partner",
    body: "Fill out a short broker application. Once approved, you'll receive your portal credentials and our full broker package.",
  },
  {
    num: "02",
    title: "Generate a Term Sheet",
    body: "Use the portal's built-in rate tool to instantly produce a white-labeled term sheet branded with your company — present it to your client the same day.",
  },
  {
    num: "03",
    title: "Submit the Deal & Track to Close",
    body: "Submit the loan directly through the portal. Upload documents, monitor status in real time, and get paid at the closing table.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            How It Works
          </h2>
          <p className="mt-3 text-gray-500">
            Three steps from introduction to payday.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={s.num} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-full h-px bg-gray-200 -z-0" />
              )}
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-crebrid-600 text-white font-bold text-lg mb-4 shadow-md shadow-crebrid-200">
                  {s.num}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── CTA ───────────────────────────────────────────────────────────────────────

function CtaSection() {
  return (
    <section className="bg-gray-950 py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
          Ready to Start Closing Deals with Crebrid?
        </h2>
        <p className="mt-4 text-gray-400 text-lg">
          Apply to become a broker partner today. No upfront costs, no minimums —
          just a lender that shows up every time.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="mailto:support@crebrid.com?subject=Broker%20Partnership%20Request"
            className="inline-flex items-center gap-2 bg-crebrid-600 hover:bg-crebrid-500 text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-colors"
          >
            Apply to Partner
            <ChevronRight className="w-4 h-4" />
          </a>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 border border-white/20 hover:bg-white/5 text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-colors"
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
