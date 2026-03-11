export type ProjectType =
  | "FIX_FLIP_PURCHASE"
  | "FIX_FLIP_REFI"
  | "AS_IS_PURCHASE"
  | "AS_IS_REFI"
  | "NEW_CONSTRUCTION";

export type CreditTier = "BELOW_640" | "640_699" | "700_740" | "741_PLUS";
export type ExperienceTier = "0_2" | "3_9" | "10_PLUS";

export interface RateInput {
  projectType: ProjectType;
  asIsValue: number;
  arv: number;
  creditTier: CreditTier;
  experience: ExperienceTier;
  cashOut: boolean;
  brokerFee: number;
  thirdPartyCosts: number;
  state: string;
}

export interface TermSheetData {
  estimatedRate: number;
  points: number;
  maxLoanAmount: number;
  ltvPercent: number;
  term: number;
  monthlyPayment: number;
  originationFee: number;
  brokerFee: number;
  thirdPartyCosts: number;
  totalEstimatedClosingCosts: number;
  programLabel: string;
}

const PROGRAM_LABELS: Record<ProjectType, string> = {
  FIX_FLIP_PURCHASE: "Fix & Flip – Purchase",
  FIX_FLIP_REFI: "Fix & Flip – Refinance",
  AS_IS_PURCHASE: "As-Is – Purchase",
  AS_IS_REFI: "As-Is – Refinance",
  NEW_CONSTRUCTION: "New Construction",
};

// Base rates by program type (floors at the advertised 7.73% minimum)
const BASE_RATES: Record<ProjectType, number> = {
  FIX_FLIP_PURCHASE: 8.99,
  FIX_FLIP_REFI: 9.49,
  AS_IS_PURCHASE: 9.49,
  AS_IS_REFI: 9.99,
  NEW_CONSTRUCTION: 9.99,
};

// Rate adjustments by credit tier (percentage points)
const CREDIT_ADJ: Record<CreditTier, number> = {
  BELOW_640: 1.25,
  "640_699": 0.5,
  "700_740": -0.25,
  "741_PLUS": -0.75,
};

// Rate adjustments by experience tier
const EXP_ADJ: Record<ExperienceTier, number> = {
  "0_2": 0.25,
  "3_9": 0.0,
  "10_PLUS": -0.5,
};

// Max LTV limits [asIsLTV, arvLTV] — loan capped at lesser of both
const LTV_LIMITS: Record<ProjectType, [number, number]> = {
  FIX_FLIP_PURCHASE: [0.75, 0.9],
  FIX_FLIP_REFI: [0.7, 0.85],
  AS_IS_PURCHASE: [0.7, 0.8],
  AS_IS_REFI: [0.65, 0.75],
  NEW_CONSTRUCTION: [0.7, 0.75],
};

// Loan term in months by program
const TERMS: Record<ProjectType, number> = {
  FIX_FLIP_PURCHASE: 12,
  FIX_FLIP_REFI: 12,
  AS_IS_PURCHASE: 12,
  AS_IS_REFI: 12,
  NEW_CONSTRUCTION: 18,
};

// Origination points by experience tier
const BASE_POINTS: Record<ExperienceTier, number> = {
  "0_2": 2.5,
  "3_9": 2.0,
  "10_PLUS": 1.75,
};

// TODO: Replace this function with a call to the crebrid.com internal pricing API
// or the Baseline pricing engine once API credentials and endpoints are confirmed.
// The inputs and output shape should remain the same — just swap the body.
export function calculateTermSheet(input: RateInput): TermSheetData {
  // Rate calculation
  let rate = BASE_RATES[input.projectType];
  rate += CREDIT_ADJ[input.creditTier];
  rate += EXP_ADJ[input.experience];
  if (input.cashOut) rate += 0.25;
  rate = Math.max(Math.round(rate * 100) / 100, 7.73);

  // Loan amount — lesser of as-is LTV cap and ARV LTV cap
  const [asIsLtv, arvLtv] = LTV_LIMITS[input.projectType];
  const maxLoanAmount = Math.round(
    Math.min(input.asIsValue * asIsLtv, input.arv * arvLtv)
  );

  const ltvPercent = Math.round((maxLoanAmount / input.asIsValue) * 1000) / 10;
  const term = TERMS[input.projectType];

  // Interest-only monthly payment
  const monthlyPayment = Math.round(maxLoanAmount * (rate / 100 / 12));

  // Origination fee
  const points = BASE_POINTS[input.experience];
  const originationFee = Math.round(maxLoanAmount * (points / 100));

  const totalEstimatedClosingCosts = Math.round(
    originationFee + input.brokerFee + input.thirdPartyCosts
  );

  return {
    estimatedRate: rate,
    points,
    maxLoanAmount,
    ltvPercent,
    term,
    monthlyPayment,
    originationFee,
    brokerFee: input.brokerFee,
    thirdPartyCosts: input.thirdPartyCosts,
    totalEstimatedClosingCosts,
    programLabel: PROGRAM_LABELS[input.projectType],
  };
}
