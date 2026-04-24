"use client";

// Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
import dynamic from "next/dynamic";
import type { Report, ReportCategory, Severity } from "@/lib/types";

const HeatMapInner = dynamic(() => import("./HeatMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-100">
      <p className="text-sm text-gray-400 animate-pulse">Loading map…</p>
    </div>
  ),
});

interface HeatMapProps {
  reports: Report[];
  filters: { category?: ReportCategory; severity?: Severity };
  onReportClick: (reportId: string) => void;
}

export function HeatMap({ reports, filters, onReportClick }: HeatMapProps) {
  return <HeatMapInner reports={reports} filters={filters} onReportClick={onReportClick} />;
}
