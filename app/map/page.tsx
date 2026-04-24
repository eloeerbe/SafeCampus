"use client";

// UR-007, UR-008, UR-009
// SR-018, SR-019, SR-020, SR-021, SR-022, SR-023, SR-024, SR-025, SR-026, SR-027
import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { HeatMap } from "@/components/HeatMap";
import { SeverityBadge } from "@/components/SeverityBadge";
import { CategoryBadge } from "@/components/CategoryBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { UpvoteButton } from "@/components/UpvoteButton";
import { useReportsStore } from "@/lib/store/reportsStore";
import { useAuthStore } from "@/lib/store/authStore";
import { useUIStore } from "@/lib/store/uiStore";
import { isAnonymousLocationDelayed, formatRelativeTime } from "@/lib/utils";
import type { ReportCategory, Severity, ReportStatus } from "@/lib/types";
import type { DateRangeOption } from "@/lib/store/uiStore";

// ── Constants ────────────────────────────────────────────────────
const CATEGORIES: ReportCategory[] = ["Safety", "Maintenance", "Harassment", "Lost & Found", "Other"];
const SEVERITIES: Severity[] = ["Low", "Medium", "High", "Critical"];
const STATUSES: ReportStatus[] = ["Open", "In Progress", "Resolved"];
const DATE_RANGES: { label: string; value: DateRangeOption }[] = [
  { label: "Last 24h", value: "24h" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "All time", value: "all" },
];

const STATUS_COLORS: Record<ReportStatus, string> = {
  Open: "#3B82F6",
  "In Progress": "#F59E0B",
  Resolved: "#16A34A",
};

const CATEGORY_COLORS: Record<ReportCategory, string> = {
  Safety: "#DC2626",
  Maintenance: "#F97316",
  Harassment: "#7C3AED",
  "Lost & Found": "#0EA5E9",
  Other: "#6B7280",
};

function cutoffDate(range: DateRangeOption): Date | null {
  const now = new Date();
  if (range === "24h") return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (range === "7d") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (range === "30d") return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return null;
}

// ── Pure CSS Bar Chart ───────────────────────────────────────────
function StatusBarChart({ data }: { data: { name: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.name} className="flex items-center gap-2">
          <span className="text-[11px] text-slate-600 w-[72px] text-right shrink-0">{d.name}</span>
          <div className="flex-1 h-5 bg-slate-100 rounded overflow-hidden">
            <div
              className="h-full rounded transition-all duration-300"
              style={{
                width: `${(d.count / max) * 100}%`,
                backgroundColor: STATUS_COLORS[d.name as ReportStatus] ?? "#6B7280",
                minWidth: d.count > 0 ? "18px" : "0",
              }}
            />
          </div>
          <span className="text-[11px] font-semibold text-slate-700 w-6 text-right">{d.count}</span>
        </div>
      ))}
    </div>
  );
}

