"use client";

// Internal map component for LocationPicker — loaded via dynamic import (ssr: false)
import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { CSUF_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/constants";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationPickerMapProps {
  value?: { lat: number; lng: number; areaName: string };
  onChange: (location: { lat: number; lng: number; areaName: string }) => void;
}

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPickerMap({ value, onChange }: LocationPickerMapProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    value ? { lat: value.lat, lng: value.lng } : null
  );

  const handleClick = (lat: number, lng: number) => {
    setPosition({ lat, lng });
    onChange({ lat, lng, areaName: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
  };

  return (
    <MapContainer
      center={[CSUF_CENTER.lat, CSUF_CENTER.lng]}
      zoom={DEFAULT_MAP_ZOOM}
      className="h-64 w-full rounded-md"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onChange={handleClick} />
      {position && <Marker position={[position.lat, position.lng]} icon={defaultIcon} />}
    </MapContainer>
  );
}
