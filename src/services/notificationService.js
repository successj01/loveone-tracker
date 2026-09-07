import { apiRequest } from "@/lib/apiClient";
import { NOTIF_TYPES } from "@/utils/constants";

export async function list(userId) {
  const data = await apiRequest("/notifications");
  return data.notifications || [];
}

export async function unreadCount(userId) {
  const data = await apiRequest("/notifications/unread-count");
  return data.count || 0;
}

export async function markRead(id) {
  const data = await apiRequest(`/notifications/${id}/read`, { method: "POST" });
  return data.notification;
}

export async function markAllRead(userId) {
  const data = await apiRequest("/notifications/read-all", { method: "POST" });
  return data.count || 0;
}

export async function create({ userId, type = NOTIF_TYPES.system, title, body, link = null, actorId = null }) {
  if (!title) throw new Error("Title is required.");
  const data = await apiRequest("/notifications", {
    method: "POST",
    body: { type, title, body, link, actorId },
  });
  return data.notification;
}

export async function clearAll(userId) {
  await apiRequest("/notifications", { method: "DELETE" });
}

export async function getById(id) {
  const rows = await list();
  return rows.find((n) => n.id === id) || null;
}