// ── Pure CSS Donut Chart ─────────────────────────────────────────
function CategoryDonut({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return <p className="text-xs text-slate-400 text-center py-8">No data</p>;

  // Build conic-gradient stops
  let cumulative = 0;
  const stops = data.flatMap((d) => {
    const color = CATEGORY_COLORS[d.name as ReportCategory] ?? "#6B7280";
    const start = cumulative;
    cumulative += (d.value / total) * 100;
    return [`${color} ${start.toFixed(1)}%`, `${color} ${cumulative.toFixed(1)}%`];
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-[140px] h-[140px]">
        <div
          className="w-full h-full rounded-full"
          style={{ background: `conic-gradient(${stops.join(", ")})` }}
        />
        {/* Inner hole for donut effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[80px] h-[80px] rounded-full bg-white flex items-center justify-center">
            <span className="text-lg font-bold text-slate-700">{total}</span>
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: CATEGORY_COLORS[d.name as ReportCategory] ?? "#6B7280" }}
            />
            <span className="text-[10px] text-slate-600">{d.name} ({d.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Multi-select pill toggle ─────────────────────────────────────
function MultiPill<T extends string>({
  label, options, selected, onChange, colorMap,
}: {
  label: string; options: T[]; selected: T[]; onChange: (v: T[]) => void; colorMap?: Record<string, string>;
}) {
  const toggle = (v: T) =>
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{label}</span>
      {options.map((opt) => {
        const active = selected.includes(opt);
        const bg = active && colorMap ? colorMap[opt] : undefined;
        return (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className="px-2.5 py-1 rounded-full text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7900]"
            style={
              active
                ? { background: bg ?? "#00244D", color: "white", borderColor: bg ?? "#00244D" }
                : { background: "white", color: "#374151", borderColor: "#D1D5DB" }
            }
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────
export default function MapPage() {
  const router = useRouter();
  const reports = useReportsStore((s) => s.reports);
  const upvoteReport = useReportsStore((s) => s.upvoteReport);
  const currentUser = useAuthStore((s) => s.currentUser);
  const rawFilters = useUIStore((s) => s.mapFilters);
  const setMapFilters = useUIStore((s) => s.setMapFilters);
  const resetMapFilters = useUIStore((s) => s.resetMapFilters);

  const mapFilters = {
    categories: Array.isArray(rawFilters?.categories) ? rawFilters.categories : [],
    severities: Array.isArray(rawFilters?.severities) ? rawFilters.severities : [],
    statuses: Array.isArray(rawFilters?.statuses) ? rawFilters.statuses : [],
    dateRange: rawFilters?.dateRange ?? "all",
  };

  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null);
  const userId = currentUser?.id ?? "";

  // ── Filtered reports (SR-020, SR-027) ──
  const filtered = useMemo(() => {
    const cutoff = cutoffDate(mapFilters.dateRange);
    return reports.filter((r) => {
      if (mapFilters.categories.length > 0 && !mapFilters.categories.includes(r.category)) return false;
      if (mapFilters.severities.length > 0 && !mapFilters.severities.includes(r.severity)) return false;
      if (mapFilters.statuses.length > 0 && !mapFilters.statuses.includes(r.status)) return false;
      if (cutoff && new Date(r.submittedAt) < cutoff) return false;
      return true;
    });
  }, [reports, mapFilters]);

  // SR-018: student-facing map hides anonymous reports < 5 min old
  const mapReports = useMemo(
    () => filtered.filter((r) => !isAnonymousLocationDelayed(r.isAnonymous, r.submittedAt)),
    [filtered]
  );

  const statusData = useMemo(
    () => STATUSES.map((s) => ({ name: s, count: filtered.filter((r) => r.status === s).length })),
    [filtered]
  );

  const categoryData = useMemo(
    () => CATEGORIES.map((c) => ({ name: c, value: filtered.filter((r) => r.category === c).length })).filter((d) => d.value > 0),
    [filtered]
  );

  const handleUpvote = useCallback(
    (reportId: string) => { if (userId) upvoteReport(reportId, userId); },
    [userId, upvoteReport]
  );

  const handleFeedCardClick = useCallback((lat: number, lng: number) => {
    setFlyTarget({ lat, lng });
  }, []);

  const hasFilters =
    mapFilters.categories.length > 0 || mapFilters.severities.length > 0 ||
    mapFilters.statuses.length > 0 || mapFilters.dateRange !== "all";

  return (
    <AuthGuard>
      <div className="flex flex-col h-[calc(100vh-56px)] overflow-hidden bg-slate-50">

        {/* ── Filter Toolbar ── */}
        <div className="bg-white border-b border-slate-200 px-4 py-3 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <MultiPill label="Category" options={CATEGORIES} selected={mapFilters.categories}
              onChange={(v) => setMapFilters({ categories: v })} colorMap={CATEGORY_COLORS} />
            <MultiPill label="Severity" options={SEVERITIES} selected={mapFilters.severities}
              onChange={(v) => setMapFilters({ severities: v })} />
            <MultiPill label="Status" options={STATUSES} selected={mapFilters.statuses}
              onChange={(v) => setMapFilters({ statuses: v })} colorMap={STATUS_COLORS} />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Date</span>
              {DATE_RANGES.map(({ label, value }) => (
                <button key={value} onClick={() => setMapFilters({ dateRange: value })}
                  className="px-2.5 py-1 rounded-full text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7900]"
                  style={mapFilters.dateRange === value
                    ? { background: "#00244D", color: "white", borderColor: "#00244D" }
                    : { background: "white", color: "#374151", borderColor: "#D1D5DB" }}>
                  {label}
                </button>
              ))}
            </div>
            {hasFilters && (
              <button onClick={resetMapFilters} className="text-xs text-slate-400 hover:text-slate-700 underline ml-auto">
                Clear filters
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-800">{filtered.length}</span> of{" "}
            <span className="font-semibold text-slate-800">{reports.length}</span> reports
          </p>
        </div>

        {/* ── Main content: map + charts ── */}
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row min-h-0">
          <div className="flex-1 min-h-[300px] md:min-h-0 relative">
            <HeatMap reports={mapReports} currentUserId={userId} onUpvote={handleUpvote}
              flyTarget={flyTarget} onFlyTo={(lat, lng) => setFlyTarget({ lat, lng })} />
          </div>

          {/* Right column: charts */}
          <div className="w-full md:w-72 lg:w-80 flex-shrink-0 border-l border-slate-200 bg-white overflow-y-auto flex flex-col">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Reports by Status</h3>
              <StatusBarChart data={statusData} />
            </div>
            <div className="p-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Reports by Category</h3>
              <CategoryDonut data={categoryData} />
            </div>
          </div>
        </div>

        {/* ── Public Feed (SR-026) ── */}
        <div className="border-t border-slate-200 bg-white" style={{ height: "280px" }}>
          <div className="h-full flex flex-col">
            <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">Public Feed</h2>
              <span className="text-xs text-slate-400">{filtered.length} reports</span>
            </div>
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
              <div className="flex gap-3 px-4 py-3 h-full" style={{ minWidth: "max-content" }}>
                {filtered.length === 0 ? (
                  <div className="flex items-center justify-center w-full text-sm text-slate-400">
                    No reports match the current filters.
                  </div>
                ) : (
                  filtered.slice().sort((a, b) => b.upvotedBy.length - a.upvotedBy.length).map((report) => (
                    <div key={report.id}
                      className="flex-shrink-0 w-64 bg-white border border-slate-200 rounded-lg p-3 flex flex-col gap-2 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleFeedCardClick(report.location.lat, report.location.lng)}
                      role="button" tabIndex={0}
                      onKeyDown={(e) => { if (e.key === "Enter") handleFeedCardClick(report.location.lat, report.location.lng); }}
                      aria-label={`View ${report.title} on map`}>
                      {report.photos[0] && (
                        <img src={report.photos[0].url} alt="" className="w-full h-20 object-cover rounded-md" />
                      )}
                      <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug">{report.title}</p>
                      <div className="flex flex-wrap gap-1">
                        <CategoryBadge category={report.category} />
                        <SeverityBadge severity={report.severity} />
                        <StatusBadge status={report.status} />
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-[10px] text-slate-400">
                          {report.isAnonymous ? "Anonymous" : "User"} · {formatRelativeTime(report.submittedAt)}
                        </span>
                        <div className="flex items-center gap-2">
                          <UpvoteButton reportId={report.id} authorId={report.authorId}
                            currentUserId={userId} upvotedBy={report.upvotedBy} onUpvote={handleUpvote} />
                          <button onClick={(e) => { e.stopPropagation(); router.push(`/report/${report.id}`); }}
                            className="text-[10px] text-primary underline hover:no-underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF7900] rounded"
                            aria-label={`View details for ${report.title}`}>
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </AuthGuard>
  );
}
