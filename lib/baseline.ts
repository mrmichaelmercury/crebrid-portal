/**
 * Baseline Integration Layer
 *
 * Baseline is a purpose-built LOS for private/hard money lenders.
 * NOTE: Baseline's public API has limited documentation. Contact Baseline
 * at support@baselinesoftware.com to request API credentials and docs.
 *
 * This module provides:
 * 1. Data export in Baseline-compatible format
 * 2. REST API sync (when Baseline API key is configured)
 * 3. CSV export as fallback for manual import
 */

import type { Loan, Document, AIReview } from "@prisma/client";

const BASELINE_API_URL = process.env.BASELINE_API_URL;
const BASELINE_API_KEY = process.env.BASELINE_API_KEY;
const BASELINE_LENDER_ID = process.env.BASELINE_LENDER_ID;

export const isBaselineConfigured =
  !!BASELINE_API_KEY && !!BASELINE_API_URL && !!BASELINE_LENDER_ID;

type LoanWithAll = Loan & {
  documents: Document[];
  aiReview: AIReview | null;
  broker: { name: string | null; email: string; phone: string | null; nmls: string | null };
};

/**
 * Maps Crebrid loan type to Baseline loan product type
 */
function mapLoanType(loanType: string): string {
  const mapping: Record<string, string> = {
    FIX_AND_FLIP: "fix_flip",
    BRIDGE: "bridge",
    DSCR_RENTAL: "dscr",
    NEW_CONSTRUCTION: "construction",
  };
  return mapping[loanType] ?? "bridge";
}

/**
 * Build a Baseline-compatible loan payload
 */
export function buildBaselinePayload(loan: LoanWithAll): Record<string, unknown> {
  return {
    externalId: loan.id,
    loanNumber: loan.loanNumber,
    loanType: mapLoanType(loan.loanType),
    status: "submitted",

    property: {
      address: loan.propertyAddress,
      city: loan.propertyCity,
      state: loan.propertyState,
      zip: loan.propertyZip,
      type: loan.propertyType,
      condition: loan.propertyCondition,
    },

    loan: {
      requestedAmount: loan.requestedLoanAmt,
      purchasePrice: loan.purchasePrice,
      rehabBudget: loan.rehabBudget,
      afterRepairValue: loan.afterRepairValue,
      estimatedLtv: loan.estimatedLtv,
      estimatedLtc: loan.estimatedLtc,
      requestedRate: loan.requestedRate,
      requestedTermMonths: loan.requestedTerm,
      exitStrategy: loan.exitStrategy,
      ...(loan.loanType === "DSCR_RENTAL" && {
        monthlyRent: loan.monthlyRent,
        annualNOI: loan.annualNOI,
        dscrRatio: loan.dscrRatio,
      }),
    },

    borrower: {
      name: loan.borrowerName,
      email: loan.borrowerEmail,
      phone: loan.borrowerPhone,
      entity: loan.borrowerEntity,
      experience: loan.borrowerExperience,
    },

    broker: {
      name: loan.broker.name,
      email: loan.broker.email,
      phone: loan.broker.phone,
      nmls: loan.broker.nmls,
    },

    notes: loan.notes,

    aiSummary: loan.aiReview
      ? {
          score: (loan.aiReview as unknown as { overallScore: number }).overallScore,
          status: (loan.aiReview as unknown as { overallStatus: string }).overallStatus,
          summary: (loan.aiReview as unknown as { summary: string }).summary,
          recommendation: (loan.aiReview as unknown as { recommendation: string }).recommendation,
        }
      : null,

    documentCount: loan.documents.length,
    submittedAt: new Date().toISOString(),
  };
}

/**
 * Attempt to push a loan to Baseline via their API
 */
export async function syncLoanToBaseline(
  loan: LoanWithAll
): Promise<{ success: boolean; baselineId?: string; error?: string }> {
  if (!isBaselineConfigured) {
    return {
      success: false,
      error: "Baseline API not configured. Please add BASELINE_API_KEY, BASELINE_API_URL, and BASELINE_LENDER_ID to your environment.",
    };
  }

  const payload = buildBaselinePayload(loan);

  try {
    const response = await fetch(`${BASELINE_API_URL}/api/v1/loans`, {
      method: loan.baselineId ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BASELINE_API_KEY}`,
        "X-Lender-ID": BASELINE_LENDER_ID!,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Baseline API error ${response.status}: ${errorText}`,
      };
    }

    const data = (await response.json()) as { id?: string; loanId?: string };
    return {
      success: true,
      baselineId: data.id ?? data.loanId,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error connecting to Baseline",
    };
  }
}

/**
 * Export loan as CSV for manual import into Baseline
 */
export function exportLoanToCSV(loan: LoanWithAll): string {
  const payload = buildBaselinePayload(loan);

  const flat = flattenObject(payload);
  const headers = Object.keys(flat).join(",");
  const values = Object.values(flat)
    .map((v) => {
      if (v == null) return "";
      const str = String(v);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    })
    .join(",");

  return `${headers}\n${values}`;
}

function flattenObject(
  obj: Record<string, unknown>,
  prefix = ""
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}_${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
}
