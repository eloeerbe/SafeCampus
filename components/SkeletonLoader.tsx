// Requirements: 17.6
import { cn } from "@/lib/cn";

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div className={cn("h-4 animate-pulse rounded bg-gray-200", className)} />
  );
}

function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} className={i === lines - 1 ? "w-2/3" : "w-full"} />
      ))}
    </div>
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border border-gray-200 bg-white p-4 shadow-sm space-y-3", className)}>
      <SkeletonLine className="h-5 w-3/4" />
      <div className="flex gap-2">
        <SkeletonLine className="h-5 w-16 rounded-full" />
        <SkeletonLine className="h-5 w-16 rounded-full" />
        <SkeletonLine className="h-5 w-16 rounded-full" />
      </div>
      <SkeletonLine className="h-4 w-1/2" />
    </div>
  );
}

export { SkeletonCard, SkeletonText, SkeletonLine };
