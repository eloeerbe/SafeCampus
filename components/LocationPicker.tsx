"use client";

// Requirements: 5.1 (step 4) — Location selection via react-leaflet
import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";

const LocationPickerMap = dynamic(() => import("./LocationPickerMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 w-full items-center justify-center rounded-md bg-white/5">
      <MapPin className="h-6 w-6 animate-pulse text-white/40" />
    </div>
  ),
});

interface LocationPickerProps {
  value?: { lat: number; lng: number; areaName: string };
  onChange: (location: { lat: number; lng: number; areaName: string }) => void;
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  return (
    <div className="space-y-2">
      <LocationPickerMap value={value} onChange={onChange} />
      {value && (
        <p className="text-sm text-white/55">
          <MapPin className="mr-1 inline h-4 w-4" />
          {value.areaName}
        </p>
      )}
    </div>
  );
}
