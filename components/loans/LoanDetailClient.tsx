"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Brain,
  Upload,
  ChevronRight,
  Building2,
  DollarSign,
  User,
  Activity,
  ExternalLink,
  Download,
} from "lucide-react";
import {
  LOAN_TYPE_LABELS,
  LOAN_STATUS_LABELS,
  LOAN_STATUS_COLORS,
  REQUIRED_DOCS,
  OPTIONAL_DOCS,
  DOCUMENT_TYPE_LABELS,
} from "@/lib/types";
import type { LoanType, LoanStatus } from "@/lib/types";
import { formatCurrency, formatPercent, formatDate } from "@/lib/utils";
import DocumentUpload from "@/components/documents/DocumentUpload";
import AIReviewPanel from "@/components/ai/AIReviewPanel";
import type { Loan, Document, AIReview, LoanActivity } from "@prisma/client";

type LoanWithAll = Loan & {
  broker: { name: string | null; email: string; phone: string | null; company: string | null; nmls: string | null };
  documents: Document[];
  aiReview: AIReview | null;
  activities: LoanActivity[];
};

interface Props {
  loan: LoanWithAll;
  userRole: string;
}

type Tab = "overview" | "documents" | "ai-review" | "activity";

export default function LoanDetailClient({ loan: initialLoan, userRole }: Props) {
  const [loan, setLoan] = useState(initialLoan);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [aiReviewLoading, setAiReviewLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const isAdminOrProcessor = userRole === "ADMIN" || userRole === "PROCESSOR";
  const requiredDocs = REQUIRED_DOCS[loan.loanType as LoanType] ?? [];
  const optionalDocs = OPTIONAL_DOCS[loan.loanType as LoanType] ?? [];
  const uploadedTypes = new Set(loan.documents.map((d) => d.documentType));
  const missingRequired = requiredDocs.filter((t) => !uploadedTypes.has(t));

  const refreshLoan = async () => {
    const res = await fetch(`/api/loans/${loan.id}`);
    if (res.ok) {
      const data = (await res.json()) as LoanWithAll;
      setLoan(data);
    }
  };

  const runAIReview = async () => {
    setAiReviewLoading(true);
    try {
      const res = await fetch(`/api/loans/${loan.id}/ai-review`, {
        method: "POST",
      });
      if (res.ok) {
        await refreshLoan();
        setActiveTab("ai-review");
      }
    } finally {
      setAiReviewLoading(false);
    }
  };

  const exportToBaseline = async () => {
    setExportLoading(true);
    try {
      const res = await fetch(`/api/loans/${loan.id}/baseline-export`, {
        method: "POST",
      });
      const data = (await res.json()) as { success?: boolean; error?: string; csvAvailable?: boolean };
      if (data.success) {
        await refreshLoan();
        alert("Successfully synced to Baseline!");
      } else if (data.csvAvailable) {
        // Download CSV fallback
        window.open(`/api/loans/${loan.id}/baseline-export`, "_blank");
      } else {
        alert(data.error ?? "Export failed");
      }
    } finally {
      setExportLoading(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "overview", label: "Overview", icon: Building2 },
    { id: "documents", label: "Documents", icon: FileText, badge: loan.documents.length },
    { id: "ai-review", label: "AI Review", icon: Brain, badge: loan.aiReview ? 1 : undefined },
    { id: "activity", label: "Activity", icon: Activity },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          href="/loans"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">{loan.loanNumber}</h1>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold ${LOAN_STATUS_COLORS[loan.status as LoanStatus]}`}
            >
              {LOAN_STATUS_LABELS[loan.status as LoanStatus]}
            </span>
            {loan.loanType && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-600">
                {LOAN_TYPE_LABELS[loan.loanType as LoanType]}
              </span>
            )}
          </div>
          {loan.propertyAddress && (
            <p className="text-sm text-gray-500 mt-0.5">
              {loan.propertyAddress}, {loan.propertyCity}, {loan.propertyState} {loan.propertyZip}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!loan.aiReview && loan.documents.length > 0 && (
            <button
              onClick={runAIReview}
              disabled={aiReviewLoading}
              className="flex items-center gap-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Brain className="w-3.5 h-3.5" />
              {aiReviewLoading ? "Running..." : "Run AI Review"}
            </button>
          )}
          {isAdminOrProcessor && (
            <button
              onClick={exportToBaseline}
              disabled={exportLoading}
              className="flex items-center gap-1.5 text-xs font-semibold bg-crebrid-600 hover:bg-crebrid-700 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {exportLoading ? "Exporting..." : "Baseline Export"}
            </button>
          )}
        </div>
      </div>

      {/* Missing Docs Warning */}
      {missingRequired.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-yellow-800 mb-1">
            Missing Required Documents ({missingRequired.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {missingRequired.map((t) => (
              <span key={t} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                {DOCUMENT_TYPE_LABELS[t]}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-crebrid-500 text-crebrid-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge !== undefined && (
                <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Loan Details */}
              <Section title="Loan Details" icon={DollarSign}>
                <DetailRow label="Requested Amount" value={formatCurrency(loan.requestedLoanAmt)} />
                <DetailRow label="Purchase Price" value={formatCurrency(loan.purchasePrice)} />
                {loan.rehabBudget != null && (
                  <DetailRow label="Rehab Budget" value={formatCurrency(loan.rehabBudget)} />
                )}
                {loan.afterRepairValue != null && (
                  <DetailRow label="ARV" value={formatCurrency(loan.afterRepairValue)} />
                )}
                {loan.estimatedLtv != null && (
                  <DetailRow
                    label="Est. LTV"
                    value={formatPercent(loan.estimatedLtv)}
                    highlight={loan.estimatedLtv > 0.75 ? "red" : "green"}
                  />
                )}
                {loan.estimatedLtc != null && (
                  <DetailRow
                    label="Est. LTC"
                    value={formatPercent(loan.estimatedLtc)}
                    highlight={loan.estimatedLtc > 0.85 ? "red" : "green"}
                  />
                )}
                {loan.dscrRatio != null && (
                  <DetailRow
                    label="DSCR"
                    value={loan.dscrRatio.toFixed(2) + "x"}
                    highlight={loan.dscrRatio < 1.0 ? "red" : "green"}
                  />
                )}
                {loan.monthlyRent != null && (
                  <DetailRow label="Monthly Rent" value={formatCurrency(loan.monthlyRent)} />
                )}
                <DetailRow
                  label="Rate / Term"
                  value={
                    loan.requestedRate && loan.requestedTerm
                      ? `${loan.requestedRate}% / ${loan.requestedTerm} mo`
                      : "—"
                  }
                />
                {loan.exitStrategy && (
                  <div className="pt-2 border-t border-gray-50">
                    <p className="text-xs text-gray-500 mb-1">Exit Strategy</p>
                    <p className="text-sm text-gray-700">{loan.exitStrategy}</p>
                  </div>
                )}
              </Section>

              {/* Property */}
              <Section title="Property" icon={Building2}>
                <DetailRow label="Address" value={loan.propertyAddress ?? "—"} />
                <DetailRow
                  label="City / State / ZIP"
                  value={
                    loan.propertyCity
                      ? `${loan.propertyCity}, ${loan.propertyState} ${loan.propertyZip}`
                      : "—"
                  }
                />
                <DetailRow label="Type" value={loan.propertyType ?? "—"} />
                <DetailRow label="Condition" value={loan.propertyCondition ?? "—"} />
              </Section>

              {/* Borrower */}
              <Section title="Borrower" icon={User}>
                <DetailRow label="Name" value={loan.borrowerName ?? "—"} />
                {loan.borrowerEntity && (
                  <DetailRow label="Entity" value={loan.borrowerEntity} />
                )}
                <DetailRow label="Email" value={loan.borrowerEmail ?? "—"} />
                <DetailRow label="Phone" value={loan.borrowerPhone ?? "—"} />
                <DetailRow label="Experience" value={loan.borrowerExperience ?? "—"} />
              </Section>

              {/* Broker / Submitted By */}
              <Section title="Submitted By" icon={User}>
                <DetailRow label="Broker" value={loan.broker.name ?? loan.broker.email} />
                <DetailRow label="Email" value={loan.broker.email} />
                {loan.broker.company && (
                  <DetailRow label="Company" value={loan.broker.company} />
                )}
                {loan.broker.nmls && (
                  <DetailRow label="NMLS" value={loan.broker.nmls} />
                )}
                <DetailRow label="Submitted" value={formatDate(loan.createdAt)} />
                <DetailRow label="Last Updated" value={formatDate(loan.updatedAt)} />
                {loan.baselineId && (
                  <DetailRow label="Baseline ID" value={loan.baselineId} />
                )}
              </Section>

              {/* Notes */}
              {loan.notes && (
                <div className="md:col-span-2 bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Broker Notes
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{loan.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <DocumentUpload
              loan={loan}
              onUploaded={refreshLoan}
            />
          )}

          {/* AI Review Tab */}
          {activeTab === "ai-review" && (
            <AIReviewPanel
              loan={loan}
              onRunReview={runAIReview}
              loading={aiReviewLoading}
            />
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <div className="space-y-3">
              {loan.activities.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No activity yet</p>
              ) : (
                loan.activities.map((act) => (
                  <div key={act.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-crebrid-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-700">{act.message}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(act.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-gray-400" />
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "red" | "green";
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <span className="text-xs text-gray-500 flex-shrink-0">{label}</span>
      <span
        className={`text-sm font-medium text-right ${
          highlight === "red"
            ? "text-red-600"
            : highlight === "green"
              ? "text-green-600"
              : "text-gray-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
