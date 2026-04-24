"use client";

// SR-019, SR-021: Dynamic import wrapper — prevents SSR for Leaflet
import dynamic from "next/dynamic";
import type { Report } from "@/lib/types";

const HeatMapInner = dynamic(() => import("./HeatMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100">
      <p className="text-sm text-slate-400 animate-pulse">Loading map…</p>
    </div>
  ),
});

interface HeatMapProps {
  reports: Report[];
  currentUserId: string;
  onUpvote: (reportId: string) => void;
  flyTarget: { lat: number; lng: number } | null;
  onFlyTo: (lat: number, lng: number) => void;
}

export function HeatMap(props: HeatMapProps) {
  return <HeatMapInner {...props} />;
}
