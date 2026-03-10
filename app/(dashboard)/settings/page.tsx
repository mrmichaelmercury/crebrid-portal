import { auth } from "@/auth";
import { db } from "@/lib/db";
import SettingsForm from "@/components/settings/SettingsForm";

export default async function SettingsPage() {
  const session = await auth();
  const user = await db.user.findUnique({
    where: { id: session?.user?.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      company: true,
      nmls: true,
      role: true,
    },
  });

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your profile and account settings</p>
      </div>
      <SettingsForm user={user} />
    </div>
  );
}
