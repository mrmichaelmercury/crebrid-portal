import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { syncLoanToBaseline, exportLoanToCSV, isBaselineConfigured } from "@/lib/baseline";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only admins and processors can push to Baseline
  if (session.user.role === "BROKER") {
    return NextResponse.json(
      { error: "Only processors and admins can export to Baseline." },
      { status: 403 }
    );
  }

  const loan = await db.loan.findUnique({
    where: { id: params.id },
    include: {
      documents: true,
      aiReview: true,
      broker: {
        select: { name: true, email: true, phone: true, nmls: true },
      },
    },
  });

  if (!loan) {
    return NextResponse.json({ error: "Loan not found" }, { status: 404 });
  }

  if (!isBaselineConfigured) {
    return NextResponse.json(
      {
        error: "Baseline API is not configured.",
        message:
          "Contact Baseline at support@baselinesoftware.com to obtain API credentials, then add BASELINE_API_KEY, BASELINE_API_URL, and BASELINE_LENDER_ID to your .env file.",
        csvAvailable: true,
      },
      { status: 503 }
    );
  }

  const result = await syncLoanToBaseline(loan);

  if (result.success && result.baselineId) {
    await db.loan.update({
      where: { id: params.id },
      data: {
        baselineId: result.baselineId,
        baselineExportedAt: new Date(),
        baselineStatus: "SYNCED",
      },
    });

    await db.loanActivity.create({
      data: {
        loanId: params.id,
        userId: session.user.id,
        type: "BASELINE_SYNCED",
        message: `Loan synced to Baseline (ID: ${result.baselineId})`,
      },
    });

    return NextResponse.json({ success: true, baselineId: result.baselineId });
  }

  return NextResponse.json(
    { success: false, error: result.error },
    { status: 500 }
  );
}

// GET: Export as CSV (fallback for when API isn't configured)
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "BROKER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const loan = await db.loan.findUnique({
    where: { id: params.id },
    include: {
      documents: true,
      aiReview: true,
      broker: {
        select: { name: true, email: true, phone: true, nmls: true },
      },
    },
  });

  if (!loan) {
    return NextResponse.json({ error: "Loan not found" }, { status: 404 });
  }

  const csv = exportLoanToCSV(loan);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="crebrid-loan-${loan.loanNumber}.csv"`,
    },
  });
}
