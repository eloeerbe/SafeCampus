"use client";

// Requirements: 8.1, 8.2, 8.3, 8.5
import { ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

interface UpvoteButtonProps {
  reportId: string;
  authorId: string;
  currentUserId: string;
  upvotedBy: string[];
  onUpvote: (reportId: string) => void;
}

export function UpvoteButton({
  reportId,
  authorId,
  currentUserId,
  upvotedBy,
  onUpvote,
}: UpvoteButtonProps) {
  const isSelfAuthored = authorId === currentUserId; // SR-024: prevent self-upvote
  const hasUpvoted = upvotedBy.includes(currentUserId); // SR-025: upvote idempotence

  const handleClick = () => {
    if (hasUpvoted) {
      toast("You have already upvoted this report");
      return;
    }
    onUpvote(reportId);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isSelfAuthored}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        hasUpvoted
          ? "bg-primary/10 text-primary"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200",
        isSelfAuthored && "cursor-not-allowed opacity-50"
      )}
      aria-label={`Upvote report, ${upvotedBy.length} upvotes`}
    >
      <ThumbsUp className="h-4 w-4" />
      <span>{upvotedBy.length}</span>
    </button>
  );
}
