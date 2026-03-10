"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, Check } from "lucide-react";
import { LOAN_TYPE_LABELS } from "@/lib/types";
import type { LoanType } from "@/lib/types";

const LOAN_TYPE_DESCRIPTIONS: Record<LoanType, string> = {
  FIX_AND_FLIP: "Purchase + renovation, sell for profit. Typically 6-18 months.",
  BRIDGE: "Short-term financing while transitioning between properties.",
  DSCR_RENTAL: "Long-term rental based on property cash flow (DSCR).",
  NEW_CONSTRUCTION: "Ground-up construction financing with draw schedule.",
};

const PROPERTY_TYPES = [
  "Single Family Residence (SFR)",
  "2-4 Unit Residential",
  "Townhome",
  "Condominium",
  "Small Multifamily (5-10 units)",
  "Commercial",
  "Mixed Use",
  "Lot / Land",
];

type FormData = {
  loanType: LoanType | "";
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyZip: string;
  propertyType: string;
  propertyCondition: string;
  purchasePrice: string;
  rehabBudget: string;
  afterRepairValue: string;
  requestedLoanAmt: string;
  monthlyRent: string;
  annualNOI: string;
  borrowerName: string;
  borrowerEmail: string;
  borrowerPhone: string;
  borrowerEntity: string;
  borrowerExperience: string;
  requestedRate: string;
  requestedTerm: string;
  exitStrategy: string;
  notes: string;
};

const initialForm: FormData = {
  loanType: "",
  propertyAddress: "",
  propertyCity: "",
  propertyState: "",
  propertyZip: "",
  propertyType: "",
  propertyCondition: "",
  purchasePrice: "",
  rehabBudget: "",
  afterRepairValue: "",
  requestedLoanAmt: "",
  monthlyRent: "",
  annualNOI: "",
  borrowerName: "",
  borrowerEmail: "",
  borrowerPhone: "",
  borrowerEntity: "",
  borrowerExperience: "",
  requestedRate: "",
  requestedTerm: "",
  exitStrategy: "",
  notes: "",
};

const STEPS = ["Loan Type", "Property", "Financials", "Borrower", "Summary"];

