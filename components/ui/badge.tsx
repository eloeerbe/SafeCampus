import React from "react";
import { cn } from "@/lib/cn";

// Req 17.3, 17.4: Badge primitive with variant support

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

const variantStyles: Record<string, string> = {
  default: "bg-primary text-white",
  secondary: "bg-gray-100 text-gray-800",
  destructive: "bg-danger text-white",
  outline: "border border-gray-300 text-foreground bg-transparent",
};

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
