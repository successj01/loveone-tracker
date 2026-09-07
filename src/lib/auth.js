import { SESSION_KEY } from "@/utils/constants";

export function isBrowser() {
  return typeof window !== "undefined";
}

export function saveSession(session) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }
}

export function getSession() {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export function getToken() {
  const session = getSession();
  return session ? session.token : null;
}

export function getCurrentUserId() {
  const session = getSession();
  return session ? session.userId : null;
}

export function isAuthenticated() {
  return Boolean(getSession());
}