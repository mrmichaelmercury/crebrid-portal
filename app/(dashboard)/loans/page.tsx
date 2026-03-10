import { auth } from "@/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  PlusCircle,
  ArrowRight,
  Search,
  FileText,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  LOAN_TYPE_LABELS,
  LOAN_STATUS_LABELS,
  LOAN_STATUS_COLORS,
} from "@/lib/types";
import type { LoanType, LoanStatus } from "@/lib/types";

const STATUS_FILTERS = [
  { value: "", label: "All Loans" },
  { value: "DRAFT", label: "Draft" },
  { value: "DOCUMENTS_PENDING", label: "Docs Pending" },
  { value: "UNDER_REVIEW,AI_REVIEW_COMPLETE,PROCESSOR_REVIEW", label: "In Review" },
  { value: "APPROVED,CONDITIONALLY_APPROVED", label: "Approved" },
  { value: "DENIED", label: "Denied" },
];

export default async function LoansPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string };
}) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "PROCESSOR";

  const statusFilter = searchParams.status ?? "";
  const page = parseInt(searchParams.page ?? "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const statusCondition = statusFilter
    ? { status: { in: statusFilter.split(",") as never[] } }
    : {};

  const where = isAdmin
    ? statusCondition
    : { brokerId: session?.user?.id, ...statusCondition };

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

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loans</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total} total loan{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/loans/new"
          className="flex items-center gap-2 bg-crebrid-600 hover:bg-crebrid-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">New Loan</span>
        </Link>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={filter.value ? `/loans?status=${filter.value}` : "/loans"}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === filter.value
                ? "bg-crebrid-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {/* Table / List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loans.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">No loans found</p>
            <p className="text-xs text-gray-400 mt-1">
              {statusFilter ? "Try clearing the filter" : "Submit your first loan to get started"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Loan
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Docs
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      AI
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Updated
                    </th>
                    <th />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{loan.loanNumber}</p>
                        <p className="text-xs text-gray-400">{LOAN_TYPE_LABELS[loan.loanType as LoanType]}</p>
                        {isAdmin && (
                          <p className="text-xs text-gray-400">{loan.broker.name ?? loan.broker.email}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-700 text-sm truncate max-w-[180px]">
                          {loan.propertyAddress ?? "—"}
                        </p>
                        {loan.propertyCity && (
                          <p className="text-xs text-gray-400">
                            {loan.propertyCity}, {loan.propertyState}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {formatCurrency(loan.requestedLoanAmt)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${LOAN_STATUS_COLORS[loan.status as LoanStatus]}`}
                        >
                          {LOAN_STATUS_LABELS[loan.status as LoanStatus]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-sm">
                        {loan._count.documents}
                      </td>
                      <td className="px-4 py-3">
                        {loan.aiReview ? (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              loan.aiReview.overallStatus === "PASS"
                                ? "bg-green-100 text-green-700"
                                : loan.aiReview.overallStatus === "CONDITIONAL"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                            }`}
                          >
                            {loan.aiReview.overallStatus} · {loan.aiReview.overallScore}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {formatDate(loan.updatedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/loans/${loan.id}`}
                          className="flex items-center gap-1 text-crebrid-600 hover:text-crebrid-700 text-xs font-medium"
                        >
                          View <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List */}
            <div className="md:hidden divide-y divide-gray-50">
              {loans.map((loan) => (
                <Link
                  key={loan.id}
                  href={`/loans/${loan.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {loan.loanNumber}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LOAN_STATUS_COLORS[loan.status as LoanStatus]}`}>
                        {LOAN_STATUS_LABELS[loan.status as LoanStatus]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {LOAN_TYPE_LABELS[loan.loanType as LoanType]} ·{" "}
                      {loan.propertyCity ?? "No address"} ·{" "}
                      {loan._count.documents} docs
                    </p>
                    {loan.requestedLoanAmt && (
                      <p className="text-sm font-semibold text-gray-700 mt-0.5">
                        {formatCurrency(loan.requestedLoanAmt)}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Showing {skip + 1}–{Math.min(skip + limit, total)} of {total}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/loans?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ""}`}
                className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/loans?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ""}`}
                className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
