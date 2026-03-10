import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "PROCESSOR";
  const brokerId = isAdmin ? undefined : session.user.id;
  const where = brokerId ? { brokerId } : {};

  const [
    totalLoans,
    draftLoans,
    pendingDocsLoans,
    inReviewLoans,
    approvedLoans,
    conditionalLoans,
    recentLoans,
  ] = await Promise.all([
    db.loan.count({ where }),
    db.loan.count({ where: { ...where, status: "DRAFT" } }),
    db.loan.count({ where: { ...where, status: "DOCUMENTS_PENDING" } }),
    db.loan.count({
      where: {
        ...where,
        status: { in: ["UNDER_REVIEW", "AI_REVIEW_COMPLETE", "PROCESSOR_REVIEW"] },
      },
    }),
    db.loan.count({ where: { ...where, status: "APPROVED" } }),
    db.loan.count({ where: { ...where, status: "CONDITIONALLY_APPROVED" } }),
    db.loan.findMany({
      where,
      include: {
        broker: { select: { name: true, email: true } },
        _count: { select: { documents: true } },
        aiReview: { select: { overallStatus: true, overallScore: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  // Pipeline value (sum of requestedLoanAmt for active loans)
  const pipelineValue = await db.loan.aggregate({
    where: {
      ...where,
      status: {
        notIn: ["DENIED", "CLOSED", "WITHDRAWN"],
      },
      requestedLoanAmt: { not: null },
    },
    _sum: { requestedLoanAmt: true },
  });

  return NextResponse.json({
    stats: {
      total: totalLoans,
      draft: draftLoans,
      pendingDocs: pendingDocsLoans,
      inReview: inReviewLoans,
      approved: approvedLoans,
      conditional: conditionalLoans,
      pipelineValue: pipelineValue._sum.requestedLoanAmt ?? 0,
    },
    recentLoans,
  });
}
