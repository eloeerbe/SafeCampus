"use client";

// Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.4, 20.1, 20.2, 20.3
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { loginSchema } from "@/lib/schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/BrandMark";
import Link from "next/link";
import Image from "next/image";

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = (data: LoginFormData) => {
    setServerError(null);
    const result = login(data.email, data.password);

    if (!result.success) {
      // Req 2.3, 2.5, 2.6: Display error for wrong credentials or lockout
      setServerError(result.error ?? "Invalid email or password");
      return;
    }

    // Req 2.1, 2.2, 3.4: Redirect based on role or MFA
    if (result.redirect) {
      router.push(result.redirect);
    }
  };

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4 py-12 overflow-hidden"
      style={{ background: "#0C2340" }}
    >
      {/* ── Dot-grid background ─────────────────────────────────────────── */}
      <style>{`
        .dot-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }
        .mesh-glow-1 {
          position: absolute;
          top: -120px;
          left: -120px;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(232,93,38,0.18) 0%, transparent 65%);
          pointer-events: none;
        }
        .mesh-glow-2 {
          position: absolute;
          bottom: -100px;
          right: -100px;
          width: 480px;
          height: 480px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 65%);
          pointer-events: none;
        }
        .login-input {
          border-radius: 8px !important;
          background: rgba(255,255,255,0.06) !important;
          border: 1px solid rgba(255,255,255,0.12) !important;
          color: #fff !important;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .login-input::placeholder {
          color: rgba(255,255,255,0.3) !important;
        }
        .login-input:focus {
          border-color: rgba(232,93,38,0.6) !important;
          box-shadow: 0 0 0 3px rgba(232,93,38,0.15) !important;
          outline: none !important;
        }
        .login-input[aria-invalid="true"] {
          border-color: rgba(239,68,68,0.6) !important;
        }
      `}</style>

      <div className="dot-grid" aria-hidden="true" />
      <div className="mesh-glow-1" aria-hidden="true" />
      <div className="mesh-glow-2" aria-hidden="true" />

      {/* ── Card ────────────────────────────────────────────────────────── */}
      <div
        className="relative z-10 w-full max-w-[420px] rounded-2xl p-8 flex flex-col gap-6"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
        }}
      >
        {/* ── Logo lockup ─────────────────────────────────────────────── */}
        <div className="flex justify-center">
          <BrandMark href="/" />
        </div>

        {/* ── Heading ─────────────────────────────────────────────────── */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold" style={{ color: "#fff" }}>
            Welcome back
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            Sign in to your campus safety account
          </p>
        </div>

        {/* ── SSO button ──────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => {
            // SSO flow placeholder — would redirect to CSUF IdP in production
          }}
          className="w-full flex items-center justify-center gap-3 rounded-lg py-3 px-4 font-semibold text-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D26] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C2340]"
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "#fff",
            borderRadius: "8px",
          }}
          aria-label="Continue with CSUF Portal single sign-on"
        >
          {/* CSUF portal icon — two-tone bar chart mark */}
          <span aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <span style={{ display: "inline-block", width: 5, height: 14, background: "#E85D26", borderRadius: 2 }} />
            <span style={{ display: "inline-block", width: 5, height: 10, background: "#fff", borderRadius: 2, opacity: 0.7 }} />
            <span style={{ display: "inline-block", width: 5, height: 18, background: "#E85D26", borderRadius: 2 }} />
          </span>
          Continue with CSUF Portal (SSO)
        </button>

        {/* ── Divider ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3" role="separator" aria-label="or sign in with email">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
          <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
            or sign in with email
          </span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
        </div>

        {/* ── Email / password form ────────────────────────────────────── */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          {/* Req 2.5, 2.6: Account lockout / credential error */}
          {serverError && (
            <p
              className="text-sm text-center rounded-lg px-3 py-2"
              style={{ background: "rgba(239,68,68,0.12)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.25)" }}
              role="alert"
            >
              {serverError}
            </p>
          )}

          {/* Email — Req 2.4, 20.1 */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@csu.fullerton.edu"
              className="login-input"
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-xs" style={{ color: "#fca5a5" }}>{errors.email.message}</p>
            )}
          </div>

          {/* Password — Req 2.4, 20.1 */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="login-input"
              {...register("password")}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-xs" style={{ color: "#fca5a5" }}>{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full font-semibold mt-1 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#E85D26] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C2340]"
            style={{ background: "#0C2340", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        {/* ── Footer links ────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-2 text-sm">
          <Link
            href="/forgot-password"
            className="font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D26] rounded"
            style={{ color: "#E85D26" }}
          >
            Forgot password?
          </Link>
          <p style={{ color: "rgba(255,255,255,0.55)" }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D26] rounded"
              style={{ color: "#E85D26" }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
