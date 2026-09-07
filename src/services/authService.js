import { apiRequest } from "@/lib/apiClient";
import { getSession, saveSession, clearSession } from "@/lib/auth";
import { disconnectRealtime } from "@/lib/socket";

export function publicUser(user) {
  if (!user) return null;
  return user;
}

function createSession({ userId, token }) {
  saveSession({ userId, token, createdAt: Date.now() });
}

export async function register({ name, email, password, phone }) {
  const data = await apiRequest("/auth/register", {
    method: "POST",
    body: {
      name,
      email: String(email || "").trim(),
      password,
      phone: String(phone || "").trim(),
    },
  });
  createSession({ userId: data.user.id, token: data.token });
  return publicUser(data.user);
}

export async function login(email, password) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: { email: String(email || "").trim(), password },
  });
  createSession({ userId: data.user.id, token: data.token });
  return publicUser(data.user);
}

export function logout() {
  disconnectRealtime();
  clearSession();
}

export async function getCurrentUser() {
  const session = getSession();
  if (!session || !session.token) return null;
  try {
    const data = await apiRequest("/auth/me");
    return data.user || null;
  } catch (error) {
    if (error.status === 401) clearSession();
    return null;
  }
}

export function hasSession() {
  return Boolean(getSession());
}

export async function touchUserActivity() {}