"use client";

import { Polygon, Rectangle } from "react-leaflet";
import { CSUF_BOUNDS } from "@/lib/constants";

const WORLD_MASK: [number, number][] = [
  [90, -180],
  [90, 180],
  [-90, 180],
  [-90, -180],
];

const CSUF_RECTANGLE: [number, number][] = [
  CSUF_BOUNDS[0],
  [CSUF_BOUNDS[0][0], CSUF_BOUNDS[1][1]],
  CSUF_BOUNDS[1],
  [CSUF_BOUNDS[1][0], CSUF_BOUNDS[0][1]],
];

export function CampusMapOverlays() {
  return (
    <>
      <Polygon
        positions={[WORLD_MASK, CSUF_RECTANGLE]}
        pathOptions={{
          color: "transparent",
          fillColor: "#001f3f",
          fillOpacity: 0.65,
          fillRule: "evenodd",
          stroke: false,
        }}
        interactive={false}
      />
      <Rectangle
        bounds={CSUF_BOUNDS}
        pathOptions={{
          color: "#e85d26",
          weight: 2,
          opacity: 0.55,
          fillOpacity: 0,
          dashArray: "8 8",
        }}
        interactive={false}
      />
    </>
  );
}
