"use client";

import { useState, useRef } from "react";
import { Loader2, FileDown, RotateCcw, Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { TermSheetData, ProjectType, CreditTier, ExperienceTier } from "@/lib/rates";

interface BrokerProfile {
  name: string | null;
  email: string;
  phone: string | null;
  company: string | null;
  nmls: string | null;
}

interface Props {
  broker: BrokerProfile;
}

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
  "New Hampshire","New Jersey","New Mexico","New York","North Carolina",
  "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island",
  "South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: "FIX_FLIP_PURCHASE", label: "Fix & Flip – Purchase" },
  { value: "FIX_FLIP_REFI",     label: "Fix & Flip – Refinance" },
  { value: "AS_IS_PURCHASE",    label: "As-Is – Purchase" },
  { value: "AS_IS_REFI",        label: "As-Is – Refinance" },
  { value: "NEW_CONSTRUCTION",  label: "New Construction" },
];

const CREDIT_TIERS: { value: CreditTier; label: string }[] = [
  { value: "BELOW_640", label: "Below 640" },
  { value: "640_699",   label: "640 – 699" },
  { value: "700_740",   label: "700 – 740" },
  { value: "741_PLUS",  label: "741+" },
];

const EXPERIENCE_TIERS: { value: ExperienceTier; label: string }[] = [
  { value: "0_2",     label: "0 – 2 projects" },
  { value: "3_9",     label: "3 – 9 projects" },
  { value: "10_PLUS", label: "10+ projects" },
];

const inputClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-crebrid-500 focus:border-transparent transition-shadow";

const selectClass =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-crebrid-500 focus:border-transparent transition-shadow appearance-none";

function parseDollar(val: string): number {
  return parseFloat(val.replace(/[^0-9.]/g, "")) || 0;
}

