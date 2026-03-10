import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  DollarSign,
  FileText,
  Clock,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { LOAN_TYPE_LABELS, LOAN_STATUS_LABELS, LOAN_STATUS_COLORS } from "@/lib/types";
import type { LoanType, LoanStatus } from "@/lib/types";

export default async function DashboardPage() {
  const session = await auth();
  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "PROCESSOR";
  const where = isAdmin ? {} : { brokerId: session?.user?.id };

  const [totalLoans, pendingDocsLoans, inReviewLoans, approvedLoans, recentLoans, pipelineValue] =
    await Promise.all([
      db.loan.count({ where }),
      db.loan.count({ where: { ...where, status: "DOCUMENTS_PENDING" } }),
      db.loan.count({
        where: {
          ...where,
          status: { in: ["UNDER_REVIEW", "AI_REVIEW_COMPLETE", "PROCESSOR_REVIEW"] },
        },
      }),
      db.loan.count({
        where: {
          ...where,
          status: { in: ["APPROVED", "CONDITIONALLY_APPROVED"] },
        },
      }),
      db.loan.findMany({
        where,
        include: {
          broker: { select: { name: true, email: true } },
          _count: { select: { documents: true } },
          aiReview: { select: { overallStatus: true, overallScore: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 8,
      }),
      db.loan.aggregate({
        where: {
          ...where,
          status: { notIn: ["DENIED", "CLOSED", "WITHDRAWN"] },
          requestedLoanAmt: { not: null },
        },
        _sum: { requestedLoanAmt: true },
      }),
    ]);

  const stats = [
    {
      label: "Active Pipeline",
      value: formatCurrency(pipelineValue._sum.requestedLoanAmt ?? 0),
      icon: DollarSign,
      color: "bg-crebrid-50 text-crebrid-600",
      border: "border-crebrid-100",
    },
    {
      label: "Total Loans",
      value: totalLoans.toString(),
      icon: FileText,
      color: "bg-blue-50 text-blue-600",
      border: "border-blue-100",
    },
    {
      label: "Pending Docs",
      value: pendingDocsLoans.toString(),
      icon: Clock,
      color: "bg-yellow-50 text-yellow-600",
      border: "border-yellow-100",
    },
    {
      label: "Approved",
      value: approvedLoans.toString(),
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600",
      border: "border-green-100",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Here&apos;s what&apos;s happening with your pipeline
          </p>
        </div>
        <Link
          href="/loans/new"
          className="hidden sm:flex items-center gap-2 bg-crebrid-600 hover:bg-crebrid-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          New Loan
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-white rounded-xl border ${stat.border} p-4 shadow-sm`}
          >
            <div className={`inline-flex p-2 rounded-lg ${stat.color} mb-3`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* In Review Alert */}
      {inReviewLoans > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-purple-900">
              {inReviewLoans} loan{inReviewLoans > 1 ? "s" : ""} currently under review
            </p>
            <p className="text-xs text-purple-600 mt-0.5">
              Check status updates and any conditions or outstanding items
            </p>
          </div>
          <Link
            href="/loans?status=AI_REVIEW_COMPLETE"
            className="text-xs font-semibold text-purple-700 hover:underline whitespace-nowrap"
          >
            View all
          </Link>
        </div>
      )}

      {/* Recent Loans */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Loans</h2>
          <Link
            href="/loans"
            className="text-sm text-crebrid-600 hover:text-crebrid-700 font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentLoans.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">No loans yet</p>
            <p className="text-gray-400 text-xs mt-1">
              Submit your first loan to get started
            </p>
            <Link
              href="/loans/new"
              className="inline-flex items-center gap-2 mt-4 bg-crebrid-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-crebrid-700 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              New Loan
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentLoans.map((loan) => (
              <Link
                key={loan.id}
                href={`/loans/${loan.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900">
                      {loan.loanNumber}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${LOAN_STATUS_COLORS[loan.status as LoanStatus]}`}
                    >
                      {LOAN_STATUS_LABELS[loan.status as LoanStatus]}
                    </span>
                    {loan.aiReview?.overallStatus === "FAIL" && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">
                        AI: Flagged
                      </span>
                    )}
                    {loan.aiReview?.overallStatus === "PASS" && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                        AI: Pass
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-500">
                      {LOAN_TYPE_LABELS[loan.loanType as LoanType]}
                    </span>
                    {loan.propertyAddress && (
                      <span className="text-xs text-gray-400 truncate max-w-[200px]">
                        {loan.propertyAddress}, {loan.propertyCity}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {loan._count.documents} doc{loan._count.documents !== 1 ? "s" : ""}
                    </span>
                    <span className="text-xs text-gray-400 hidden sm:block">
                      {formatDate(loan.updatedAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {loan.requestedLoanAmt && (
                    <span className="text-sm font-semibold text-gray-700 hidden sm:block">
                      {formatCurrency(loan.requestedLoanAmt)}
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Mobile New Loan Button */}
      <div className="sm:hidden">
        <Link
          href="/loans/new"
          className="flex items-center justify-center gap-2 w-full bg-crebrid-600 hover:bg-crebrid-700 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Submit New Loan
        </Link>
      </div>
    </div>
  );
}
