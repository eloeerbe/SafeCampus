"use client";

// Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 8.4
import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { ReportCard } from "@/components/ReportCard";
import { Select } from "@/components/ui/select";
import { useReportsStore } from "@/lib/store/reportsStore";
import { useAuthStore } from "@/lib/store/authStore";
import { useUIStore } from "@/lib/store/uiStore";
import type { ReportCategory } from "@/lib/types";

const CATEGORIES: ReportCategory[] = ["Safety", "Maintenance", "Harassment", "Lost & Found", "Other"];

export default function DashboardPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const upvoteReport = useReportsStore((s) => s.upvoteReport);
  const getSortedByUpvotes = useReportsStore((s) => s.getSortedByUpvotes);
  const feedFilter = useUIStore((s) => s.feedFilter);
  const setFeedFilter = useUIStore((s) => s.setFeedFilter);

  // Req 6.1, 6.2: Non-resolved reports sorted by upvotes DESC, submittedAt DESC tiebreaker
  const sortedReports = getSortedByUpvotes();

  // Req 6.3: Apply category filter
  const filteredReports = feedFilter
    ? sortedReports.filter((r) => r.category === feedFilter)
    : sortedReports;

  const handleUpvote = (reportId: string) => {
    if (!currentUser) return;
    upvoteReport(reportId, currentUser.id);
  };

  return (
    <AuthGuard>
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Report Feed</h1>
          <Select
            value={feedFilter ?? ""}
            onChange={(e) =>
              setFeedFilter(e.target.value ? (e.target.value as ReportCategory) : null)
            }
            className="w-44"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </div>

        {filteredReports.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
            {feedFilter
              ? `No reports found for "${feedFilter}". Try a different category.`
              : "No active reports to display."}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReports.map((report) => (
              <Link key={report.id} href={`/report/${report.id}`}>
                <ReportCard
                  report={report}
                  currentUserId={currentUser?.id ?? ""}
                  onUpvote={handleUpvote}
                />
              </Link>
            ))}
          </div>
        )}

        {/* Req 6.1: Floating action button for new report */}
        <Link
          href="/report/new"
          className="fixed bottom-6 right-6 z-50 flex h-14 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-lg hover:bg-primary/90 transition-colors"
        >
          + New Report
        </Link>
      </div>
    </AuthGuard>
  );
}
