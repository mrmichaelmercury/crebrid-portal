import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { generateLoanNumber } from "@/lib/utils";
import { z } from "zod";

const createLoanSchema = z.object({
  loanType: z.enum(["FIX_AND_FLIP", "BRIDGE", "DSCR_RENTAL", "NEW_CONSTRUCTION"]),
  propertyAddress: z.string().optional(),
  propertyCity: z.string().optional(),
  propertyState: z.string().optional(),
  propertyZip: z.string().optional(),
  propertyType: z.string().optional(),
  propertyCondition: z.string().optional(),
  purchasePrice: z.number().optional(),
  rehabBudget: z.number().optional(),
  afterRepairValue: z.number().optional(),
  requestedLoanAmt: z.number().optional(),
  monthlyRent: z.number().optional(),
  annualNOI: z.number().optional(),
  borrowerName: z.string().optional(),
  borrowerEmail: z.string().email().optional(),
  borrowerPhone: z.string().optional(),
  borrowerEntity: z.string().optional(),
  borrowerExperience: z.string().optional(),
  requestedRate: z.number().optional(),
  requestedTerm: z.number().optional(),
  exitStrategy: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const skip = (page - 1) * limit;

  const where =
    session.user.role === "ADMIN" || session.user.role === "PROCESSOR"
      ? status ? { status: status as never } : {}
      : status
        ? { brokerId: session.user.id, status: status as never }
        : { brokerId: session.user.id };

  const [loans, total] = await Promise.all([
    db.loan.findMany({
      where,
      include: {
        broker: { select: { name: true, email: true, company: true } },
        _count: { select: { documents: true } },
        aiReview: { select: { overallStatus: true, overallScore: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    }),
    db.loan.count({ where }),
  ]);

  return NextResponse.json({ loans, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as unknown;
  const parsed = createLoanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Auto-calculate LTV and LTC
  let estimatedLtv: number | undefined;
  let estimatedLtc: number | undefined;
  let estimatedArv: number | undefined;

  if (data.requestedLoanAmt && data.purchasePrice) {
    estimatedLtv = data.requestedLoanAmt / data.purchasePrice;
  }
  if (data.requestedLoanAmt && data.purchasePrice && data.rehabBudget) {
    estimatedLtc = data.requestedLoanAmt / (data.purchasePrice + data.rehabBudget);
  }
  if (data.afterRepairValue) {
    estimatedArv = data.afterRepairValue;
  }

  // Calculate DSCR
  let dscrRatio: number | undefined;
  if (data.annualNOI && data.requestedLoanAmt && data.requestedRate && data.requestedTerm) {
    const annualDebtService =
      (data.requestedLoanAmt * (data.requestedRate / 100)) / 12 * 12;
    if (annualDebtService > 0) {
      dscrRatio = data.annualNOI / annualDebtService;
    }
  }

  const { loanType, ...restData } = data;

  const loan = await db.loan.create({
    data: {
      loanNumber: generateLoanNumber(),
      loanType,
      brokerId: session.user.id,
      status: "DRAFT",
      ...restData,
      estimatedLtv,
      estimatedLtc,
      estimatedArv,
      dscrRatio,
    },
  });

  // Log activity
  await db.loanActivity.create({
    data: {
      loanId: loan.id,
      userId: session.user.id,
      type: "LOAN_CREATED",
      message: `Loan ${loan.loanNumber} created`,
    },
  });

  return NextResponse.json(loan, { status: 201 });
}
