"use client";

// Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { resetPasswordSchema } from "@/lib/schemas";
import { OtpInput } from "@/components/OtpInput";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

type Step = "email" | "otp" | "password";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const resetPassword = useAuthStore((s) => s.resetPassword);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | undefined>(undefined);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Req 4.1: Step 1 — Email submission
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);

    // Req 4.2: Validate email is not empty
    if (!email.trim()) {
      setEmailError("Email is required.");
      return;
    }

    // Req 4.1: Show confirmation regardless of email existence, then show OTP
    setSuccessMessage("If this email is registered, a reset link has been sent");
    setStep("otp");
  };

  // Req 4.5: Step 2 — OTP validation
  const handleOtpComplete = (code: string) => {
    setOtpError(undefined);

    if (!/^\d{7}$/.test(code)) {
      setOtpError("Invalid verification code.");
      return;
    }

    setOtp(code);
    setStep("password");
  };

  // Req 4.3, 4.4: Step 3 — New password form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
  });

  const onPasswordSubmit = (data: ResetPasswordFormData) => {
    setServerError(null);
    const result = resetPassword(email, otp, data.password);

    if (!result.success) {
      setServerError(result.error ?? "Password reset failed");
      return;
    }

    // Req 4.4: Redirect to login on success
    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: "#0C2340" }}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Reset Password</CardTitle>
          <CardDescription>
            {step === "email" && "Enter your email to receive a reset code"}
            {step === "otp" && "Enter the 7-digit verification code"}
            {step === "password" && "Create a new password"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step 1: Email input */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4" noValidate>
              <div className="space-y-1">
                <label htmlFor="reset-email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@csu.fullerton.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!emailError}
                />
                {emailError && (
                  <p className="text-sm text-danger">{emailError}</p>
                )}
              </div>
              <Button type="submit" className="w-full">
                Send Reset Code
              </Button>
            </form>
          )}

          {/* Step 2: OTP input */}
          {step === "otp" && (
            <div className="space-y-4">
              {successMessage && (
                <p className="text-sm text-safe text-center">{successMessage}</p>
              )}
              <OtpInput length={7} onComplete={handleOtpComplete} error={otpError} />
              <p className="text-center text-xs text-white/40">
                For demo purposes, any 7-digit number is accepted.
              </p>
            </div>
          )}

          {/* Step 3: New password form */}
          {step === "password" && (
            <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4" noValidate>
              {serverError && (
                <p className="text-sm text-danger text-center">{serverError}</p>
              )}
              <div className="space-y-1">
                <label htmlFor="new-password" className="text-sm font-medium">
                  New Password
                </label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="At least 8 characters with a symbol"
                  {...register("password")}
                  aria-invalid={!!errors.password}
                />
                {errors.password && (
                  <p className="text-sm text-danger">{errors.password.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <label htmlFor="confirm-password" className="text-sm font-medium">
                  Confirm Password
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Re-enter your password"
                  {...register("confirmPassword")}
                  aria-invalid={!!errors.confirmPassword}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-danger">{errors.confirmPassword.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <Link href="/" className="text-primary hover:underline">
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
