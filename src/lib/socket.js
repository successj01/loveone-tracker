import { io } from "socket.io-client";
import { API_BASE } from "@/lib/apiClient";
import { getToken } from "@/lib/auth";

let socket = null;
let tokenAtConnect = null;

function isBrowser() {
  return typeof window !== "undefined";
}

function buildSocket(token) {
  const instance = io(API_BASE, {
    auth: { token },
    autoConnect: false,
    transports: ["websocket", "polling"],
  });
  instance.on("connect_error", () => {
    // Transient failures are fine; socket.io will keep retrying.
  });
  instance.connect();
  return instance;
}

function ensureSocket() {
  if (!isBrowser()) return null;
  const token = getToken();
  if (!token) return null;

  if (socket && socket.connected && tokenAtConnect === token) return socket;

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  tokenAtConnect = token;
  socket = buildSocket(token);
  return socket;
}

function noop() {}

export function getSocket() {
  return ensureSocket() || { on: noop, off: noop, emit: noop, connected: false };
}

export function initRealtime() {
  return getSocket();
}

export function disconnectRealtime() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  tokenAtConnect = null;
}

export function onEvent(event, handler) {
  const target = ensureSocket();
  if (!target || typeof handler !== "function") return noop;
  target.on(event, handler);
  return () => target.off(event, handler);
}

export function emitEvent(event, payload) {
  const target = ensureSocket();
  if (!target) return;
  target.emit(event, payload);
}