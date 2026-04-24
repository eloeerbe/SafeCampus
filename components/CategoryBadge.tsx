// Requirements: 6.5
import type { ReportCategory } from "@/lib/types";

export function CategoryBadge({ category }: { category: ReportCategory }) {
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
      {category}
    </span>
  );
}
