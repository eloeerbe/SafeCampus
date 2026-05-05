"use client";

// Requirements: 8.1, 8.2, 8.3, 8.5
import { ThumbsUp } from "lucide-react";
import { cn } from "@/lib/cn";

interface UpvoteButtonProps {
  reportId: string;
  authorId: string;
  currentUserId: string;
  upvotedBy: string[];
  onUpvote: (reportId: string) => void;
  onRemoveUpvote?: (reportId: string) => void;
}

export function UpvoteButton({
  reportId,
  authorId,
  currentUserId,
  upvotedBy,
  onUpvote,
  onRemoveUpvote,
}: UpvoteButtonProps) {
  const isSelfAuthored = authorId === currentUserId; // SR-024: prevent self-upvote
  const hasUpvoted = upvotedBy.includes(currentUserId); // SR-025: upvote idempotence

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (hasUpvoted) {
      onRemoveUpvote?.(reportId);
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
          ? "bg-accent text-white shadow-sm hover:bg-accent/90"
          : "border border-white/45 bg-transparent text-white hover:border-white hover:bg-white/10",
        isSelfAuthored && "cursor-not-allowed opacity-50"
      )}
      aria-pressed={hasUpvoted}
      aria-label={`${hasUpvoted ? "Remove upvote from" : "Upvote"} report, ${upvotedBy.length} upvotes`}
    >
      <ThumbsUp className={cn("h-4 w-4", hasUpvoted && "fill-current")} />
      <span>{upvotedBy.length}</span>
    </button>
  );
}
