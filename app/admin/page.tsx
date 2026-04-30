"use client";

// Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { AdminReportTable } from "@/components/AdminReportTable";
import { useReportsStore } from "@/lib/store/reportsStore";
import { useMemo } from "react";
import type { Report } from "@/lib/types";

// ── KPI card data derived from reports ────────────────────────────────────
function useKpis(reports: Report[]) {
  return useMemo(() => {
    const total = reports.length;
    const open = reports.filter((r) => r.status === "Open").length;
    const inProgress = reports.filter((r) => r.status === "In Progress").length;
    const resolved = reports.filter((r) => r.status === "Resolved").length;
    const critical = reports.filter((r) => r.severity === "Critical").length;

    return [
      {
        label: "Total open",
        value: open,
        bar: { pct: total > 0 ? Math.round((open / total) * 100) : 0, color: "#3b82f6" },
        trend: `${total > 0 ? Math.round((open / total) * 100) : 0}% of all reports`,
        trendColor: "#3b82f6",
      },
      {
        label: "In progress",
        value: inProgress,
        bar: { pct: total > 0 ? Math.round((inProgress / total) * 100) : 0, color: "#eab308" },
        trend: "Needs attention",
        trendColor: "#eab308",
      },
      {
        label: "Resolved",
        value: resolved,
        bar: { pct: total > 0 ? Math.round((resolved / total) * 100) : 0, color: "#22c55e" },
        trend: `${total > 0 ? Math.round((resolved / total) * 100) : 0}% resolution rate`,
        trendColor: "#22c55e",
      },
      {
        label: "Critical priority",
        value: critical,
        bar: { pct: total > 0 ? Math.round((critical / total) * 100) : 0, color: "#E24B4A" },
        trend: "Immediate action needed",
        trendColor: "#E24B4A",
      },
    ];
  }, [reports]);
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const reports = useReportsStore((s) => s.reports);
  const kpis = useKpis(reports);

  const handleReportClick = (reportId: string) => {
    router.push(`/admin/report/${reportId}`);
  };

  return (
    <AuthGuard requiredRole="admin">
      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Admin dashboard</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--foreground)", opacity: 0.5 }}>
              {reports.length} total reports · Last updated just now
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5"
              style={{ borderColor: "rgba(255,255,255,0.15)" }}
              onClick={() => {/* CSV export placeholder */}}
            >
              Export CSV
            </button>
            <button
              className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: "#E85D26" }}
              onClick={() => router.push("/report/new")}
            >
              + New report
            </button>
          </div>
        </div>

        {/* ── KPI cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl p-4 flex flex-col gap-3"
              style={{ background: "var(--color-background-secondary)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span className="text-xs font-medium" style={{ color: "var(--foreground)", opacity: 0.5 }}>
                {kpi.label}
              </span>
              <span
                className="text-4xl font-extrabold leading-none"
                style={{ color: kpi.label === "Critical priority" ? kpi.trendColor : "var(--foreground)" }}
              >
                {kpi.value}
              </span>
              {/* Progress bar */}
              <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${kpi.bar.pct}%`, background: kpi.bar.color }}
                />
              </div>
              <span className="text-xs font-medium" style={{ color: kpi.trendColor }}>
                {kpi.trend}
              </span>
            </div>
          ))}
        </div>

        {/* ── Table ── */}
        <AdminReportTable reports={reports} onReportClick={handleReportClick} />
      </div>
    </AuthGuard>
  );
}
