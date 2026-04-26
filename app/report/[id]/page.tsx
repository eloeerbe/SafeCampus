"use client";

// Requirements: 7.1, 7.2, 7.3, 8.1, 8.2, 8.5
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/AuthGuard";
import { UpvoteButton } from "@/components/UpvoteButton";
import { SeverityBadge } from "@/components/SeverityBadge";
import { CategoryBadge } from "@/components/CategoryBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { useReportsStore } from "@/lib/store/reportsStore";
import { useAuthStore } from "@/lib/store/authStore";
import { useNotificationStore } from "@/lib/store/notificationStore";
import { useTranslation } from "@/hooks/useTranslation";
import { formatRelativeTime, getDisplayName } from "@/lib/utils";

export default function ReportDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const reportId = params.id as string;

  const currentUser = useAuthStore((s) => s.currentUser);
  const reports = useReportsStore((s) => s.reports);
  const upvoteReport = useReportsStore((s) => s.upvoteReport);
  const resolveReport = useReportsStore((s) => s.resolveReport);
  const pushNotification = useNotificationStore((s) => s.push);

  const report = reports.find((r) => r.id === reportId);
  const isAdmin = currentUser?.role === "admin";

  // Helper to translate dynamic strings like "Safety" or "Open"
  const translate = (key: string) => {
    const lowerKey = key.toLowerCase().replace(/\s+/g, '');
    return (t.common as any)[lowerKey] || key;
  };

  const handleUpvote = (id: string) => {
    if (!currentUser) return;
    upvoteReport(id, currentUser.id);
  };

  const handleResolve = () => {
    if (!currentUser || !report) return;
    resolveReport(report.id);
    
    // SR-031, SR-032: Send resolution notification using translated keys
    pushNotification({
      userId: report.authorId,
      type: "report_resolved",
      urgency: "non_urgent",
      category: report.category,
      header: t.toasts.resolved || "Report Resolved",
      body: `${t.feed.title}: ${report.title}`,
      reportId: report.id,
    });
    
    // FIXED: Removed the curly braces that were causing the error
    toast.success(t.toasts.resolved || "Report marked as resolved.");
  };

  return (
    <AuthGuard>
      <div className="mx-auto max-w-2xl px-4 py-6">
        {!report ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <p className="text-lg font-medium text-gray-700">{t.feed.notFound || "Report not found"}</p>
            <Link href="/dashboard" className="mt-3 inline-block text-sm text-primary hover:underline">
              ← {t.feed.back}
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">{report.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {/* Now using the translate helper for Spanish badges */}
                <CategoryBadge category={translate(report.category)} />
                <SeverityBadge severity={translate(report.severity)} />
                <StatusBadge status={translate(report.status)} />
              </div>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed">{report.description}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-500">{t.feed.location}</span>
                <p>{report.location.areaName}</p>
              </div>
              <div>
                <span className="font-medium text-gray-500">{t.feed.submitted}</span>
                <p>{t.feed.timeAgo || formatRelativeTime(report.submittedAt)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-500">{t.feed.author}</span>
                <p>
                  {report.isAnonymous 
                    ? t.feed.anonymous 
                    : getDisplayName(report.authorId, report.isAnonymous)}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-500">{t.feed.upvotes}</span>
                <p>{report.upvotedBy.length}</p>
              </div>
            </div>

            {report.photos.length > 0 && (
              <div>
                <h2 className="mb-2 text-sm font-medium text-gray-500">{t.feed.photos}</h2>
                <div className="grid grid-cols-3 gap-2">
                  {report.photos.map((photo) => (
                    <img
                      key={photo.id}
                      src={photo.url}
                      alt="Report photo"
                      className="h-32 w-full rounded-lg object-cover"
                    />
                  ))}
                </div>
              </div>
            )}

            {report.status === "Resolved" && report.resolutionNotes && (
              <div className="rounded-lg bg-safe/10 p-4">
                <h2 className="text-sm font-semibold text-safe">
                   {t.common.resolutionNotes || "Resolution Notes"}
                </h2>
                <p className="mt-1 text-sm text-gray-700">{report.resolutionNotes}</p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4">
              <UpvoteButton
                reportId={report.id}
                authorId={report.authorId}
                currentUserId={currentUser?.id ?? ""}
                upvotedBy={report.upvotedBy}
                onUpvote={handleUpvote}
              />

              {isAdmin && report.status !== "Resolved" && (
                <button
                  onClick={handleResolve}
                  className="inline-flex items-center gap-2 rounded-md bg-safe px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-safe/50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {t.common.resolveAction || "Mark as Resolved"}
                </button>
              )}

              <Link href="/dashboard" className="text-sm text-gray-500 hover:underline">
                ← {t.feed.back}
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
