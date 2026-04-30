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
import { ThumbsUp } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useReportsStore } from "@/lib/store/reportsStore";
import { useAuthStore } from "@/lib/store/authStore";
import { useUIStore } from "@/lib/store/uiStore";
import { isAnonymousLocationDelayed, formatRelativeTime } from "@/lib/utils";
import type { ReportCategory, Severity, ReportStatus } from "@/lib/types";
import type { DateRangeOption } from "@/lib/store/uiStore";

// ── Constants ────────────────────────────────────────────────────
const CATEGORIES: ReportCategory[] = ["Safety", "Maintenance", "Accident", "Lost & Found", "Other"];
const SEVERITIES: Severity[] = ["Low", "Medium", "High", "Critical"];
const STATUSES: ReportStatus[] = ["Open", "In Progress", "Resolved"];

const STATUS_COLORS: Record<ReportStatus, string> = {
  Open: "#3B82F6",
  "In Progress": "#F59E0B",
  Resolved: "#16A34A",
};

const CATEGORY_COLORS: Record<ReportCategory, string> = {
  Safety: "#DC2626",
  Maintenance: "#F97316",
  Accident: "#7C3AED",
  "Lost & Found": "#0EA5E9",
  Other: "#6B7280",
};

// Icon area config for feed cards (user-specified colors)
const FEED_CARD_CONFIG: Record<string, { bg: string; emoji: string }> = {
  Safety:         { bg: "#3B82F6", emoji: "🛡️" },
  Maintenance:    { bg: "#F59E0B", emoji: "🔧" },
  Accident:       { bg: "#EF4444", emoji: "⚠️" },
  "Lost & Found": { bg: "#8B5CF6", emoji: "🎒" },
  Other:          { bg: "#64748B", emoji: "📋" },
};

function cutoffDate(range: DateRangeOption): Date | null {
  const now = new Date();
  if (range === "24h") return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (range === "7d") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (range === "30d") return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return null;
}

// ── Pure CSS Bar Chart ───────────────────────────────────────────
function StatusBarChart({ data, translate }: { data: { name: string; count: number }[], translate: (v: string) => string }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.name} className="flex items-center gap-2">
          {/* Translated Name */}
          <span className="text-[11px] w-[72px] text-right shrink-0" style={{ color: "rgba(255,255,255,0.55)" }}>{translate(d.name)}</span>
          <div className="flex-1 h-5 rounded overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div
              className="h-full rounded transition-all duration-300"
              style={{
                width: `${(d.count / max) * 100}%`,
                backgroundColor: STATUS_COLORS[d.name as ReportStatus] ?? "#6B7280",
                minWidth: d.count > 0 ? "18px" : "0",
              }}
            />
          </div>
          <span className="text-[11px] font-semibold text-white w-6 text-right">{d.count}</span>
        </div>
      ))}
    </div>
  );
}

