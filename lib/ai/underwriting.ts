import Anthropic from "@anthropic-ai/sdk";
import { LOAN_REQUIREMENTS_PROMPT } from "./prompts";
import type { Loan, Document } from "@prisma/client";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface UnderwritingAnalysis {
  overallStatus: "PASS" | "CONDITIONAL" | "FAIL";
  overallScore: number;
  summary: string;
  recommendation: string;
  checks: {
    ltv: CheckResult;
    ltc: CheckResult;
    dscr: CheckResult;
    creditScore: CheckResult;
    propertyType: CheckResult;
    borrowerExperience: CheckResult;
    entityStructure: CheckResult;
    exitStrategy: CheckResult;
    insurance: CheckResult;
    documentation: CheckResult;
  };
  redFlags: Array<{
    severity: "CRITICAL" | "HIGH" | "MEDIUM";
    message: string;
    impact: string;
  }>;
  conditions: Array<{
    priority: "REQUIRED" | "RECOMMENDED";
    message: string;
    category: "DOCUMENT" | "FINANCIAL" | "PROPERTY" | "BORROWER";
  }>;
  strengths: string[];
  missingDocuments: Array<{
    docType: string;
    reason: string;
    priority: "REQUIRED" | "RECOMMENDED";
  }>;
}

interface CheckResult {
  status: "PASS" | "FAIL" | "WARNING" | "N/A";
  calculated?: number;
  maxAllowed?: number;
  minRequired?: number;
  score?: number;
  notes: string;
}

type LoanWithDocuments = Loan & { documents: Document[] };

export async function generateUnderwritingAnalysis(
  loan: LoanWithDocuments
): Promise<{ analysis: UnderwritingAnalysis; tokensUsed: number }> {
  // Build a comprehensive loan summary for the AI
  const loanSummary = buildLoanSummary(loan);

  const stream = anthropic.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 8192,
    thinking: { type: "adaptive" },
    output_config: { effort: "high" },
    system: LOAN_REQUIREMENTS_PROMPT,
    messages: [
      {
        role: "user",
        content: `Please perform a complete underwriting analysis for this loan file:

${loanSummary}

Return your analysis as a JSON object per the schema provided.`,
      },
    ],
  });

  const response = await stream.finalMessage();

  const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;

  const textContent = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  const jsonMatch = textContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI did not return valid JSON for underwriting analysis");
  }

  const analysis = JSON.parse(jsonMatch[0]) as UnderwritingAnalysis;
  return { analysis, tokensUsed };
}

function buildLoanSummary(loan: LoanWithDocuments): string {
  const loanTypeLabels: Record<string, string> = {
    FIX_AND_FLIP: "Fix & Flip",
    BRIDGE: "Bridge Loan",
    DSCR_RENTAL: "DSCR / Rental",
    NEW_CONSTRUCTION: "New Construction",
  };

  const lines: string[] = [
    `=== LOAN OVERVIEW ===`,
    `Loan Number: ${loan.loanNumber}`,
    `Loan Type: ${loanTypeLabels[loan.loanType] ?? loan.loanType}`,
    ``,
    `=== PROPERTY ===`,
    `Address: ${loan.propertyAddress ?? "Not provided"}, ${loan.propertyCity ?? ""}, ${loan.propertyState ?? ""} ${loan.propertyZip ?? ""}`,
    `Property Type: ${loan.propertyType ?? "Not specified"}`,
    `Property Condition: ${loan.propertyCondition ?? "Not specified"}`,
    ``,
    `=== LOAN AMOUNTS ===`,
    `Purchase Price: ${fmtMoney(loan.purchasePrice)}`,
    `Requested Loan Amount: ${fmtMoney(loan.requestedLoanAmt)}`,
    `Rehab Budget: ${fmtMoney(loan.rehabBudget)}`,
    `After Repair Value (ARV): ${fmtMoney(loan.afterRepairValue)}`,
    `Estimated LTV: ${loan.estimatedLtv != null ? `${(loan.estimatedLtv * 100).toFixed(1)}%` : "Not calculated"}`,
    `Estimated LTC: ${loan.estimatedLtc != null ? `${(loan.estimatedLtc * 100).toFixed(1)}%` : "Not calculated"}`,
  ];

  if (loan.loanType === "DSCR_RENTAL") {
    lines.push(
      `Monthly Rent: ${fmtMoney(loan.monthlyRent)}`,
      `Annual NOI: ${fmtMoney(loan.annualNOI)}`,
      `DSCR: ${loan.dscrRatio?.toFixed(2) ?? "Not calculated"}`
    );
  }

  lines.push(
    ``,
    `=== BORROWER ===`,
    `Name: ${loan.borrowerName ?? "Not provided"}`,
    `Email: ${loan.borrowerEmail ?? "Not provided"}`,
    `Phone: ${loan.borrowerPhone ?? "Not provided"}`,
    `Entity: ${loan.borrowerEntity ?? "None / Individual"}`,
    `Experience: ${loan.borrowerExperience ?? "Not specified"}`,
    ``,
    `=== LOAN TERMS REQUESTED ===`,
    `Interest Rate: ${loan.requestedRate != null ? `${loan.requestedRate}%` : "Not specified"}`,
    `Term: ${loan.requestedTerm != null ? `${loan.requestedTerm} months` : "Not specified"}`,
    `Exit Strategy: ${loan.exitStrategy ?? "Not specified"}`,
    ``,
    `=== NOTES FROM BROKER ===`,
    loan.notes ?? "None",
    ``,
    `=== UPLOADED DOCUMENTS (${loan.documents.length} total) ===`
  );

  for (const doc of loan.documents) {
    lines.push(`\n[${doc.documentType}] ${doc.fileName}`);
    if (doc.aiSummary) {
      lines.push(`  Summary: ${doc.aiSummary}`);
    }
    if (doc.aiExtractedData) {
      const data = doc.aiExtractedData as Record<string, unknown>;
      const keyFields = [
        "purchasePrice",
        "rehabBudget",
        "afterRepairValue",
        "monthlyRent",
        "creditScore",
        "bankAccountBalances",
        "averageBalance",
        "insuranceCoverage",
        "appraisedValue",
        "entityName",
        "entityType",
        "constructionCost",
        "closingDate",
      ];
      for (const key of keyFields) {
        if (data[key] !== undefined && data[key] !== null) {
          lines.push(`  ${key}: ${JSON.stringify(data[key])}`);
        }
      }
    }
    if (doc.aiFlags) {
      const flags = doc.aiFlags as Array<{ severity: string; message: string }>;
      for (const flag of flags) {
        if (flag.severity === "HIGH") {
          lines.push(`  ⚠️ FLAG [${flag.severity}]: ${flag.message}`);
        }
      }
    }
  }

  return lines.join("\n");
}

function fmtMoney(val: number | null | undefined): string {
  if (val == null) return "Not provided";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);
}
