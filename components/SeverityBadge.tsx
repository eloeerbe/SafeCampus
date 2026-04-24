// Requirements: 6.5, 9.2
import { cn } from "@/lib/cn";
import type { Severity } from "@/lib/types";

const severityStyles: Record<Severity, string> = {
  Low: "bg-safe/10 text-safe",
  Medium: "bg-caution/10 text-caution",
  High: "bg-warning/10 text-warning",
  Critical: "bg-danger/10 text-danger",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        severityStyles[severity]
      )}
    >
      {severity}
    </span>
  );
}
