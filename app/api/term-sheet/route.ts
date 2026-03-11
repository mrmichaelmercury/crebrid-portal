import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { calculateTermSheet } from "@/lib/rates";
import type { ProjectType, CreditTier, ExperienceTier } from "@/lib/rates";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    projectType: ProjectType;
    asIsValue: number;
    arv: number;
    creditTier: CreditTier;
    experience: ExperienceTier;
    cashOut: boolean;
    brokerFee: number;
    thirdPartyCosts: number;
    state: string;
  };

  const { projectType, asIsValue, arv, creditTier, experience, cashOut, brokerFee, thirdPartyCosts, state } = body;

  if (!projectType || !asIsValue || !arv || !creditTier || !experience || !state) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (asIsValue <= 0 || arv <= 0) {
    return NextResponse.json({ error: "Property values must be greater than zero" }, { status: 400 });
  }

  const result = calculateTermSheet({
    projectType,
    asIsValue,
    arv,
    creditTier,
    experience,
    cashOut: !!cashOut,
    brokerFee: brokerFee || 0,
    thirdPartyCosts: thirdPartyCosts || 0,
    state,
  });

  return NextResponse.json(result);
}
