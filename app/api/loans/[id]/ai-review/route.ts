import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { generateUnderwritingAnalysis } from "@/lib/ai/underwriting";

export async function POST(
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
      documents: true,
      broker: {
        select: { name: true, email: true, phone: true, nmls: true },
      },
      aiReview: true,
    },
  });

  if (!loan) {
    return NextResponse.json({ error: "Loan not found" }, { status: 404 });
  }

  if (session.user.role === "BROKER" && loan.brokerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (loan.documents.length === 0) {
    return NextResponse.json(
      { error: "Please upload at least one document before requesting AI review." },
      { status: 400 }
    );
  }

  try {
    const { analysis, tokensUsed } = await generateUnderwritingAnalysis(loan);

    // Upsert the AI review
    const aiReview = await db.aIReview.upsert({
      where: { loanId: params.id },
      create: {
        loanId: params.id,
        overallScore: analysis.overallScore,
        overallStatus: analysis.overallStatus,
        summary: analysis.summary,
        recommendation: analysis.recommendation,
        ltvCheck: analysis.checks.ltv as never,
        ltcCheck: analysis.checks.ltc as never,
        dscrCheck: analysis.checks.dscr as never,
        documentsCheck: analysis.checks.documentation as never,
        borrowerCheck: analysis.checks.creditScore as never,
        propertyCheck: analysis.checks.propertyType as never,
        redFlags: analysis.redFlags as never,
        conditions: analysis.conditions as never,
        missingDocuments: analysis.missingDocuments as never,
        strengths: analysis.strengths as never,
        rawAnalysis: JSON.stringify(analysis),
        modelUsed: "claude-opus-4-6",
        tokensUsed,
      },
      update: {
        overallScore: analysis.overallScore,
        overallStatus: analysis.overallStatus,
        summary: analysis.summary,
        recommendation: analysis.recommendation,
        ltvCheck: analysis.checks.ltv as never,
        ltcCheck: analysis.checks.ltc as never,
        dscrCheck: analysis.checks.dscr as never,
        documentsCheck: analysis.checks.documentation as never,
        borrowerCheck: analysis.checks.creditScore as never,
        propertyCheck: analysis.checks.propertyType as never,
        redFlags: analysis.redFlags as never,
        conditions: analysis.conditions as never,
        missingDocuments: analysis.missingDocuments as never,
        strengths: analysis.strengths as never,
        rawAnalysis: JSON.stringify(analysis),
        modelUsed: "claude-opus-4-6",
        tokensUsed,
        updatedAt: new Date(),
      },
    });

    // Update loan status
    await db.loan.update({
      where: { id: params.id },
      data: { status: "AI_REVIEW_COMPLETE" },
    });

    await db.loanActivity.create({
      data: {
        loanId: params.id,
        userId: session.user.id,
        type: "AI_REVIEW_COMPLETED",
        message: `AI underwriting review completed. Score: ${analysis.overallScore}/100. Status: ${analysis.overallStatus}`,
        metadata: {
          score: analysis.overallScore,
          status: analysis.overallStatus,
          redFlagCount: analysis.redFlags.length,
          conditionCount: analysis.conditions.length,
        } as never,
      },
    });

    return NextResponse.json(aiReview);
  } catch (err) {
    console.error("AI review failed:", err);
    return NextResponse.json(
      { error: "AI review failed. Please try again." },
      { status: 500 }
    );
  }
}

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
    select: { brokerId: true },
  });

  if (!loan) {
    return NextResponse.json({ error: "Loan not found" }, { status: 404 });
  }

  if (session.user.role === "BROKER" && loan.brokerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const review = await db.aIReview.findUnique({
    where: { loanId: params.id },
  });

  if (!review) {
    return NextResponse.json({ error: "No AI review found" }, { status: 404 });
  }

  return NextResponse.json(review);
}
