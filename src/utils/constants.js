export const APP_NAME = "LoveOne Tracker";

export const SESSION_KEY = "loveone.session.v1";
export const BUS_PREFIX = "loveone:bus";

export const EVENTS = {
  LOCATION: "location",
  SOS: "sos",
  NOTIFICATION: "notification",
  REQUEST: "request",
};

export const RELATIONSHIPS = [
  "Parent",
  "Sibling",
  "Spouse",
  "Child",
  "Friend",
  "Caregiver",
];

export const PERMISSIONS = [
  { value: "live", label: "Live location only" },
  { value: "history", label: "Live location + history" },
];

export const NOTIF_TYPES = {
  location: "location",
  alert: "alert",
  request: "request",
  system: "system",
  sos: "sos",
};

export const AVATAR_COLORS = [
  "#e11d48",
  "#7c3aed",
  "#2563eb",
  "#059669",
  "#d97706",
  "#0891b2",
  "#db2777",
  "#4f46e5",
];

export const DEMO_EMAIL = "demo@lovetracker.app";
export const DEMO_PASSWORD = "demo123";
export const DEMO_PASSWORD_ALL = "demo123";

export const BASE_LAT = 40.7128;
export const BASE_LNG = -74.006;

export const POIS = [
  { lat: 40.7128, lng: -74.006, label: "Home" },
  { lat: 40.7484, lng: -73.9857, label: "Work" },
  { lat: 40.7614, lng: -73.9776, label: "Gym" },
  { lat: 40.758, lng: -73.9855, label: "Times Square" },
  { lat: 40.6892, lng: -74.0445, label: "Statue of Liberty" },
  { lat: 40.7851, lng: -73.9683, label: "Central Park" },
];

export const LOCATION_TICK_MS = 3500;
export const HISTORY_LIMIT = 300;