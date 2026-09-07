import { useEffect } from "react";
import * as socketService from "@/services/socketService";

export function useSocket(event, handler) {
  useEffect(() => {
    if (!event || typeof handler !== "function") return;
    socketService.connect();
    const off = socketService.on(event, handler);
    return off;
  }, [event, handler]);
}

export function useLocationUpdates(handler) {
  return useSocket("location", handler);
}

export function useSos(handler) {
  return useSocket("sos", handler);
}

export function useNotifications(handler) {
  return useSocket("notification", handler);
}

export function useRequests(handler) {
  return useSocket("request", handler);
}