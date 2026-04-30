"use client";

// Requirements: 6.5, 8.5
import type { Report } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { SeverityBadge } from "@/components/SeverityBadge";
import { CategoryBadge } from "@/components/CategoryBadge";
import { StatusBadge } from "@/components/StatusBadge";
import { UpvoteButton } from "@/components/UpvoteButton";
import { useTranslation } from "@/hooks/useTranslation";
import { formatRelativeTime, getDisplayName } from "@/lib/utils";

interface ReportCardProps {
  report: Report;
  currentUserId: string;
  onUpvote: (reportId: string) => void;
}

export function ReportCard({ report, currentUserId, onUpvote }: ReportCardProps) {
  const { t } = useTranslation(); // Move the hook here, inside the function!

  // Helper to safely get translations for dynamic badges
  const translate = (key: string) => {
    const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    return (t.common as any)[cleanKey] || key;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{report.title}</h3>
            
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {/* We pass the translated string into the badge */}
              <CategoryBadge category={translate(report.category)} />
              <SeverityBadge severity={translate(report.severity)} />
              <StatusBadge status={translate(report.status)} />
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs text-white/45">
              {/* Translate "Anonymous" if the report is anonymous */}
              <span>
                {report.isAnonymous 
                  ? t.feed.anonymous 
                  : getDisplayName(report.authorId, report.isAnonymous)}
              </span>
              <span>·</span>
              {/* If your translation file has a generic time string, use it here */}
              <span>{t.feed.timeAgo || formatRelativeTime(report.submittedAt)}</span>
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
