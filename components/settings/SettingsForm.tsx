"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  company: string | null;
  nmls: string | null;
  role: string;
}

export default function SettingsForm({ user }: { user: UserData }) {
  const [form, setForm] = useState({
    name: user.name ?? "",
    phone: user.phone ?? "",
    company: user.company ?? "",
    nmls: user.nmls ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to save");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Profile */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Profile Information</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="input-field opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="(214) 555-0100"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company</label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
                placeholder="Your brokerage name"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">NMLS ID</label>
              <input
                type="text"
                value={form.nmls}
                onChange={(e) => set("nmls", e.target.value)}
                placeholder="12345678"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
              <input
                type="text"
                value={user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                disabled
                className="input-field opacity-60"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-crebrid-600 hover:bg-crebrid-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : saved ? (
              <><Check className="w-4 h-4" /> Saved!</>
            ) : (
              "Save Changes"
            )}
          </button>
        </form>
      </div>

      {/* Crebrid Info */}
      <div className="bg-crebrid-50 rounded-xl border border-crebrid-100 p-5">
        <h2 className="text-sm font-semibold text-crebrid-900 mb-1">About Crebrid</h2>
        <p className="text-xs text-crebrid-700">
          Crebrid is a Dallas, TX-based hard money lender offering Fix &amp; Flip, Bridge, DSCR, and
          Construction loans. Questions? Contact{" "}
          <a href="mailto:support@crebrid.com" className="underline">
            support@crebrid.com
          </a>
        </p>
      </div>
    </div>
  );
}