export default function TermSheetGenerator({ broker }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    projectType: "" as ProjectType | "",
    state: "",
    asIsValue: "",
    arv: "",
    creditTier: "" as CreditTier | "",
    experience: "" as ExperienceTier | "",
    cashOut: false,
    brokerFee: "",
    thirdPartyCosts: "",
    brokerName: broker.name ?? "",
  });

  const [result, setResult] = useState<TermSheetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof typeof form, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/term-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectType: form.projectType,
          state: form.state,
          asIsValue: parseDollar(form.asIsValue),
          arv: parseDollar(form.arv),
          creditTier: form.creditTier,
          experience: form.experience,
          cashOut: form.cashOut,
          brokerFee: parseDollar(form.brokerFee),
          thirdPartyCosts: parseDollar(form.thirdPartyCosts),
        }),
      });

      const data = (await res.json()) as TermSheetData & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to calculate");
      setResult(data);

      // Scroll to term sheet on mobile
      setTimeout(() => {
        printRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  const handleReset = () => {
    setResult(null);
    setError("");
  };

  const generatedDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex flex-col xl:flex-row gap-6 items-start">
      {/* ── Input Form ── */}
      <div className="w-full xl:w-[420px] flex-shrink-0 print:hidden">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <Calculator className="w-5 h-5 text-crebrid-600" />
            <h2 className="text-sm font-semibold text-gray-900">Deal Parameters</h2>
          </div>

          <form onSubmit={handleCalculate} className="space-y-4">
            {/* Project Type */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Project Type <span className="text-red-500">*</span>
              </label>
              <select
                value={form.projectType}
                onChange={(e) => set("projectType", e.target.value)}
                required
                className={selectClass}
              >
                <option value="">Select project type</option>
                {PROJECT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Property State <span className="text-red-500">*</span>
              </label>
              <select
                value={form.state}
                onChange={(e) => set("state", e.target.value)}
                required
                className={selectClass}
              >
                <option value="">Select state</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* As-Is / ARV */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  As-Is Value <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.asIsValue}
                    onChange={(e) => set("asIsValue", e.target.value)}
                    placeholder="250,000"
                    required
                    className={`${inputClass} pl-6`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  After Repair Value (ARV) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.arv}
                    onChange={(e) => set("arv", e.target.value)}
                    placeholder="350,000"
                    required
                    className={`${inputClass} pl-6`}
                  />
                </div>
              </div>
            </div>

            {/* Credit / Experience */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Credit Score <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.creditTier}
                  onChange={(e) => set("creditTier", e.target.value)}
                  required
                  className={selectClass}
                >
                  <option value="">Select</option>
                  {CREDIT_TIERS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Experience <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.experience}
                  onChange={(e) => set("experience", e.target.value)}
                  required
                  className={selectClass}
                >
                  <option value="">Select</option>
                  {EXPERIENCE_TIERS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cash-out */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => set("cashOut", !form.cashOut)}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                  form.cashOut ? "bg-crebrid-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    form.cashOut ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
              <label className="text-xs font-medium text-gray-700">Cash-out refinance</label>
            </div>

            {/* Broker Fee / Third Party */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Broker Fee
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.brokerFee}
                    onChange={(e) => set("brokerFee", e.target.value)}
                    placeholder="0"
                    className={`${inputClass} pl-6`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Third Party Costs
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.thirdPartyCosts}
                    onChange={(e) => set("thirdPartyCosts", e.target.value)}
                    placeholder="0"
                    className={`${inputClass} pl-6`}
                  />
                </div>
              </div>
            </div>

            {/* Broker Name override */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Prepared By (your name on term sheet)
              </label>
              <input
                type="text"
                value={form.brokerName}
                onChange={(e) => set("brokerName", e.target.value)}
                placeholder="Your name"
                className={inputClass}
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-crebrid-600 hover:bg-crebrid-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Calculating...</>
                ) : (
                  "Get Rates"
                )}
              </button>
              {result && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-2.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                  title="Start over"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* ── Term Sheet Preview ── */}
      {result ? (
        <div className="flex-1 min-w-0">
          {/* Action bar (screen only) */}
          <div className="flex items-center justify-between mb-3 print:hidden">
            <p className="text-sm text-gray-500">
              Preview — ready to print or save as PDF
            </p>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-crebrid-600 hover:bg-crebrid-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              <FileDown className="w-4 h-4" />
              Download / Print
            </button>
          </div>

          {/* The actual term sheet */}
          <div
            ref={printRef}
            id="term-sheet-print"
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print:rounded-none print:border-0 print:shadow-none"
          >
            {/* Header — broker branding */}
            <div className="bg-gray-900 px-8 py-6 print:px-10 print:py-8">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    {broker.company || form.brokerName || "Your Brokerage"}
                  </h1>
                  {broker.company && (form.brokerName || broker.name) && (
                    <p className="text-gray-300 text-sm mt-0.5">
                      {form.brokerName || broker.name}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2">
                    {(broker.phone) && (
                      <span className="text-gray-400 text-xs">{broker.phone}</span>
                    )}
                    <span className="text-gray-400 text-xs">{broker.email}</span>
                    {broker.nmls && (
                      <span className="text-gray-400 text-xs">NMLS# {broker.nmls}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Term Sheet</p>
                  <p className="text-xs text-gray-500 mt-1">Issued: {generatedDate}</p>
                  <p className="text-xs text-gray-500">Expires: {expiryDate}</p>
                </div>
              </div>
            </div>

            <div className="px-8 py-6 print:px-10 space-y-6">
              {/* Program */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Loan Program
                  </p>
                  <p className="text-lg font-bold text-gray-900">{result.programLabel}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{form.state}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Estimated Rate
                  </p>
                  <p className="text-3xl font-bold text-crebrid-600">
                    {result.estimatedRate.toFixed(2)}%
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Interest Only</p>
                </div>
              </div>

              {/* Key terms grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: "Estimated Loan Amount", value: formatCurrency(result.maxLoanAmount), highlight: true },
                  { label: "Monthly Payment (I/O)", value: formatCurrency(result.monthlyPayment) },
                  { label: "Loan Term", value: `${result.term} months` },
                  { label: "Loan-to-Value (LTV)", value: `${result.ltvPercent}%` },
                  { label: "Origination Points", value: `${result.points} pts` },
                  { label: "Origination Fee", value: formatCurrency(result.originationFee) },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-lg p-3 ${item.highlight ? "bg-crebrid-50 border border-crebrid-100" : "bg-gray-50"}`}
                  >
                    <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                    <p className={`text-base font-bold ${item.highlight ? "text-crebrid-700" : "text-gray-900"}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Property values */}
              <div className="rounded-lg border border-gray-100 divide-y divide-gray-50">
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-sm text-gray-500">As-Is Value</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(parseDollar(form.asIsValue))}
                  </span>
                </div>
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-sm text-gray-500">After Repair Value (ARV)</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(parseDollar(form.arv))}
                  </span>
                </div>
                {form.cashOut && (
                  <div className="flex justify-between px-4 py-2.5">
                    <span className="text-sm text-gray-500">Cash-Out Refinance</span>
                    <span className="text-sm font-semibold text-gray-900">Yes</span>
                  </div>
                )}
              </div>

              {/* Cost summary */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Estimated Closing Costs
                </p>
                <div className="rounded-lg border border-gray-100 divide-y divide-gray-50">
                  <div className="flex justify-between px-4 py-2.5">
                    <span className="text-sm text-gray-500">Origination Fee ({result.points} pts)</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(result.originationFee)}
                    </span>
                  </div>
                  {result.brokerFee > 0 && (
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-sm text-gray-500">Broker Fee</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(result.brokerFee)}
                      </span>
                    </div>
                  )}
                  {result.thirdPartyCosts > 0 && (
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-sm text-gray-500">Third Party Costs (est.)</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(result.thirdPartyCosts)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between px-4 py-2.5 bg-gray-50 rounded-b-lg">
                    <span className="text-sm font-semibold text-gray-700">Total Est. Closing Costs</span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(result.totalEstimatedClosingCosts)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400 leading-relaxed">
                  This term sheet is provided for informational purposes only and constitutes an
                  estimate, not a commitment to lend. Final loan terms, rates, and approval are
                  subject to underwriting review, property appraisal, title review, and lender
                  approval. Rate estimates are valid through {expiryDate}. All loans are originated
                  by Crebrid LLC. Equal Housing Lender.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="flex-1 min-w-0 print:hidden">
          <div className="bg-white rounded-xl border border-gray-200 border-dashed flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-12 h-12 bg-crebrid-50 rounded-full flex items-center justify-center mb-4">
              <Calculator className="w-6 h-6 text-crebrid-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">Fill in the deal parameters</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Enter the project details on the left and click &ldquo;Get Rates&rdquo; to generate a
              white-labeled term sheet you can share with your client.
            </p>
          </div>
        </div>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #term-sheet-print, #term-sheet-print * { visibility: visible; }
          #term-sheet-print { position: fixed; top: 0; left: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
