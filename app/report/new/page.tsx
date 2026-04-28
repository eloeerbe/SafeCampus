"use client";

// Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AuthGuard } from "@/components/AuthGuard";
import { StepperForm } from "@/components/StepperForm";
import { useReportsStore } from "@/lib/store/reportsStore";
import { useAuthStore } from "@/lib/store/authStore";

export default function NewReportPage() {
  const router = useRouter();
  const addReport = useReportsStore((s) => s.addReport);
  const currentUser = useAuthStore((s) => s.currentUser);

  const handleSubmit = (data: Parameters<typeof addReport>[0] extends infer T ? T extends object ? {
    title: string;
    description: string;
    category: "Safety" | "Maintenance" | "Accident" | "Lost & Found" | "Other";
    severity: "Low" | "Medium" | "High" | "Critical";
    location: { lat: number; lng: number; areaName: string };
    photos: { id: string; url: string; fileType: "image/jpeg" | "image/png"; uploadedAt: string }[];
    isAnonymous: boolean;
  } : never : never) => {
    if (!currentUser) return;

    addReport({
      ...data,
      authorId: currentUser.id,
    });

    toast.success("Report submitted successfully!");
    router.push("/dashboard");
  };

  return (
    <AuthGuard>
      <div className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">Submit a Report</h1>
        <StepperForm onSubmit={handleSubmit} />
      </div>
    </AuthGuard>
  );
}
