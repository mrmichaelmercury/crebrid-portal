"use client";

import {
  Brain,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileText,
} from "lucide-react";
import { useState } from "react";
import type { Loan, Document, AIReview } from "@prisma/client";

type LoanWithDocs = Loan & { documents: Document[]; aiReview: AIReview | null };

interface Props {
  loan: LoanWithDocs;
  onRunReview: () => Promise<void>;
  loading: boolean;
}

type CheckResult = {
  status: "PASS" | "FAIL" | "WARNING" | "N/A";
  calculated?: number;
  maxAllowed?: number;
  minRequired?: number;
  score?: number;
  notes: string;
};

type ReviewData = {
  overallStatus: string;
  overallScore: number;
  summary: string;
  recommendation: string;
  checks: Record<string, CheckResult>;
  redFlags: Array<{ severity: string; message: string; impact: string }>;
  conditions: Array<{ priority: string; message: string; category: string }>;
  strengths: string[];
  missingDocuments: Array<{ docType: string; reason: string; priority: string }>;
};

const CHECK_LABELS: Record<string, string> = {
  ltv: "Loan-to-Value (LTV)",
  ltc: "Loan-to-Cost (LTC)",
  dscr: "DSCR",
  creditScore: "Credit Score",
  propertyType: "Property Type",
  borrowerExperience: "Borrower Experience",
  entityStructure: "Entity Structure",
  exitStrategy: "Exit Strategy",
  insurance: "Insurance",
  documentation: "Documentation",
};

