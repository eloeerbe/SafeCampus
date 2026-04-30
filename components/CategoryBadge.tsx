// Requirements: 6.5
import type { ReportCategory } from "@/lib/types";

export function CategoryBadge({ category }: { category: ReportCategory }) {
  return (
    <span className="inline-flex items-center rounded-full bg-white/8 px-2.5 py-0.5 text-xs font-medium text-white/70">
      {category}
    </span>
  );
}
