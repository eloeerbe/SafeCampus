"use client";

// Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 8.4
import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { ReportCard } from "@/components/ReportCard";
import { Select } from "@/components/ui/select";
import { useReportsStore } from "@/lib/store/reportsStore";
import { useAuthStore } from "@/lib/store/authStore";
import { useUIStore } from "@/lib/store/uiStore";
import { useTranslation } from "@/hooks/useTranslation"; // Import hook
import type { ReportCategory } from "@/lib/types";

export default function DashboardPage() {
  const { t } = useTranslation(); // Initialize translation
  const currentUser = useAuthStore((s) => s.currentUser);
  const upvoteReport = useReportsStore((s) => s.upvoteReport);
  const getSortedByUpvotes = useReportsStore((s) => s.getSortedByUpvotes);
  const feedFilter = useUIStore((s) => s.feedFilter);
  const setFeedFilter = useUIStore((s) => s.setFeedFilter);

  // Categories mapped to translation keys
  const CATEGORIES = [
    { value: "Safety", label: t.profile.categories.safety },
    { value: "Maintenance", label: t.profile.categories.maintenance },
    { value: "Harassment", label: t.profile.categories.harassment },
    { value: "Lost & Found", label: t.profile.categories.lostAndFound },
    { value: "Other", label: t.profile.categories.other },
  ];

  const sortedReports = getSortedByUpvotes();

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
          {/* Use t.feed.title for the header */}
          <h1 className="text-2xl font-bold">{t.feed.title}</h1>
          
          <Select
            value={feedFilter ?? ""}
            onChange={(e) =>
              setFeedFilter(e.target.value ? (e.target.value as ReportCategory) : null)
            }
            className="w-44"
          >
            <option value="">{t.feed.allCategories}</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </Select>
        </div>

        {filteredReports.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
            {feedFilter
              ? `${t.feed.noReportsFound || "No reports found"} for "${feedFilter}"`
              : t.feed.noActiveReports || "No active reports to display."}
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

        {/* Floating action button translated */}
        <Link
          href="/report/new"
          className="fixed bottom-6 right-6 z-50 flex h-14 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white shadow-lg hover:bg-primary/90 transition-colors"
        >
          + {t.feed.newReport}
        </Link>
      </div>
    </AuthGuard>
  );
}
