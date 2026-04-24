"use client";

// Requirements: 6.5, 8.5
import type { Report } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { SeverityBadge } from "@/components/SeverityBadge";
import { CategoryBadge } from "@/components/CategoryBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { UpvoteButton } from "@/components/UpvoteButton";
import { formatRelativeTime, getDisplayName } from "@/lib/utils";

interface ReportCardProps {
  report: Report;
  currentUserId: string;
  onUpvote: (reportId: string) => void;
}

export function ReportCard({ report, currentUserId, onUpvote }: ReportCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{report.title}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <CategoryBadge category={report.category} />
              <SeverityBadge severity={report.severity} />
              <StatusBadge status={report.status} />
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <span>{getDisplayName(report.authorId, report.isAnonymous)}</span>
              <span>·</span>
              <span>{formatRelativeTime(report.submittedAt)}</span>
            </div>
          </div>
          <UpvoteButton
            reportId={report.id}
            authorId={report.authorId}
            currentUserId={currentUserId}
            upvotedBy={report.upvotedBy}
            onUpvote={onUpvote}
          />
        </div>
      </CardContent>
    </Card>
  );
}
