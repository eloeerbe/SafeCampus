"use client";

// Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
import { useState, useMemo } from "react";
import type { Report, ReportStatus, ReportCategory } from "@/lib/types";
import { SeverityBadge } from "@/components/SeverityBadge";
import { CategoryBadge } from "@/components/CategoryBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

interface AdminReportTableProps {
  reports: Report[];
  onReportClick: (reportId: string) => void;
}

type Priority = "High" | "Medium" | "Low";
type TimeFilter = "all" | "30d" | "7d" | "24h";

const TIME_FILTERS: { key: TimeFilter; label: string }[] = [
  { key: "all", label: "All time" },
  { key: "30d", label: "Last 30d" },
  { key: "7d",  label: "Last 7d" },
  { key: "24h", label: "Last 24h" },
];

const PAGE_SIZE = 6;

function getPriority(report: Report): Priority {
  if (report.severity === "Critical" || report.severity === "High") return "High";
  if (report.severity === "Medium") return "Medium";
  return "Low";
}

function cutoffMs(filter: TimeFilter): number {
  const now = Date.now();
  if (filter === "24h") return now - 24 * 60 * 60 * 1000;
  if (filter === "7d")  return now - 7  * 24 * 60 * 60 * 1000;
  if (filter === "30d") return now - 30 * 24 * 60 * 60 * 1000;
  return 0;
}

export function AdminReportTable({ reports, onReportClick }: AdminReportTableProps) {
  const [priorityFilter, setPriorityFilter]   = useState<Priority | "All">("All");
  const [statusFilter,   setStatusFilter]     = useState<ReportStatus | "All">("All");
  const [categoryFilter, setCategoryFilter]   = useState<ReportCategory | "All">("All");
  const [timeFilter,     setTimeFilter]       = useState<TimeFilter>("all");
  const [dateAsc,        setDateAsc]          = useState(false);
  const [page,           setPage]             = useState(1);

  const filtered = useMemo(() => {
    const cutoff = cutoffMs(timeFilter);
    let result = [...reports];

    if (priorityFilter !== "All") {
      result = result.filter((r) => getPriority(r) === priorityFilter);
    }
    if (statusFilter !== "All") {
      result = result.filter((r) => r.status === statusFilter);
    }
    if (categoryFilter !== "All") {
      result = result.filter((r) => r.category === categoryFilter);
    }
    if (cutoff > 0) {
      result = result.filter((r) => new Date(r.submittedAt).getTime() >= cutoff);
    }

    result.sort((a, b) => {
      const diff = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      return dateAsc ? diff : -diff;
    });

    return result;
  }, [reports, priorityFilter, statusFilter, categoryFilter, timeFilter, dateAsc]);

  // Reset to page 1 whenever filters change
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleFilterChange = (setter: (v: any) => void) => (v: any) => {
    setter(v);
    setPage(1);
  };

  return (
    <div className="space-y-4">

      {/* ── Filter row ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Dropdowns */}
        <Select
          value={priorityFilter}
          onChange={(e) => handleFilterChange(setPriorityFilter)(e.target.value)}
          className="w-auto"
        >
          <option value="All">All priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </Select>

        <Select
          value={statusFilter}
          onChange={(e) => handleFilterChange(setStatusFilter)(e.target.value)}
          className="w-auto"
        >
          <option value="All">All statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </Select>

        <Select
          value={categoryFilter}
          onChange={(e) => handleFilterChange(setCategoryFilter)(e.target.value)}
          className="w-auto"
        >
          <option value="All">All categories</option>
          <option value="Safety">Safety</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Accident">Accident</option>
          <option value="Lost & Found">Lost &amp; Found</option>
          <option value="Other">Other</option>
        </Select>

        {/* Spacer pushes time pills to the right */}
        <div className="flex-1" />

        {/* Time filter pills */}
        <div
          className="flex items-center rounded-lg p-0.5 gap-0.5"
          style={{ background: "var(--color-background-secondary)", border: "1px solid rgba(255,255,255,0.08)" }}
          role="group"
          aria-label="Time range filter"
        >
          {TIME_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setTimeFilter(key); setPage(1); }}
              className="rounded-md px-3 py-1.5 text-xs font-semibold transition-all"
              style={
                timeFilter === key
                  ? { background: "rgba(255,255,255,0.12)", color: "#fff" }
                  : { background: "transparent", color: "rgba(255,255,255,0.55)" }
              }
              aria-pressed={timeFilter === key}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Date sort */}
        <Button variant="outline" size="sm" onClick={() => { setDateAsc(!dateAsc); setPage(1); }}>
          <ArrowUpDown className="mr-1 h-4 w-4" />
          Date {dateAsc ? "↑" : "↓"}
        </Button>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
        <table className="w-full text-sm">
          <thead style={{ background: "var(--color-background-secondary)" }}>
            <tr>
              <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wide opacity-60">Report</th>
              <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wide opacity-60">Category</th>
              <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wide opacity-60">Severity</th>
              <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wide opacity-60">Status</th>
              <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wide opacity-60">Date</th>
              <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wide opacity-60">Priority</th>
              <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wide opacity-60 sr-only">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            {paginated.map((report) => {
              const isCritical = report.severity === "Critical";
              return (
                <tr
                  key={report.id}
                  onClick={() => onReportClick(report.id)}
                  className="cursor-pointer transition-colors hover:bg-white/5"
                  style={isCritical ? { borderLeft: "3px solid #E24B4A" } : { borderLeft: "3px solid transparent" }}
                >
                  {/* Title + location */}
                  <td className="px-4 py-3 max-w-[220px]">
                    <div className="font-medium truncate">{report.title}</div>
                    <div className="text-xs opacity-50 truncate">{report.location.areaName}</div>
                  </td>
                  <td className="px-4 py-3">
                    <CategoryBadge category={report.category} />
                  </td>
                  <td className="px-4 py-3">
                    <SeverityBadge severity={report.severity} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap opacity-60 text-xs">
                    {new Date(report.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-medium",
                    )}>
                      <span
                        className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          background:
                            getPriority(report) === "High"   ? "#E24B4A" :
                            getPriority(report) === "Medium" ? "#3b82f6" : "#22c55e",
                        }}
                        aria-hidden="true"
                      />
                      <span style={{
                        color:
                          getPriority(report) === "High"   ? "#E24B4A" :
                          getPriority(report) === "Medium" ? "#3b82f6" : "#22c55e",
                      }}>
                        {getPriority(report)}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs opacity-40 hover:opacity-100 transition-opacity">View →</span>
                  </td>
                </tr>
              );
            })}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center opacity-40 text-sm">
                  No reports match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div className="flex items-center justify-between text-sm">
        <span className="opacity-50 text-xs">
          Showing {paginated.length > 0 ? (safePage - 1) * PAGE_SIZE + 1 : 0}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} reports
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ borderColor: "rgba(255,255,255,0.12)" }}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Prev
          </button>

          {/* Page number pills */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="w-7 h-7 rounded-md text-xs font-semibold transition-colors"
                style={
                  p === safePage
                    ? { background: "rgba(255,255,255,0.12)", color: "#fff" }
                    : { background: "transparent", color: "rgba(255,255,255,0.4)" }
                }
                aria-label={`Page ${p}`}
                aria-current={p === safePage ? "page" : undefined}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ borderColor: "rgba(255,255,255,0.12)" }}
            aria-label="Next page"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
