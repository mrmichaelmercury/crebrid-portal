"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Building2,
  LayoutDashboard,
  FileText,
  PlusCircle,
  Settings,
  LogOut,
  Users,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
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
];

const adminNavItems = [
  { href: "/admin/loans", label: "All Loans", icon: FileText },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin =
    user.role === "ADMIN" || user.role === "PROCESSOR";

  return (
    <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex-col bg-white border-r border-gray-200 z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-crebrid-600">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm leading-none">Crebrid</p>
          <p className="text-xs text-gray-500 mt-0.5">Broker Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-crebrid-50 text-crebrid-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  active ? "text-crebrid-600" : "text-gray-400"
                )}
              />
              {item.label}
              {item.href === "/loans/new" && (
                <span className="ml-auto">
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                </span>
              )}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Admin
              </p>
            </div>
            {adminNavItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-crebrid-50 text-crebrid-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0",
                      active ? "text-crebrid-600" : "text-gray-400"
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User + Actions */}
      <div className="px-3 py-3 border-t border-gray-100 space-y-1">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-400" />
          Settings
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="w-5 h-5 text-gray-400" />
          Sign out
        </button>

        <div className="px-3 py-2 mt-1">
          <p className="text-sm font-medium text-gray-800 truncate">
            {user.name ?? user.email}
          </p>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
          {user.role && (
            <span className="inline-block mt-1 text-xs bg-crebrid-50 text-crebrid-700 px-2 py-0.5 rounded-full font-medium capitalize">
              {user.role.toLowerCase()}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
