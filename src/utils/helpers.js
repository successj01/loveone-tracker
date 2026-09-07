import { BASE_LAT, BASE_LNG, POIS } from "./constants";

let seq = 0;

export function uid(prefix = "id") {
  seq += 1;
  return `${prefix}_${Date.now().toString(36)}_${seq}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function delay(ms = 100) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function rand(min, max) {
  return min + Math.random() * (max - min);
}

export function randomInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function initials(name = "?") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function jitter(lat, lng, deg = 0.0009) {
  return {
    lat: lat + rand(-deg, deg),
    lng: lng + rand(-deg, deg),
  };
}

export function nearbyPOI(lat, lng) {
  let best = null;
  let bestDist = Infinity;
  for (const poi of POIS) {
    const d = haversineMeters(lat, lng, poi.lat, poi.lng);
    if (d < bestDist) {
      bestDist = d;
      best = poi;
    }
  }
  if (best && bestDist < 900) return best.label;
  return null;
}

export function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(ts) {
  return new Date(ts).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDayLabel(ts) {
  const date = new Date(ts);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const same = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (same(date, today)) return "Today";
  if (same(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function formatRelative(ts) {
  const diff = Date.now() - ts;
  if (diff < 0) return "just now";
  const s = Math.floor(diff / 1000);
  if (s < 45) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function getLocationStatus(ts) {
  if (!ts) return { key: "offline", label: "No data" };
  const diff = Date.now() - ts;
  if (diff < 60 * 1000) return { key: "online", label: "Live" };
  if (diff < 15 * 60 * 1000) return { key: "idle", label: "Recently" };
  return { key: "offline", label: "Offline" };
}

export function groupByDay(points) {
  const groups = new Map();
  for (const p of [...points].sort((a, b) => a.createdAt - b.createdAt)) {
    const day = formatDayLabel(p.createdAt);
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day).push(p);
  }
  return [...groups.entries()];
}

export function randomBattery() {
  return randomInt(12, 100);
}

export function defaultPosition() {
  return { lat: BASE_LAT, lng: BASE_LNG };
}