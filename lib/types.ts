export type LoanType = "FIX_AND_FLIP" | "BRIDGE" | "DSCR_RENTAL" | "NEW_CONSTRUCTION";
export type LoanStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "DOCUMENTS_PENDING"
  | "UNDER_REVIEW"
  | "AI_REVIEW_COMPLETE"
  | "PROCESSOR_REVIEW"
  | "APPROVED"
  | "CONDITIONALLY_APPROVED"
  | "DENIED"
  | "CLOSED"
  | "WITHDRAWN";

export type DocumentType =
  | "PURCHASE_CONTRACT"
  | "SCOPE_OF_WORK"
  | "DRIVERS_LICENSE"
  | "ENTITY_DOCS"
  | "BANK_STATEMENTS"
  | "CREDIT_REPORT"
  | "TITLE_COMMITMENT"
  | "INSURANCE_DECLARATION"
  | "APPRAISAL"
  | "TRACK_RECORD"
  | "LEASE_AGREEMENT"
  | "RENT_ROLL"
  | "PLANS_AND_SPECS"
  | "CONSTRUCTION_BUDGET"
  | "CONTRACTOR_LICENSE"
  | "DRAW_SCHEDULE"
  | "PROPERTY_PHOTOS"
  | "OTHER";

export const LOAN_TYPE_LABELS: Record<LoanType, string> = {
  FIX_AND_FLIP: "Fix & Flip",
  BRIDGE: "Bridge Loan",
  DSCR_RENTAL: "DSCR / Rental",
  NEW_CONSTRUCTION: "New Construction",
};

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  DOCUMENTS_PENDING: "Documents Pending",
  UNDER_REVIEW: "Under Review",
  AI_REVIEW_COMPLETE: "AI Review Complete",
  PROCESSOR_REVIEW: "Processor Review",
  APPROVED: "Approved",
  CONDITIONALLY_APPROVED: "Conditionally Approved",
  DENIED: "Denied",
  CLOSED: "Closed",
  WITHDRAWN: "Withdrawn",
};

export const LOAN_STATUS_COLORS: Record<LoanStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  DOCUMENTS_PENDING: "bg-yellow-100 text-yellow-700",
  UNDER_REVIEW: "bg-purple-100 text-purple-700",
  AI_REVIEW_COMPLETE: "bg-indigo-100 text-indigo-700",
  PROCESSOR_REVIEW: "bg-orange-100 text-orange-700",
  APPROVED: "bg-green-100 text-green-700",
  CONDITIONALLY_APPROVED: "bg-teal-100 text-teal-700",
  DENIED: "bg-red-100 text-red-700",
  CLOSED: "bg-gray-100 text-gray-600",
  WITHDRAWN: "bg-gray-100 text-gray-500",
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  PURCHASE_CONTRACT: "Purchase Contract",
  SCOPE_OF_WORK: "Scope of Work / Rehab Budget",
  DRIVERS_LICENSE: "Driver's License / ID",
  ENTITY_DOCS: "Entity Documents (LLC/Corp)",
  BANK_STATEMENTS: "Bank Statements (Last 3 Months)",
  CREDIT_REPORT: "Credit Report",
  TITLE_COMMITMENT: "Title Commitment",
  INSURANCE_DECLARATION: "Insurance Declaration / Quote",
  APPRAISAL: "Appraisal / BPO",
  TRACK_RECORD: "Track Record / Prior Projects",
  LEASE_AGREEMENT: "Lease Agreement(s)",
  RENT_ROLL: "Rent Roll",
  PLANS_AND_SPECS: "Plans & Specifications",
  CONSTRUCTION_BUDGET: "Construction Budget / Contractor Bids",
  CONTRACTOR_LICENSE: "Contractor License & Insurance",
  DRAW_SCHEDULE: "Draw Schedule",
  PROPERTY_PHOTOS: "Property Photos",
  OTHER: "Other Document",
};

// Required documents per loan type
export const REQUIRED_DOCS: Record<LoanType, DocumentType[]> = {
  FIX_AND_FLIP: [
    "PURCHASE_CONTRACT",
    "SCOPE_OF_WORK",
    "DRIVERS_LICENSE",
    "BANK_STATEMENTS",
    "INSURANCE_DECLARATION",
    "TITLE_COMMITMENT",
    "TRACK_RECORD",
  ],
  BRIDGE: [
    "PURCHASE_CONTRACT",
    "DRIVERS_LICENSE",
    "BANK_STATEMENTS",
    "PROPERTY_PHOTOS",
    "TITLE_COMMITMENT",
    "INSURANCE_DECLARATION",
  ],
  DSCR_RENTAL: [
    "PURCHASE_CONTRACT",
    "DRIVERS_LICENSE",
    "BANK_STATEMENTS",
    "LEASE_AGREEMENT",
    "RENT_ROLL",
    "TITLE_COMMITMENT",
    "INSURANCE_DECLARATION",
    "APPRAISAL",
  ],
  NEW_CONSTRUCTION: [
    "PURCHASE_CONTRACT",
    "PLANS_AND_SPECS",
    "CONSTRUCTION_BUDGET",
    "CONTRACTOR_LICENSE",
    "DRAW_SCHEDULE",
    "DRIVERS_LICENSE",
    "BANK_STATEMENTS",
    "TITLE_COMMITMENT",
  ],
};

export const OPTIONAL_DOCS: Record<LoanType, DocumentType[]> = {
  FIX_AND_FLIP: ["ENTITY_DOCS", "CREDIT_REPORT", "APPRAISAL", "PROPERTY_PHOTOS"],
  BRIDGE: ["ENTITY_DOCS", "APPRAISAL", "CREDIT_REPORT", "SCOPE_OF_WORK"],
  DSCR_RENTAL: ["ENTITY_DOCS", "CREDIT_REPORT", "PROPERTY_PHOTOS"],
  NEW_CONSTRUCTION: ["ENTITY_DOCS", "CREDIT_REPORT", "PROPERTY_PHOTOS"],
};
