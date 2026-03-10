import NewLoanForm from "@/components/loans/NewLoanForm";

export default function NewLoanPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Submit New Loan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Fill in the loan details below. You can upload documents after creating the loan.
        </p>
      </div>
      <NewLoanForm />
    </div>
  );
}
