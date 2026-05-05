"use client";

// Internal map component for LocationPicker — loaded via dynamic import (ssr: false)
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import {
  CAMPUS_MAP_MAX_ZOOM,
  CAMPUS_MAP_MIN_ZOOM,
  CSUF_BOUNDS,
  CSUF_CENTER,
  DEFAULT_MAP_ZOOM,
} from "@/lib/constants";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { CampusMapOverlays } from "@/components/CampusMapOverlays";

// Fix default marker icon
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const CSUF_LAT_LNG_BOUNDS = L.latLngBounds(CSUF_BOUNDS);

interface LocationPickerMapProps {
  value?: { lat: number; lng: number; areaName: string };
  onChange: (location: { lat: number; lng: number; areaName: string }) => void;
}

function FitCampusBounds() {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(CSUF_LAT_LNG_BOUNDS, {
      padding: [8, 8],
      animate: false,
    });
  }, [map]);

  return null;
}

function ClickHandler({
  onChange,
  onInvalidSelection,
}: {
  onChange: (lat: number, lng: number) => void;
  onInvalidSelection: () => void;
}) {
  useMapEvents({
    click(e) {
      if (!CSUF_LAT_LNG_BOUNDS.contains(e.latlng)) {
        onInvalidSelection();
        return;
      }

      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPickerMap({ value, onChange }: LocationPickerMapProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    value ? { lat: value.lat, lng: value.lng } : null
  );
  const [selectionError, setSelectionError] = useState<string | null>(null);

  const handleClick = (lat: number, lng: number) => {
    setSelectionError(null);
    setPosition({ lat, lng });
    onChange({ lat, lng, areaName: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
  };

  return (
    <div className="w-full max-w-[700px]">
      <MapContainer
        center={[CSUF_CENTER.lat, CSUF_CENTER.lng]}
        zoom={DEFAULT_MAP_ZOOM}
        minZoom={CAMPUS_MAP_MIN_ZOOM}
        maxZoom={CAMPUS_MAP_MAX_ZOOM}
        maxBounds={CSUF_BOUNDS}
        maxBoundsViscosity={1.0}
        className="h-[380px] w-full rounded-md md:h-[450px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CampusMapOverlays />
        <FitCampusBounds />
        <ClickHandler
          onChange={handleClick}
          onInvalidSelection={() => setSelectionError("Please choose a location within campus grounds.")}
        />
        {position && <Marker position={[position.lat, position.lng]} icon={defaultIcon} />}
      </MapContainer>
      {selectionError && (
        <p className="mt-2 text-sm text-danger" role="status">
          {selectionError}
        </p>
      )}
    </div>
  );
}
