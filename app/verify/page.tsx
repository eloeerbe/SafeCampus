"use client";

// Requirements: 3.1, 3.2, 3.3
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { OtpInput } from "@/components/OtpInput";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function VerifyPage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.currentUser);
  const verifyOTP = useAuthStore((s) => s.verifyOTP);
  const [error, setError] = useState<string | undefined>(undefined);

  // If no currentUser, redirect to login
  useEffect(() => {
    if (!currentUser) {
      router.push("/");
    }
  }, [currentUser, router]);

  const handleComplete = (code: string) => {
    setError(undefined);
    const success = verifyOTP(code);

    if (success) {
      // Req 3.2: Mark user as verified and redirect to dashboard
      router.push("/dashboard");
    } else {
      // Req 3.3: Display error for invalid OTP
      setError("Invalid verification code.");
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Verify Your Account</CardTitle>
          <CardDescription>
            Enter the 7-digit verification code to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Req 3.1: 7-digit OTP input */}
          <OtpInput length={7} onComplete={handleComplete} error={error} />
          <p className="text-center text-xs text-gray-400">
            For demo purposes, any 7-digit number is accepted.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
