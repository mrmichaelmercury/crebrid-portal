import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateLoanSchema = z.object({
  status: z.enum(["DRAFT", "SUBMITTED", "DOCUMENTS_PENDING", "UNDER_REVIEW", "AI_REVIEW_COMPLETE", "PROCESSOR_REVIEW", "APPROVED", "CONDITIONALLY_APPROVED", "DENIED", "CLOSED", "WITHDRAWN"]).optional(),
  propertyAddress: z.string().optional(),
  propertyCity: z.string().optional(),
  propertyState: z.string().optional(),
  propertyZip: z.string().optional(),
  propertyType: z.string().optional(),
  propertyCondition: z.string().optional(),
  purchasePrice: z.number().optional().nullable(),
  rehabBudget: z.number().optional().nullable(),
  afterRepairValue: z.number().optional().nullable(),
  requestedLoanAmt: z.number().optional().nullable(),
  monthlyRent: z.number().optional().nullable(),
  annualNOI: z.number().optional().nullable(),
  borrowerName: z.string().optional(),
  borrowerEmail: z.string().email().optional(),
  borrowerPhone: z.string().optional(),
  borrowerEntity: z.string().optional(),
  borrowerExperience: z.string().optional(),
  requestedRate: z.number().optional().nullable(),
  requestedTerm: z.number().optional().nullable(),
  exitStrategy: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loan = await db.loan.findUnique({
    where: { id: params.id },
    include: {
      broker: {
        select: { name: true, email: true, phone: true, company: true, nmls: true },
      },
      documents: {
        orderBy: { createdAt: "asc" },
      },
      aiReview: true,
      activities: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!loan) {
    return NextResponse.json({ error: "Loan not found" }, { status: 404 });
  }

  // Brokers can only see their own loans
  if (
    session.user.role === "BROKER" &&
    loan.brokerId !== session.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(loan);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loan = await db.loan.findUnique({ where: { id: params.id } });
  if (!loan) {
    return NextResponse.json({ error: "Loan not found" }, { status: 404 });
  }

  if (
    session.user.role === "BROKER" &&
    loan.brokerId !== session.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as unknown;
  const parsed = updateLoanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Recalculate LTV/LTC if financials changed
  const purchasePrice = data.purchasePrice ?? loan.purchasePrice;
  const rehabBudget = data.rehabBudget ?? loan.rehabBudget;
  const requestedLoanAmt = data.requestedLoanAmt ?? loan.requestedLoanAmt;

  let estimatedLtv = loan.estimatedLtv;
  let estimatedLtc = loan.estimatedLtc;

  if (requestedLoanAmt && purchasePrice) {
    estimatedLtv = requestedLoanAmt / purchasePrice;
  }
  if (requestedLoanAmt && purchasePrice && rehabBudget) {
    estimatedLtc = requestedLoanAmt / (purchasePrice + rehabBudget);
  }

  const updated = await db.loan.update({
    where: { id: params.id },
    data: { ...data, estimatedLtv, estimatedLtc },
    include: {
      documents: { orderBy: { createdAt: "asc" } },
      aiReview: true,
    },
  });

  if (data.status && data.status !== loan.status) {
    await db.loanActivity.create({
      data: {
        loanId: loan.id,
        userId: session.user.id,
        type: "STATUS_CHANGED",
        message: `Status changed from ${loan.status} to ${data.status}`,
      },
    });
  }

  return NextResponse.json(updated);
}
