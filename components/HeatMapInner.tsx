"use client";

// SR-019, SR-020, SR-021, SR-022, SR-023, SR-024, SR-025, SR-026, SR-027, SR-018
// Internal heat map component — loaded via dynamic import (ssr: false) from HeatMap.tsx
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { Report } from "@/lib/types";
import { CAMPUS_MAP_MAX_ZOOM, CAMPUS_MAP_MIN_ZOOM, CSUF_BOUNDS, CSUF_CENTER } from "@/lib/constants";
import { isAnonymousLocationDelayed, formatRelativeTime } from "@/lib/utils";
import { CampusMapOverlays } from "@/components/CampusMapOverlays";

// ── Severity config ──────────────────────────────────────────────
const SEVERITY_COLOR: Record<string, string> = {
  Low: "#16A34A",
  Medium: "#FACC15",
  High: "#F97316",
  Critical: "#DC2626",
  Resolved: "#9CA3AF",
};

const SEVERITY_INTENSITY: Record<string, number> = {
  Low: 0.25,
  Medium: 0.5,
  High: 0.75,
  Critical: 1.0,
};

// ── DivIcon factory ──────────────────────────────────────────────
function makeDivIcon(severity: string, status: string): L.DivIcon {
  const color = status === "Resolved" ? SEVERITY_COLOR.Resolved : SEVERITY_COLOR[severity] ?? "#6B7280";
  const opacity = status === "Resolved" ? 0.5 : 1;
  const pulse = severity === "Critical" && status !== "Resolved";

  const iconSvg: Record<string, string> = {
    Critical: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    High: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    Medium: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    Low: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    Resolved: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  };

  const svgKey = status === "Resolved" ? "Resolved" : severity;
  const svg = iconSvg[svgKey] ?? iconSvg.Low;

  const pulseHtml = pulse
    ? `<span style="position:absolute;inset:-6px;border-radius:50%;border:2px solid ${color};animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;opacity:0.6;"></span>`
    : "";

  return L.divIcon({
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
    html: `
      <span style="position:relative;display:inline-flex;align-items:center;justify-content:center;
        width:28px;height:28px;border-radius:50%;background:${color};opacity:${opacity};
        box-shadow:0 2px 6px rgba(0,0,0,0.35);border:2px solid white;">
        ${pulseHtml}
        ${svg}
      </span>`,
  });
}

// ── Campus zone overlays (decorative) ───────────────────────────
const ZONES = [
  {
    name: "Academic Core",
    color: "#00244D",
    coords: [
      [33.8825, -117.8870] as [number, number],
      [33.8825, -117.8830] as [number, number],
      [33.8795, -117.8830] as [number, number],
      [33.8795, -117.8870] as [number, number],
    ],
  },
  {
    name: "Student Life",
    color: "#FF7900",
    coords: [
      [33.8845, -117.8890] as [number, number],
      [33.8845, -117.8855] as [number, number],
      [33.8820, -117.8855] as [number, number],
      [33.8820, -117.8890] as [number, number],
    ],
  },
  {
    name: "Athletics / Rec",
    color: "#16A34A",
    coords: [
      [33.8865, -117.8895] as [number, number],
      [33.8865, -117.8855] as [number, number],
      [33.8845, -117.8855] as [number, number],
      [33.8845, -117.8895] as [number, number],
    ],
  },
  {
    name: "Housing",
    color: "#7C3AED",
    coords: [
      [33.8865, -117.8830] as [number, number],
      [33.8865, -117.8800] as [number, number],
      [33.8840, -117.8800] as [number, number],
      [33.8840, -117.8830] as [number, number],
    ],
  },
  {
    name: "Parking",
    color: "#6B7280",
    coords: [
      [33.8820, -117.8910] as [number, number],
      [33.8820, -117.8890] as [number, number],
      [33.8795, -117.8890] as [number, number],
      [33.8795, -117.8910] as [number, number],
    ],
  },
];

// ── Inner map controller (runs inside MapContainer context) ──────
interface MapControllerProps {
  reports: Report[];
  currentUserId: string;
  onUpvote: (reportId: string) => void;
  onFlyTo: (lat: number, lng: number) => void;
  flyTarget: { lat: number; lng: number } | null;
}

