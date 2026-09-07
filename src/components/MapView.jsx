"use client";

import { useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import LocationMarker from "@/components/LocationMarker";
import { BASE_LAT, BASE_LNG } from "@/utils/constants";

function FitBounds({ markers, polylines }) {
  const map = useMap();

  useEffect(() => {
    if (map && markers.length) {
      const points = [];
      for (const m of markers) {
        if (m.lat != null && m.lng != null) {
          points.push([m.lat, m.lng]);
        }
      }
      for (const line of polylines) {
        if (line?.length) points.push(...line);
      }
      if (points.length) {
        map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 14 });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, markers.length, polylines.length]);

  return null;
}

export default function MapView({
  markers = [],
  polylines = [],
  center = [BASE_LAT, BASE_LNG],
  zoom = 13,
  height = "60vh",
  className = "",
}) {
  return (
    <div className={`overflow-hidden rounded-2xl shadow-sm ring-1 ring-zinc-200 ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        style={{ height }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {polylines.map((line, idx) => (
          <Polyline
            key={`line-${idx}`}
            positions={line}
            pathOptions={{
              color: line.color || "#e11d48",
              weight: 3,
              opacity: 0.75,
            }}
          />
        ))}
        {markers.map((marker) => (
          <LocationMarker
            key={marker.id}
            position={{ lat: marker.lat, lng: marker.lng }}
            label={marker.label}
            color={marker.color}
            emoji={marker.emoji}
            pulse={marker.pulse}
            me={marker.me}
          />
        ))}
        {markers.length ? (
          <FitBounds markers={markers} polylines={polylines} />
        ) : null}
      </MapContainer>
    </div>
  );
}