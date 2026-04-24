"use client";

// Requirements: 18.2, 18.3, 18.4
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: "student" | "admin";
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const router = useRouter();

  useEffect(() => {
    // SR-018: Redirect unauthenticated users to login (UR-002)
    if (!currentUser) {
      router.replace("/");
      return;
    }

    // SR-018: If requiredRole is "admin" and user is a student, redirect to /dashboard (UR-010)
    if (requiredRole === "admin" && currentUser.role === "student") {
      router.replace("/dashboard");
      return;
    }

    // Admins can access student routes (Req 18.4) — no redirect needed
  }, [currentUser, requiredRole, router]);

  // Don't render children if not authenticated
  if (!currentUser) {
    return null;
  }

  // Don't render admin content for students
  if (requiredRole === "admin" && currentUser.role === "student") {
    return null;
  }

  return <>{children}</>;
}