function MapController({ reports, currentUserId, onUpvote, flyTarget }: MapControllerProps) {
  const map = useMap();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const heatLayerRef = useRef<L.Layer | null>(null);
  const zoneLayersRef = useRef<L.Layer[]>([]);

  // ── Zone overlays (once) ──
  useEffect(() => {
    zoneLayersRef.current.forEach((l) => map.removeLayer(l));
    zoneLayersRef.current = [];

    ZONES.forEach((zone) => {
      const poly = L.polygon(zone.coords, {
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: 0.07,
        weight: 1.5,
        opacity: 0.3,
        dashArray: "4 4",
      }).addTo(map);

      const center = poly.getBounds().getCenter();
      const label = L.marker(center, {
        icon: L.divIcon({
          className: "",
          html: `<span style="font-size:10px;font-weight:600;color:${zone.color};
            background:rgba(255,255,255,0.75);padding:2px 5px;border-radius:4px;
            white-space:nowrap;pointer-events:none;">${zone.name}</span>`,
          iconAnchor: [40, 8],
        }),
        interactive: false,
        keyboard: false,
      }).addTo(map);

      zoneLayersRef.current.push(poly, label);
    });

    return () => {
      zoneLayersRef.current.forEach((l) => map.removeLayer(l));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // ── Heat layer ──
  useEffect(() => {
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }
    if (reports.length === 0) return;

    const points = reports.map((r) => [
      r.location.lat,
      r.location.lng,
      SEVERITY_INTENSITY[r.severity] ?? 0.5,
    ]);

    // @ts-expect-error leaflet.heat has no TS types bundled
    const layer = L.heatLayer(points, {
      radius: 35,
      blur: 25,
      maxZoom: 18,
      gradient: { 0.2: "#22C55E", 0.4: "#FACC15", 0.7: "#F97316", 1.0: "#DC2626" },
    });
    layer.addTo(map);
    heatLayerRef.current = layer;

    return () => {
      if (heatLayerRef.current) map.removeLayer(heatLayerRef.current);
    };
  }, [reports, map]);

  // ── Marker cluster group ──
  useEffect(() => {
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
      clusterGroupRef.current = null;
    }

    const group: L.MarkerClusterGroup = L.markerClusterGroup({
      maxClusterRadius: 50,
      iconCreateFunction: (cluster: L.MarkerCluster) => {
        const markers = cluster.getAllChildMarkers();
        // Highest severity in cluster drives bubble color
        const severityOrder = ["Critical", "High", "Medium", "Low"];
        let topSeverity = "Low";
        markers.forEach((m) => {
          const sev = (m as L.Marker & { options: { severity?: string } }).options.severity ?? "Low";
          if (severityOrder.indexOf(sev) < severityOrder.indexOf(topSeverity)) {
            topSeverity = sev;
          }
        });
        const color = SEVERITY_COLOR[topSeverity] ?? "#6B7280";
        const count = cluster.getChildCount();
        return L.divIcon({
          className: "",
          iconSize: [36, 36],
          html: `<span style="display:flex;align-items:center;justify-content:center;
            width:36px;height:36px;border-radius:50%;background:${color};
            color:white;font-size:13px;font-weight:700;
            box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">${count}</span>`,
        });
      },
    });

    reports.forEach((report) => {
      const icon = makeDivIcon(report.severity, report.status);
      const hasUpvoted = report.upvotedBy.includes(currentUserId);
      const isSelf = report.authorId === currentUserId;
      const upvoteDisabled = hasUpvoted || isSelf;

      const popupHtml = `
        <div style="min-width:220px;max-width:280px;font-family:Inter,sans-serif;font-size:13px;">
          ${report.photos[0] ? `<img src="${report.photos[0].url}" alt="" style="width:100%;height:100px;object-fit:cover;border-radius:6px;margin-bottom:8px;" />` : ""}
          <p style="font-weight:700;font-size:14px;margin:0 0 6px;color:#00244D;">${report.title}</p>
          <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px;">
            <span style="background:#f3f4f6;color:#374151;padding:2px 8px;border-radius:999px;font-size:11px;">${report.category}</span>
            <span style="background:${SEVERITY_COLOR[report.severity]}22;color:${SEVERITY_COLOR[report.severity]};padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;">${report.severity}</span>
            <span style="background:#dbeafe;color:#1d4ed8;padding:2px 8px;border-radius:999px;font-size:11px;">${report.status}</span>
          </div>
          <p style="color:#6b7280;margin:0 0 4px;font-size:11px;">
            ${report.isAnonymous ? "Anonymous" : report.authorId} · ${formatRelativeTime(report.submittedAt)}
          </p>
          <p style="color:#6b7280;margin:0 0 8px;font-size:11px;">📍 ${report.location.areaName}</p>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <button
              data-upvote="${report.id}"
              style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;
                border:none;cursor:${upvoteDisabled ? "not-allowed" : "pointer"};font-size:12px;font-weight:600;
                background:${hasUpvoted ? "#e0e7ff" : "#f3f4f6"};
                color:${hasUpvoted ? "#4338ca" : "#374151"};
                opacity:${upvoteDisabled ? 0.5 : 1};"
              ${upvoteDisabled ? "disabled" : ""}
              title="${isSelf ? "Cannot upvote your own report" : hasUpvoted ? "Already upvoted" : "Upvote"}"
            >
              👍 ${report.upvotedBy.length}
            </button>
            <a href="/report/${report.id}"
              style="display:inline-flex;align-items:center;padding:4px 10px;border-radius:6px;
                background:#00244D;color:white;font-size:12px;font-weight:600;text-decoration:none;">
              View Details →
            </a>
          </div>
        </div>`;

      const marker = L.marker([report.location.lat, report.location.lng], {
        icon,
        // @ts-expect-error custom option for cluster color
        severity: report.severity,
      }).bindPopup(popupHtml, { maxWidth: 300 });

      // Upvote handler inside popup
      marker.on("popupopen", () => {
        const btn = document.querySelector(`[data-upvote="${report.id}"]`) as HTMLButtonElement | null;
        if (btn && !btn.disabled) {
          btn.addEventListener("click", () => onUpvote(report.id), { once: true });
        }
      });

      group.addLayer(marker);
    });

    group.addTo(map);
    clusterGroupRef.current = group;

    return () => {
      if (clusterGroupRef.current) map.removeLayer(clusterGroupRef.current);
    };
  }, [reports, currentUserId, onUpvote, map]);

  // ── Fly-to from feed card click ──
  useEffect(() => {
    if (flyTarget) {
      map.flyTo([flyTarget.lat, flyTarget.lng], 18, { duration: 0.8 });
    }
  }, [flyTarget, map]);

  return null;
}

// ── Main export ──────────────────────────────────────────────────
interface HeatMapInnerProps {
  reports: Report[];
  currentUserId: string;
  onUpvote: (reportId: string) => void;
  flyTarget: { lat: number; lng: number } | null;
  onFlyTo: (lat: number, lng: number) => void;
}

export default function HeatMapInner({
  reports,
  currentUserId,
  onUpvote,
  flyTarget,
  onFlyTo,
}: HeatMapInnerProps) {
  // SR-018: filter anonymous reports < 5 min old
  const visibleReports = reports.filter(
    (r) => !isAnonymousLocationDelayed(r.isAnonymous, r.submittedAt)
  );

  return (
    <>
      {/* Pulse animation keyframes injected once */}
      <style>{`@keyframes ping{75%,100%{transform:scale(2);opacity:0}}`}</style>
      <MapContainer
        center={[CSUF_CENTER.lat, CSUF_CENTER.lng]}
        zoom={16}
        minZoom={CAMPUS_MAP_MIN_ZOOM}
        maxZoom={CAMPUS_MAP_MAX_ZOOM}
        maxBounds={CSUF_BOUNDS}
        maxBoundsViscosity={1.0}
        scrollWheelZoom
        className="h-full w-full"
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CampusMapOverlays />
        <MapController
          reports={visibleReports}
          currentUserId={currentUserId}
          onUpvote={onUpvote}
          flyTarget={flyTarget}
          onFlyTo={onFlyTo}
        />
      </MapContainer>
    </>
  );
}
