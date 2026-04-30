"use client";

// UR-001, UR-002: Navigation bar with role-based visibility
// SR-018: Only show nav when user is authenticated
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { useNotificationStore } from "@/lib/store/notificationStore";
import { useTranslation } from "@/hooks/useTranslation";
import { NotificationBell } from "@/components/NotificationBell";
import { BrandMark } from "@/components/BrandMark";
import { cn } from "@/lib/cn";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/verify", "/forgot-password"];

export function NavBar() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const [mobileOpen, setMobileOpen] = useState(false);

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
    { href: "/dashboard", label: t.nav.dashboard },
    { href: "/map", label: t.nav.map },
    { href: "/profile", label: t.nav.profile },
  ];

  if (currentUser.role === "admin") {
    navLinks.unshift({ href: "/admin", label: t.nav.admin });
  }

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        background: "rgba(12,35,64,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <BrandMark href={currentUser.role === "admin" ? "/admin" : "/dashboard"} variant="dark" />

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-white/10 text-white"
                  : "text-white/55 hover:bg-white/5 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell
            unreadCount={unreadCount(currentUser.id)}
            onClick={handleBellClick}
          />
          <button
            onClick={handleLogout}
            className="hidden rounded-md p-2 transition-colors hover:bg-white/10 sm:block"
            style={{ color: "rgba(255,255,255,0.6)" }}
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-md p-2 transition-colors hover:bg-white/10 sm:hidden"
            style={{ color: "rgba(255,255,255,0.6)" }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="border-t px-4 py-2 sm:hidden"
          style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(12,35,64,0.98)" }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-white/10 text-white"
                  : "text-white/55 hover:bg-white/5 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            <LogOut className="h-4 w-4" /> {t.nav.logout}
          </button>
        </div>
      )}
    </nav>
  );
}
