"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { CrebridLogo } from "@/components/ui/CrebridLogo";
import {
  Menu,
  X,
  LayoutDashboard,
  FileText,
  PlusCircle,
  Settings,
  LogOut,
  Users,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/loans", label: "My Loans", icon: FileText },
  { href: "/loans/new", label: "New Loan", icon: PlusCircle },
  { href: "/term-sheet", label: "Term Sheet", icon: ClipboardList },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function MobileNav({ user }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = user.role === "ADMIN" || user.role === "PROCESSOR";

  return (
    <>
      {/* Top bar */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <CrebridLogo className="w-8 h-8" />
          <span className="font-bold text-gray-900 text-base">Crebrid</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-72 bg-white z-50 flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <CrebridLogo className="w-8 h-8" />
                <span className="font-bold text-gray-900">Crebrid</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">
                {user.name ?? user.email}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
            </div>

            <nav className="flex-1 px-3 py-3 space-y-1">
              {navItems.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium",
                      active
                        ? "bg-crebrid-50 text-crebrid-700"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", active ? "text-crebrid-600" : "text-gray-400")} />
                    {item.label}
                  </Link>
                );
              })}

              {isAdmin && (
                <>
                  <div className="pt-3 pb-1 px-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Admin
                    </p>
                  </div>
                  <Link
                    href="/admin/loans"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <FileText className="w-5 h-5 text-gray-400" />
                    All Loans
                  </Link>
                  <Link
                    href="/admin/users"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Users className="w-5 h-5 text-gray-400" />
                    Users
                  </Link>
                </>
              )}
            </nav>

            <div className="px-3 py-3 border-t border-gray-100">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
