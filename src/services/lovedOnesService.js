import { apiRequest } from "@/lib/apiClient";

export async function listLovedOnes(ownerId) {
  if (!ownerId) return [];
  const data = await apiRequest("/loved-ones");
  return data.lovedOnes || [];
}

export async function getLovedOne(id) {
  const data = await apiRequest(`/loved-ones/${id}`);
  return data.lovedOne || null;
}

export async function findPersonByEmail(email) {
  const data = await apiRequest("/loved-ones/find", {
    query: { email: String(email || "").trim() },
  });
  return data.user || null;
}

export async function sendRequest({ toId, relationship, permission, message }) {
  if (!toId) throw new Error("Recipient is required.");
  const data = await apiRequest("/loved-ones/requests", {
    method: "POST",
    body: {
      toId,
      relationship,
      permission,
      message: String(message || "").trim(),
    },
  });
  return data.request;
}

export async function listRequests(userId) {
  const data = await apiRequest("/loved-ones/requests");
  return data.requests || [];
}

export async function respondRequest(requestId, accept) {
  const data = await apiRequest(`/loved-ones/requests/${requestId}`, {
    method: "POST",
    body: { accept: Boolean(accept) },
  });
  return data.request;
}

export async function cancelRequest(requestId) {
  await apiRequest(`/loved-ones/requests/${requestId}`, { method: "DELETE" });
}

export async function removeLovedOne(id) {
  await apiRequest(`/loved-ones/${id}`, { method: "DELETE" });
}

export async function areConnected(aId, bId) {
  const row = await listLovedOnes(aId);
  return row.some(
    (lo) => lo.person.id === bId || lo.ownerId === bId
  );
}