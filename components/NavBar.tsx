"use client";

// UR-001, UR-002: Navigation bar with role-based visibility
// SR-018: Only show nav when user is authenticated
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { useNotificationStore } from "@/lib/store/notificationStore";
import { NotificationBell } from "@/components/NotificationBell";
import { cn } from "@/lib/cn";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/verify", "/forgot-password"];

export function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const [mobileOpen, setMobileOpen] = useState(false);

  // SR-018: Don't render nav on public routes or when not authenticated
  if (!currentUser || PUBLIC_PATHS.includes(pathname)) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleBellClick = () => {
    router.push("/notifications");
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/map", label: "Map" },
    { href: "/profile", label: "Profile" },
  ];

  // Add admin link for admin users
  if (currentUser.role === "admin") {
    navLinks.unshift({ href: "/admin", label: "Admin" });
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* App name */}
        <Link href={currentUser.role === "admin" ? "/admin" : "/dashboard"} className="text-lg font-bold text-primary">
          SafeCampus
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side: bell + logout */}
        <div className="flex items-center gap-2">
          <NotificationBell
            unreadCount={unreadCount(currentUser.id)}
            onClick={handleBellClick}
          />
          <button
            onClick={handleLogout}
            className="hidden rounded-md p-2 text-gray-600 hover:bg-gray-100 transition-colors sm:block"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100 sm:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-white px-4 py-2 sm:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              )}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      )}
    </nav>
  );
}
