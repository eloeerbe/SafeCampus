"use client";

// SR-030: Dismissible demo mode banner (UR-019)
import { X } from "lucide-react";
import { useUIStore } from "@/lib/store/uiStore";

export function DemoBanner() {
  const dismissed = useUIStore((s) => s.demoBannerDismissed);
  const dismiss = useUIStore((s) => s.dismissDemoBanner);

  if (dismissed) return null;

  return (
    <div className="flex items-center justify-between bg-accent px-4 py-2 text-sm text-white">
      <span>🚀 This application is running in demo mode. Data is stored locally in your browser.</span>
      <button
        onClick={dismiss}
        className="ml-4 shrink-0 rounded p-1 hover:bg-white/20 transition-colors"
        aria-label="Dismiss demo banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
