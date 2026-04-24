"use client";

// Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { HeatMap } from "@/components/HeatMap";
import { Select } from "@/components/ui/select";
import { useReportsStore } from "@/lib/store/reportsStore";
import { useUIStore } from "@/lib/store/uiStore";
import type { ReportCategory, Severity } from "@/lib/types";

const CATEGORIES: ReportCategory[] = ["Safety", "Maintenance", "Harassment", "Lost & Found", "Other"];
const SEVERITIES: Severity[] = ["Low", "Medium", "High", "Critical"];

export default function MapPage() {
  const router = useRouter();
  const reports = useReportsStore((s) => s.reports);
  const mapFilters = useUIStore((s) => s.mapFilters);
  const setMapFilters = useUIStore((s) => s.setMapFilters);

  const handleReportClick = (reportId: string) => {
    router.push(`/report/${reportId}`);
  };

  return (
    <AuthGuard>
      <div className="flex h-[calc(100vh-64px)] flex-col">
        {/* Filters */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Select
            value={mapFilters.category ?? ""}
            onChange={(e) =>
              setMapFilters({ category: e.target.value ? (e.target.value as ReportCategory) : undefined })
            }
            className="w-40"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
          <Select
            value={mapFilters.severity ?? ""}
            onChange={(e) =>
              setMapFilters({ severity: e.target.value ? (e.target.value as Severity) : undefined })
            }
            className="w-36"
          >
            <option value="">All Severities</option>
            {SEVERITIES.map((sev) => (
              <option key={sev} value={sev}>
                {sev}
              </option>
            ))}
          </Select>
        </div>

        {/* Map */}
        <div className="flex-1">
          <HeatMap
            reports={reports}
            filters={mapFilters}
            onReportClick={handleReportClick}
          />
        </div>
      </div>
    </AuthGuard>
  );
}