export default function AIReviewPanel({ loan, onRunReview, loading }: Props) {
  const [expandedSection, setExpandedSection] = useState<string | null>("checks");

  if (!loan.aiReview) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-50 mx-auto">
          <Brain className="w-7 h-7 text-purple-500" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">No AI Review Yet</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Upload your documents first, then run the AI underwriting review. The AI will check all
            loan requirements and flag any issues.
          </p>
        </div>

        {loan.documents.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 max-w-sm mx-auto">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm font-medium">Upload documents first</p>
            </div>
          </div>
        )}

        <button
          onClick={onRunReview}
          disabled={loading || loan.documents.length === 0}
          className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running AI Review...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4" />
              Run AI Underwriting Review
            </>
          )}
        </button>

        {loan.documents.length > 0 && (
          <p className="text-xs text-gray-400">
            {loan.documents.length} document{loan.documents.length > 1 ? "s" : ""} ready for review
          </p>
        )}
      </div>
    );
  }

  const review = loan.aiReview as AIReview & { rawAnalysis: string };
  let reviewData: ReviewData | null = null;

  try {
    reviewData = JSON.parse(review.rawAnalysis ?? "{}") as ReviewData;
  } catch {
    // Fall back to individual fields
  }

  const overallStatus = reviewData?.overallStatus ?? (review as unknown as { overallStatus: string }).overallStatus;
  const overallScore = reviewData?.overallScore ?? (review as unknown as { overallScore: number }).overallScore;
  const summary = reviewData?.summary ?? (review as unknown as { summary: string }).summary;
  const recommendation = reviewData?.recommendation ?? (review as unknown as { recommendation: string }).recommendation;
  const checks = reviewData?.checks ?? {};
  const redFlags = reviewData?.redFlags ?? (review.redFlags as Array<{ severity: string; message: string; impact: string }> ?? []);
  const conditions = reviewData?.conditions ?? (review.conditions as Array<{ priority: string; message: string; category: string }> ?? []);
  const strengths = reviewData?.strengths ?? [];
  const missingDocs = reviewData?.missingDocuments ?? (review.missingDocuments as Array<{ docType: string; reason: string; priority: string }> ?? []);

  const statusConfig = {
    PASS: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", icon: CheckCircle2, label: "Approved for Processing" },
    CONDITIONAL: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", icon: AlertCircle, label: "Conditional Approval" },
    FAIL: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", icon: XCircle, label: "Declined / Major Issues" },
  };

  const cfg = statusConfig[overallStatus as keyof typeof statusConfig] ?? statusConfig.CONDITIONAL;
  const CfgIcon = cfg.icon;

  const toggle = (section: string) =>
    setExpandedSection(expandedSection === section ? null : section);

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <div className={`${cfg.bg} ${cfg.border} border rounded-xl p-4`}>
        <div className="flex items-start gap-3">
          <CfgIcon className={`w-6 h-6 ${cfg.text} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className={`font-semibold ${cfg.text}`}>{cfg.label}</p>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${cfg.text}`}>{overallScore}/100</span>
              </div>
            </div>
            <p className="text-sm text-gray-700 mt-1.5">{summary}</p>
          </div>
        </div>
      </div>

      {/* Red Flags */}
      {redFlags.length > 0 && (
        <div className="border border-red-200 rounded-xl overflow-hidden">
          <button
            onClick={() => toggle("flags")}
            className="w-full flex items-center justify-between px-4 py-3 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-semibold text-red-700">
                Red Flags ({redFlags.length})
              </span>
            </div>
            {expandedSection === "flags" ? (
              <ChevronUp className="w-4 h-4 text-red-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-red-400" />
            )}
          </button>
          {expandedSection === "flags" && (
            <div className="divide-y divide-red-50">
              {redFlags.map((flag, i) => (
                <div key={i} className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        flag.severity === "CRITICAL"
                          ? "bg-red-700 text-white"
                          : flag.severity === "HIGH"
                            ? "bg-red-100 text-red-700"
                            : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {flag.severity}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">{flag.message}</p>
                  {flag.impact && (
                    <p className="text-xs text-gray-500 mt-0.5">{flag.impact}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Requirements Checks */}
      {Object.keys(checks).length > 0 && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => toggle("checks")}
            className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">Requirements Checks</span>
            </div>
            {expandedSection === "checks" ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {expandedSection === "checks" && (
            <div className="divide-y divide-gray-50">
              {Object.entries(checks).map(([key, check]) => {
                if (check.status === "N/A") return null;
                return (
                  <div key={key} className="px-4 py-3 flex items-start gap-3">
                    {check.status === "PASS" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : check.status === "WARNING" ? (
                      <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-gray-800">
                          {CHECK_LABELS[key] ?? key}
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            check.status === "PASS"
                              ? "text-green-600"
                              : check.status === "WARNING"
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {check.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{check.notes}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Conditions */}
      {conditions.length > 0 && (
        <div className="border border-yellow-200 rounded-xl overflow-hidden">
          <button
            onClick={() => toggle("conditions")}
            className="w-full flex items-center justify-between px-4 py-3 bg-yellow-50 hover:bg-yellow-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-semibold text-yellow-700">
                Conditions ({conditions.length})
              </span>
            </div>
            {expandedSection === "conditions" ? (
              <ChevronUp className="w-4 h-4 text-yellow-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-yellow-400" />
            )}
          </button>
          {expandedSection === "conditions" && (
            <div className="divide-y divide-yellow-50">
              {conditions.map((cond, i) => (
                <div key={i} className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        cond.priority === "REQUIRED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {cond.priority}
                    </span>
                    <span className="text-xs text-gray-400">{cond.category}</span>
                  </div>
                  <p className="text-sm text-gray-700">{cond.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Missing Documents */}
      {missingDocs.length > 0 && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => toggle("missing")}
            className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">
                Missing Documents ({missingDocs.length})
              </span>
            </div>
            {expandedSection === "missing" ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {expandedSection === "missing" && (
            <div className="divide-y divide-gray-50">
              {missingDocs.map((doc, i) => (
                <div key={i} className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        doc.priority === "REQUIRED"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {doc.priority}
                    </span>
                    <span className="text-sm font-medium text-gray-800">{doc.docType}</span>
                  </div>
                  <p className="text-xs text-gray-500">{doc.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="border border-green-100 rounded-xl overflow-hidden">
          <button
            onClick={() => toggle("strengths")}
            className="w-full flex items-center justify-between px-4 py-3 bg-green-50 hover:bg-green-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold text-green-700">
                Strengths ({strengths.length})
              </span>
            </div>
            {expandedSection === "strengths" ? (
              <ChevronUp className="w-4 h-4 text-green-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-green-400" />
            )}
          </button>
          {expandedSection === "strengths" && (
            <div className="px-4 py-3 space-y-1.5">
              {strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{s}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recommendation */}
      {recommendation && (
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Processor Recommendation
          </p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{recommendation}</p>
        </div>
      )}

      {/* Re-run */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-gray-400">
          Powered by Claude Opus 4.6 · {review.tokensUsed?.toLocaleString()} tokens used
        </p>
        <button
          onClick={onRunReview}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Brain className="w-3.5 h-3.5" />}
          Re-run Review
        </button>
      </div>
    </div>
  );
}
