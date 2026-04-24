"use client";

// Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { AdminReportTable } from "@/components/AdminReportTable";
import { useReportsStore } from "@/lib/store/reportsStore";

export default function AdminDashboardPage() {
  const router = useRouter();
  const reports = useReportsStore((s) => s.reports);

  const handleReportClick = (reportId: string) => {
    router.push(`/admin/report/${reportId}`);
  };

  return (
    <AuthGuard requiredRole="admin">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>
        <AdminReportTable reports={reports} onReportClick={handleReportClick} />
      </div>
    </AuthGuard>
  );
}