// ── Pure CSS Donut Chart ─────────────────────────────────────────
function CategoryDonut({ data, translate, noDataLabel }: { data: { name: string; value: number }[], translate: (v: string) => string, noDataLabel: string }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return <p className="text-xs text-center py-8" style={{ color: "rgba(255,255,255,0.4)" }}>{noDataLabel}</p>;

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
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[80px] h-[80px] rounded-full bg-white flex items-center justify-center">
            <span className="text-lg font-bold text-slate-700">{total}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: CATEGORY_COLORS[d.name as ReportCategory] ?? "#6B7280" }}
            />
            {/* Translated Name */}
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>{translate(d.name)} ({d.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Multi-select pill toggle ─────────────────────────────────────
function MultiPill<T extends string>({
  label, options, selected, onChange, colorMap, translate
}: {
  label: string; options: T[]; selected: T[]; onChange: (v: T[]) => void; colorMap?: Record<string, string>; translate: (v: string) => string;
}) {
  const toggle = (v: T) =>
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
      {options.map((opt) => {
        const active = selected.includes(opt);
        const bg = active && colorMap ? colorMap[opt] : undefined;
        return (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className="px-2.5 py-1 rounded-full text-xs font-medium border transition-colors"
            style={
              active
                ? { background: bg ?? "rgba(255,255,255,0.15)", color: "white", borderColor: bg ?? "rgba(255,255,255,0.3)" }
                : { background: "transparent", color: "rgba(255,255,255,0.55)", borderColor: "rgba(255,255,255,0.15)" }
            }
          >
            {translate(opt)}
          </button>
        );
      })}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────
export default function MapPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const reports = useReportsStore((s) => s.reports);
  const upvoteReport = useReportsStore((s) => s.upvoteReport);
  const currentUser = useAuthStore((s) => s.currentUser);
  const rawFilters = useUIStore((s) => s.mapFilters);
  const setMapFilters = useUIStore((s) => s.setMapFilters);
  const resetMapFilters = useUIStore((s) => s.resetMapFilters);

  // Helper to translate dynamic strings
  const translate = useCallback((key: string) => {
    const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    return (t.common as any)[cleanKey] || key;
  }, [t]);

  const DATE_RANGES: { label: string; value: DateRangeOption }[] = [
    { label: t.map.last24h, value: "24h" },
    { label: t.map.last7days, value: "7d" },
    { label: t.map.last30days, value: "30d" },
    { label: t.map.allTime, value: "all" },
  ];

  const mapFilters = {
    categories: Array.isArray(rawFilters?.categories) ? rawFilters.categories : [],
    severities: Array.isArray(rawFilters?.severities) ? rawFilters.severities : [],
    statuses: Array.isArray(rawFilters?.statuses) ? rawFilters.statuses : [],
    dateRange: rawFilters?.dateRange ?? "all",
  };

  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null);
  const userId = currentUser?.id ?? "";

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

  const handleUpvote = (reportId: string) => { if (userId) upvoteReport(reportId, userId); };

  const handleFeedCardClick = useCallback((lat: number, lng: number) => {
    setFlyTarget({ lat, lng });
  }, []);

  const hasFilters =
    mapFilters.categories.length > 0 || mapFilters.severities.length > 0 ||
    mapFilters.statuses.length > 0 || mapFilters.dateRange !== "all";

  return (
    <AuthGuard>
      <div className="flex flex-col h-[calc(100vh-56px)] overflow-hidden" style={{ background: "#0d1f38" }}>

        {/* ── Filter Toolbar ── */}
        <div className="border-b px-4 py-3 flex flex-col gap-3" style={{ background: "rgba(12,35,64,0.95)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex flex-wrap items-center gap-4">
            <MultiPill label={t.map.category} options={CATEGORIES} selected={mapFilters.categories}
              onChange={(v) => setMapFilters({ categories: v })} colorMap={CATEGORY_COLORS} translate={translate} />
            <MultiPill label={t.map.severity || "Severity"} options={SEVERITIES} selected={mapFilters.severities}
              onChange={(v) => setMapFilters({ severities: v })} translate={translate} />
            <MultiPill label={t.map.status || "Status"} options={STATUSES} selected={mapFilters.statuses}
              onChange={(v) => setMapFilters({ statuses: v })} colorMap={STATUS_COLORS} translate={translate} />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "rgba(255,255,255,0.5)" }}>{t.map.date}</span>
              {DATE_RANGES.map(({ label, value }) => (
                <button key={value} onClick={() => setMapFilters({ dateRange: value })}
                  className="px-2.5 py-1 rounded-full text-xs font-medium border transition-colors"
                  style={mapFilters.dateRange === value
                    ? { background: "rgba(255,255,255,0.12)", color: "white", borderColor: "rgba(255,255,255,0.2)" }
                    : { background: "transparent", color: "rgba(255,255,255,0.55)", borderColor: "rgba(255,255,255,0.15)" }}>
                  {label}
                </button>
              ))}
            </div>
            {hasFilters && (
              <button onClick={resetMapFilters} className="text-xs underline ml-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
                {t.map.clearFilters || "Clear filters"}
              </button>
            )}
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
            {t.map.showing} <span className="font-semibold text-white">{filtered.length}</span> {t.map.of || "de"}{" "}
            <span className="font-semibold text-white">{reports.length}</span> {t.map.reports}
          </p>
        </div>

        {/* ── Main content ── */}
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row min-h-0">
          <div className="flex-1 min-h-[300px] md:min-h-0 relative">
            <HeatMap reports={mapReports} currentUserId={userId} onUpvote={handleUpvote}
              flyTarget={flyTarget} onFlyTo={(lat, lng) => setFlyTarget({ lat, lng })} />
          </div>

          <div className="w-full md:w-72 lg:w-80 flex-shrink-0 overflow-y-auto flex flex-col" style={{ borderLeft: "1px solid rgba(255,255,255,0.08)", background: "rgba(12,35,64,0.95)" }}>
            <div className="p-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>{t.map.statsStatus}</h3>
              <StatusBarChart data={statusData} translate={translate} />
            </div>
            <div className="p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>{t.map.statsCategory}</h3>
              <CategoryDonut data={categoryData} translate={translate} noDataLabel={t.map.noData || "No data"} />
            </div>
          </div>
        </div>

        {/* ── Public Feed ── */}
        <div style={{ height: "280px", borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(12,35,64,0.95)" }}>
          <div className="h-full flex flex-col">

            {/* Header */}
            <div className="px-4 py-2 flex items-center gap-2 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <h2 className="text-sm font-semibold text-white">{t.map.publicFeed}</h2>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.65)" }}
              >
                {filtered.length}
              </span>
            </div>

            {/* Scrollable card row */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
              <div className="flex gap-3 px-4 py-3 h-full items-start" style={{ minWidth: "max-content" }}>
                {filtered.length === 0 ? (
                  <div className="flex items-center justify-center w-full h-full text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {t.map.noReportsMatch || "No reports match the current filters."}
                  </div>
                ) : (
                  filtered.slice().sort((a, b) => b.upvotedBy.length - a.upvotedBy.length).map((report) => {
                    const cfg = FEED_CARD_CONFIG[report.category] ?? FEED_CARD_CONFIG["Other"];
                    return (
                      <div
                        key={report.id}
                        className="flex-shrink-0 flex rounded-xl overflow-hidden cursor-pointer transition-colors hover:bg-white/5"
                        style={{
                          width: 300,
                          border: "1px solid rgba(255,255,255,0.1)",
                          background: "rgba(255,255,255,0.04)",
                        }}
                        onClick={() => handleFeedCardClick(report.location.lat, report.location.lng)}
                      >
                        {/* ── Left: colored icon area ── */}
                        <div
                          className="flex-shrink-0 flex items-center justify-center text-2xl select-none"
                          style={{
                            width: 72,
                            minHeight: 72,
                            background: `${cfg.bg}22`,
                            borderRight: "1px solid rgba(255,255,255,0.06)",
                          }}
                          aria-hidden="true"
                        >
                          {cfg.emoji}
                        </div>

                        {/* ── Right: content ── */}
                        <div className="flex flex-col justify-between flex-1 px-3 py-2 min-w-0 gap-1">

                          {/* Title */}
                          <p
                            className="text-xs leading-snug line-clamp-1 text-white"
                            style={{ fontWeight: 500 }}
                          >
                            {report.title}
                          </p>

                          {/* Pill badges */}
                          <div className="flex flex-wrap gap-1">
                            <CategoryBadge category={translate(report.category)} />
                            <SeverityBadge severity={translate(report.severity)} />
                            <StatusBadge status={translate(report.status)} />
                          </div>

                          {/* Footer row */}
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] truncate pr-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                              {report.isAnonymous ? t.feed.anonymous : "User"} · {formatRelativeTime(report.submittedAt)}
                            </span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span
                                className="flex items-center gap-0.5 text-[10px]"
                                style={{ color: "rgba(255,255,255,0.45)" }}
                              >
                                <ThumbsUp className="h-2.5 w-2.5" />
                                {report.upvotedBy.length}
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); router.push(`/report/${report.id}`); }}
                                className="text-[10px] font-medium underline hover:no-underline rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E85D26]"
                                style={{ color: "#E85D26" }}
                              >
                                {t.map.details}
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </AuthGuard>
  );
}
