import { apiRequest } from "@/lib/apiClient";
import { publicUser } from "@/services/authService";

export const DEFAULT_SETTINGS = {
  sosAlerts: true,
  lowBatteryAlerts: true,
  geofenceAlerts: true,
};

export async function getById(id) {
  const data = await apiRequest(`/users/${id}`);
  return publicUser(data.user);
}

export async function updateProfile(id, patch) {
  const allowed = ["name", "phone", "bio", "color", "photo"];
  const clean = {};
  for (const key of allowed) {
    if (key in patch) clean[key] = patch[key];
  }
  const data = await apiRequest("/users/me", { method: "PATCH", body: clean });
  return publicUser(data.user);
}

export async function setLocationSharing(userId, enabled) {
  const data = await apiRequest("/users/me/sharing", {
    method: "PATCH",
    body: { enabled: Boolean(enabled) },
  });
  return publicUser(data.user);
}

export async function getSettings(userId) {
  const data = await apiRequest("/users/me/settings");
  return { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
}

export async function updateSettings(userId, patch) {
  const allowed = ["sosAlerts", "lowBatteryAlerts", "geofenceAlerts"];
  const clean = {};
  for (const key of allowed) {
    if (key in patch) clean[key] = Boolean(patch[key]);
  }
  const data = await apiRequest("/users/me/settings", {
    method: "PATCH",
    body: clean,
  });
  return { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
}

export async function community() {
  const data = await apiRequest("/users/community");
  return data.users || [];
}