"use client";

import { useMemo } from "react";
import L from "leaflet";
import { Marker, Tooltip } from "react-leaflet";

export default function LocationMarker({
  position,
  label = "",
  color = "#e11d48",
  emoji = "❤",
  pulse = false,
  me = false,
}) {
  const icon = useMemo(() => {
    const cls = ["lot-marker"];
    if (pulse) cls.push("lot-marker-pulse");
    if (me) cls.push("lot-marker-me");
    return L.divIcon({
      className: "",
      html: `<div class="${cls.join(" ")}" style="--c:${color}">${emoji}</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 30],
      popupAnchor: [0, -28],
    });
  }, [color, emoji, pulse, me]);

  if (!position || position.lat == null || position.lng == null) return null;

  return (
    <Marker position={[position.lat, position.lng]} icon={icon}>
      {label ? (
        <Tooltip direction="top" offset={[0, -22]}>
          {label}
        </Tooltip>
      ) : null}
    </Marker>
  );
}