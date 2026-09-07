import { apiRequest } from "@/lib/apiClient";

export async function pushLocation({ userId, lat, lng, battery, source = "gps", createdAt = Date.now() }) {
  const data = await apiRequest("/locations", {
    method: "POST",
    body: {
      userId,
      lat,
      lng,
      battery,
      source,
      createdAt,
    },
  });
  return data.location;
}

export async function getHistory(userId, { limit } = {}) {
  const data = await apiRequest(`/locations/history/${userId}`, {
    query: limit ? { limit } : undefined,
  });
  return data.locations || [];
}

export async function clearHistory(userId) {
  await apiRequest("/locations/history", {
    method: "DELETE",
    query: { userId },
  });
}

export async function getLatestForUsers(ids) {
  if (!ids || !ids.length) return {};
  const data = await apiRequest("/locations/latest", {
    query: { ids },
  });
  return data.locations || {};
}

export async function getPersonLocation(userId) {
  const data = await apiRequest(`/locations/${userId}`);
  return data.location || null;
}