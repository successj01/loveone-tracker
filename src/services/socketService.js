import { EVENTS } from "@/utils/constants";
import { getSocket, initRealtime, disconnectRealtime, onEvent, emitEvent } from "@/lib/socket";

export function connect() {
  initRealtime();
}

export function disconnect() {
  disconnectRealtime();
}

export function emitLocation(userId, location) {
  emitEvent(EVENTS.LOCATION, { userId, location });
}

export function onLocationUpdate(handler) {
  return onEvent(EVENTS.LOCATION, handler);
}

export function emitSos(payload) {
  emitEvent(EVENTS.SOS, payload);
}

export function onSos(handler) {
  return onEvent(EVENTS.SOS, handler);
}

export function emitNotification(payload) {
  emitEvent(EVENTS.NOTIFICATION, payload);
}

export function onNotification(handler) {
  return onEvent(EVENTS.NOTIFICATION, handler);
}

export function emitRequest(payload) {
  emitEvent(EVENTS.REQUEST, payload);
}

export function onRequest(handler) {
  return onEvent(EVENTS.REQUEST, handler);
}

export function on(event, handler) {
  return onEvent(event, handler);
}

export function off(event, handler) {
  getSocket().off(event, handler);
}

export function emit(event, payload) {
  emitEvent(event, payload);
}