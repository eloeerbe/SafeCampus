"use client";

// Requirements: 11.1, 11.2, 11.3
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import { SeverityBadge } from "@/components/SeverityBadge";
import { CategoryBadge } from "@/components/CategoryBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useReportsStore } from "@/lib/store/reportsStore";
import { useAuthStore } from "@/lib/store/authStore";
import { useNotificationStore } from "@/lib/store/notificationStore";
import { formatRelativeTime, getDisplayName } from "@/lib/utils";

export default function AdminReportDetailPage() {
  const params = useParams();
  const reportId = params.id as string;

  const currentUser = useAuthStore((s) => s.currentUser);
  const reports = useReportsStore((s) => s.reports);
  const markResolved = useReportsStore((s) => s.markResolved);
  const pushNotification = useNotificationStore((s) => s.push);

  const [resolutionNotes, setResolutionNotes] = useState("");
  const [error, setError] = useState("");

  const report = reports.find((r) => r.id === reportId);

  const handleResolve = () => {
    if (!resolutionNotes.trim()) {
      setError("Resolution notes are required");
      return;
    }
    if (!currentUser || !report) return;

    setError("");

    // SR-014: Update report status and push notification
    markResolved(reportId, currentUser.id, resolutionNotes.trim());

    // SR-015: Push report_resolved notification to the report's authorId
    // Resolution notifications fire even when isAnonymous is true (UR-011)
    pushNotification({
      userId: report.authorId,
      type: "report_resolved",
      urgency: "non_urgent",
      category: report.category,
      header: `Your report "${report.title}" has been resolved`,
      body: resolutionNotes.trim(),
      reportId: report.id,
    });
  };

  return (
    <AuthGuard requiredRole="admin">
      <div className="mx-auto max-w-2xl px-4 py-6">
        {!report ? (
          <div className="rounded-lg border border-dashed border-white/15 p-8 text-center">
            <p className="text-lg font-medium text-white/80">Report not found</p>
            <Link href="/admin" className="mt-3 inline-block text-sm text-primary hover:underline">
              ← Back to Admin Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Report header */}
            <div>
              <h1 className="text-2xl font-bold">{report.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <CategoryBadge category={report.category} />
                <SeverityBadge severity={report.severity} />
                <StatusBadge status={report.status} />
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-white/80 leading-relaxed">{report.description}</p>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-white/50">Location</span>
                <p>{report.location.areaName}</p>
              </div>
              <div>
                <span className="font-medium text-white/50">Submitted</span>
                <p>{formatRelativeTime(report.submittedAt)}</p>
              </div>
              <div>
                <span className="font-medium text-white/50">Author</span>
                <p>{getDisplayName(report.authorId, report.isAnonymous)}</p>
              </div>
              <div>
                <span className="font-medium text-white/50">Upvotes</span>
                <p>{report.upvotedBy.length}</p>
              </div>
            </div>

            {/* Photos */}
            {report.photos.length > 0 && (
              <div>
                <h2 className="mb-2 text-sm font-medium text-white/50">Photos</h2>
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

            {/* Resolution section */}
            {report.status === "Resolved" ? (
              <div className="rounded-lg bg-safe/10 p-4">
                <h2 className="text-sm font-semibold text-safe">Resolved</h2>
                {report.resolvedAt && (
                  <p className="mt-1 text-xs text-white/50">
                    Resolved {formatRelativeTime(report.resolvedAt)}
                  </p>
                )}
                {report.resolutionNotes && (
                  <p className="mt-2 text-sm text-white/80">{report.resolutionNotes}</p>
                )}
              </div>
            ) : (
              <div className="rounded-lg border p-4 space-y-3">
                <h2 className="text-sm font-semibold">Resolve Report</h2>
                <Textarea
                  placeholder="Enter resolution notes..."
                  value={resolutionNotes}
                  onChange={(e) => {
                    setResolutionNotes(e.target.value);
                    if (error) setError("");
                  }}
                  rows={4}
                />
                {error && <p className="text-sm text-danger">{error}</p>}
                <Button onClick={handleResolve}>Resolve</Button>
              </div>
            )}

            <Link href="/admin" className="inline-block text-sm text-white/50 hover:underline">
              ← Back to Admin Dashboard
            </Link>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
