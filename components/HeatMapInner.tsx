"use client";

// Internal heat map component — loaded via dynamic import (ssr: false)
// Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Popup, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Report, ReportCategory, Severity } from "@/lib/types";
import { CSUF_CENTER, DEFAULT_MAP_ZOOM, SEVERITY_INTENSITY, SEVERITY_COLOR } from "@/lib/constants";
import { isAnonymousLocationDelayed } from "@/lib/utils";

interface HeatMapInnerProps {
  reports: Report[];
  filters: { category?: ReportCategory; severity?: Severity };
  onReportClick: (reportId: string) => void;
}

function HeatLayer({ reports }: { reports: Report[] }) {
  const map = useMap();
  const heatLayerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    if (reports.length === 0) return;

    const points = reports.map((r) => [
      r.location.lat,
      r.location.lng,
      SEVERITY_INTENSITY[r.severity],
    ]);

    // @ts-expect-error leaflet.heat types
    const layer = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
    // SR-013: Heat map gradient green → yellow → orange → red
      gradient: { 0.25: "#16A34A", 0.5: "#EAB308", 0.75: "#F59E0B", 1.0: "#DC2626" },
    });

    layer.addTo(map);
    heatLayerRef.current = layer;

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [reports, map]);

  return null;
}

export default function HeatMapInner({ reports, filters, onReportClick }: HeatMapInnerProps) {
  // SR-019: Filter out resolved reports from heat layer
  let filtered = reports.filter((r) => r.status !== "Resolved");

  // SR-008: Filter out anonymous reports within 5-minute delay window
  filtered = filtered.filter(
    (r) => !isAnonymousLocationDelayed(r.isAnonymous, r.submittedAt)
  );

  // Apply category filter
  if (filters.category) {
    filtered = filtered.filter((r) => r.category === filters.category);
  }

  // Apply severity filter
  if (filters.severity) {
    filtered = filtered.filter((r) => r.severity === filters.severity);
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[CSUF_CENTER.lat, CSUF_CENTER.lng]}
        zoom={DEFAULT_MAP_ZOOM}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <HeatLayer reports={filtered} />
        {filtered.map((report) => (
          <CircleMarker
            key={report.id}
            center={[report.location.lat, report.location.lng]}
            radius={8}
            pathOptions={{
              color: SEVERITY_COLOR[report.severity],
              fillColor: SEVERITY_COLOR[report.severity],
              fillOpacity: 0.6,
            }}
            eventHandlers={{ click: () => onReportClick(report.id) }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{report.title}</p>
                <p className="text-gray-500">{report.category} · {report.severity}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      {filtered.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none z-[1000]">
          <div className="rounded-lg bg-white px-6 py-4 shadow-md">
            <p className="text-sm font-medium text-gray-600">No active reports to display</p>
          </div>
        </div>
      )}
    </div>
  );
}
