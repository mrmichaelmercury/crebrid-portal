import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import LoanDetailClient from "@/components/loans/LoanDetailClient";

export default async function LoanDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const loan = await db.loan.findUnique({
    where: { id: params.id },
    include: {
      broker: {
        select: { name: true, email: true, phone: true, company: true, nmls: true },
      },
      documents: { orderBy: { createdAt: "asc" } },
      aiReview: true,
      activities: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!loan) notFound();

  if (session.user.role === "BROKER" && loan.brokerId !== session.user.id) {
    redirect("/dashboard");
  }

  return (
    <LoanDetailClient
      loan={JSON.parse(JSON.stringify(loan)) as typeof loan}
      userRole={session.user.role ?? "BROKER"}
    />
  );
}
