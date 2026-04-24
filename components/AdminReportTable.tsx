"use client";

// Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
import { useState, useMemo } from "react";
import type { Report, ReportStatus } from "@/lib/types";
import { SeverityBadge } from "@/components/SeverityBadge";
import { CategoryBadge } from "@/components/CategoryBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/cn";

interface AdminReportTableProps {
  reports: Report[];
  onReportClick: (reportId: string) => void;
}

type Priority = "High" | "Medium" | "Low";

function getPriority(report: Report): Priority {
  if (report.severity === "Critical" || report.severity === "High") return "High";
  if (report.severity === "Medium") return "Medium";
  return "Low";
}

export function AdminReportTable({ reports, onReportClick }: AdminReportTableProps) {
  const [priorityFilter, setPriorityFilter] = useState<Priority | "All">("All");
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "All">("All");
  const [dateAsc, setDateAsc] = useState(false);

  const filtered = useMemo(() => {
    let result = [...reports];

    if (priorityFilter !== "All") {
      result = result.filter((r) => getPriority(r) === priorityFilter);
    }

    if (statusFilter !== "All") {
      result = result.filter((r) => r.status === statusFilter);
    }

    result.sort((a, b) => {
      const diff = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      return dateAsc ? diff : -diff;
    });

    return result;
  }, [reports, priorityFilter, statusFilter, dateAsc]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as Priority | "All")}
          className="w-40"
        >
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </Select>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ReportStatus | "All")}
          className="w-40"
        >
          <option value="All">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </Select>
        <Button variant="outline" size="sm" onClick={() => setDateAsc(!dateAsc)}>
          <ArrowUpDown className="mr-1 h-4 w-4" />
          Date {dateAsc ? "↑" : "↓"}
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Severity</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Photos</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((report) => (
              <tr
                key={report.id}
                onClick={() => onReportClick(report.id)}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 font-medium max-w-[200px] truncate">{report.title}</td>
                <td className="px-4 py-3"><CategoryBadge category={report.category} /></td>
                <td className="px-4 py-3"><SeverityBadge severity={report.severity} /></td>
                <td className="px-4 py-3"><StatusBadge status={report.status} /></td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {new Date(report.submittedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                    getPriority(report) === "High" && "bg-danger/10 text-danger",
                    getPriority(report) === "Medium" && "bg-warning/10 text-warning",
                    getPriority(report) === "Low" && "bg-safe/10 text-safe"
                  )}>
                    {getPriority(report)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {report.photos.length > 0 ? (
                    <div className="flex gap-1">
                      {report.photos.slice(0, 3).map((photo) => (
                        <img
                          key={photo.id}
                          src={photo.url}
                          alt="Report photo"
                          className="h-8 w-8 rounded object-cover cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(photo.url, "_blank");
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No reports match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