export default function NewLoanForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const canProceed = () => {
    if (step === 0) return !!form.loanType;
    if (step === 1) return !!form.propertyAddress && !!form.propertyCity && !!form.propertyState;
    if (step === 2) return !!form.requestedLoanAmt;
    if (step === 3) return !!form.borrowerName;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        purchasePrice: form.purchasePrice ? parseFloat(form.purchasePrice) : undefined,
        rehabBudget: form.rehabBudget ? parseFloat(form.rehabBudget) : undefined,
        afterRepairValue: form.afterRepairValue ? parseFloat(form.afterRepairValue) : undefined,
        requestedLoanAmt: form.requestedLoanAmt ? parseFloat(form.requestedLoanAmt) : undefined,
        monthlyRent: form.monthlyRent ? parseFloat(form.monthlyRent) : undefined,
        annualNOI: form.annualNOI ? parseFloat(form.annualNOI) : undefined,
        requestedRate: form.requestedRate ? parseFloat(form.requestedRate) : undefined,
        requestedTerm: form.requestedTerm ? parseInt(form.requestedTerm) : undefined,
      };

      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to create loan");
      }

      const loan = (await res.json()) as { id: string };
      router.push(`/loans/${loan.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Progress Steps */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-1">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                    i < step
                      ? "bg-crebrid-600 text-white"
                      : i === step
                        ? "bg-crebrid-600 text-white ring-2 ring-crebrid-200"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {i < step ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block truncate ${
                    i === step ? "text-crebrid-700" : i < step ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-2 ${i < step ? "bg-crebrid-200" : "bg-gray-100"}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Step 0: Loan Type */}
        {step === 0 && (
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              What type of loan are you requesting?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.entries(LOAN_TYPE_LABELS) as [LoanType, string][]).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => set("loanType", type)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    form.loanType === type
                      ? "border-crebrid-500 bg-crebrid-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className={`text-sm font-semibold ${form.loanType === type ? "text-crebrid-700" : "text-gray-900"}`}>
                    {label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {LOAN_TYPE_DESCRIPTIONS[type]}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Property */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Property Information</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.propertyAddress}
                onChange={(e) => set("propertyAddress", e.target.value)}
                placeholder="123 Main Street"
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.propertyCity}
                  onChange={(e) => set("propertyCity", e.target.value)}
                  placeholder="Dallas"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.propertyState}
                  onChange={(e) => set("propertyState", e.target.value.toUpperCase())}
                  placeholder="TX"
                  maxLength={2}
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ZIP Code</label>
                <input
                  type="text"
                  value={form.propertyZip}
                  onChange={(e) => set("propertyZip", e.target.value)}
                  placeholder="75201"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Property Type</label>
                <select
                  value={form.propertyType}
                  onChange={(e) => set("propertyType", e.target.value)}
                  className="input-field"
                >
                  <option value="">Select type</option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Property Condition
              </label>
              <select
                value={form.propertyCondition}
                onChange={(e) => set("propertyCondition", e.target.value)}
                className="input-field"
              >
                <option value="">Select condition</option>
                <option value="Good - Move-in ready">Good - Move-in ready</option>
                <option value="Fair - Minor repairs needed">Fair - Minor repairs needed</option>
                <option value="Poor - Major rehab needed">Poor - Major rehab needed</option>
                <option value="Shell / Gut rehab">Shell / Gut rehab</option>
                <option value="Vacant lot / Land">Vacant lot / Land</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Financials */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Loan Financials</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Purchase Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    value={form.purchasePrice}
                    onChange={(e) => set("purchasePrice", e.target.value)}
                    placeholder="325,000"
                    className="input-field pl-7"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Requested Loan Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    value={form.requestedLoanAmt}
                    onChange={(e) => set("requestedLoanAmt", e.target.value)}
                    placeholder="250,000"
                    className="input-field pl-7"
                  />
                </div>
              </div>

              {(form.loanType === "FIX_AND_FLIP" || form.loanType === "NEW_CONSTRUCTION") && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Rehab / Construction Budget
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        value={form.rehabBudget}
                        onChange={(e) => set("rehabBudget", e.target.value)}
                        placeholder="75,000"
                        className="input-field pl-7"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      After Repair Value (ARV)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        value={form.afterRepairValue}
                        onChange={(e) => set("afterRepairValue", e.target.value)}
                        placeholder="500,000"
                        className="input-field pl-7"
                      />
                    </div>
                  </div>
                </>
              )}

              {form.loanType === "DSCR_RENTAL" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Monthly Rent
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        value={form.monthlyRent}
                        onChange={(e) => set("monthlyRent", e.target.value)}
                        placeholder="2,500"
                        className="input-field pl-7"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Annual NOI
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        value={form.annualNOI}
                        onChange={(e) => set("annualNOI", e.target.value)}
                        placeholder="24,000"
                        className="input-field pl-7"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Requested Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.requestedRate}
                  onChange={(e) => set("requestedRate", e.target.value)}
                  placeholder="10.5"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Loan Term (months)
                </label>
                <select
                  value={form.requestedTerm}
                  onChange={(e) => set("requestedTerm", e.target.value)}
                  className="input-field"
                >
                  <option value="">Select term</option>
                  <option value="6">6 months</option>
                  <option value="9">9 months</option>
                  <option value="12">12 months</option>
                  <option value="18">18 months</option>
                  <option value="24">24 months</option>
                  <option value="36">36 months</option>
                  <option value="360">30 years (DSCR)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Exit Strategy
              </label>
              <textarea
                value={form.exitStrategy}
                onChange={(e) => set("exitStrategy", e.target.value)}
                rows={2}
                placeholder="e.g., Sell after renovation, refinance with conventional lender, hold as rental..."
                className="input-field resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 3: Borrower */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Borrower Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Borrower Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.borrowerName}
                  onChange={(e) => set("borrowerName", e.target.value)}
                  placeholder="John Smith"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.borrowerEmail}
                  onChange={(e) => set("borrowerEmail", e.target.value)}
                  placeholder="john@example.com"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={form.borrowerPhone}
                  onChange={(e) => set("borrowerPhone", e.target.value)}
                  placeholder="(214) 555-0100"
                  className="input-field"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Entity Name (if borrowing as LLC/Corp)
                </label>
                <input
                  type="text"
                  value={form.borrowerEntity}
                  onChange={(e) => set("borrowerEntity", e.target.value)}
                  placeholder="Smith Investments LLC"
                  className="input-field"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Real Estate Experience
                </label>
                <select
                  value={form.borrowerExperience}
                  onChange={(e) => set("borrowerExperience", e.target.value)}
                  className="input-field"
                >
                  <option value="">Select experience level</option>
                  <option value="First-time investor">First-time investor</option>
                  <option value="1-3 transactions">1-3 transactions</option>
                  <option value="4-10 transactions">4-10 transactions</option>
                  <option value="10-25 transactions">10-25 transactions</option>
                  <option value="25+ transactions (experienced)">25+ transactions (experienced)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Additional Notes for Processor
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  rows={3}
                  placeholder="Any additional context about the deal, borrower, or property..."
                  className="input-field resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Summary */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Review & Submit</h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Loan Type</p>
                  <p className="font-medium text-gray-900">{form.loanType ? LOAN_TYPE_LABELS[form.loanType] : "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Requested Amount</p>
                  <p className="font-medium text-gray-900">
                    {form.requestedLoanAmt ? `$${parseFloat(form.requestedLoanAmt).toLocaleString()}` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Property</p>
                  <p className="font-medium text-gray-900">
                    {form.propertyAddress ? `${form.propertyAddress}, ${form.propertyCity}, ${form.propertyState}` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Borrower</p>
                  <p className="font-medium text-gray-900">{form.borrowerName || "—"}</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Next step:</span> After submitting, you&apos;ll be taken to your loan page where you can upload borrower documents. AI processing will begin automatically.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="px-6 pb-6 flex items-center justify-between">
        <button
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="flex items-center gap-2 bg-crebrid-600 hover:bg-crebrid-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 bg-crebrid-600 hover:bg-crebrid-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Submit Loan
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
