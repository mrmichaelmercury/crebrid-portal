import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import TermSheetGenerator from "@/components/term-sheet/TermSheetGenerator";

export default async function TermSheetPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true, company: true, nmls: true },
  });

  if (!user) redirect("/login");

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Term Sheet Generator</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Build an instant estimated term sheet to share with your client.
          {!user.company && (
            <span className="ml-1 text-crebrid-600">
              Add your company name in{" "}
              <a href="/settings" className="underline">Settings</a>{" "}
              to brand the term sheet.
            </span>
          )}
        </p>
      </div>

      <TermSheetGenerator broker={user} />
    </div>
  );
}
