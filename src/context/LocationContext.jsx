"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as socketService from "@/services/socketService";
import * as locationService from "@/services/locationService";
import * as lovedOnesService from "@/services/lovedOnesService";
import * as notificationService from "@/services/notificationService";
import { BASE_LAT, BASE_LNG, LOCATION_TICK_MS, NOTIF_TYPES } from "@/utils/constants";
import { jitter, nearbyPOI, randomBattery, rand } from "@/utils/helpers";
import { useAuthContext } from "@/context/AuthContext";

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const { user } = useAuthContext();

  const [liveLocations, setLiveLocations] = useState({});
  const [sosState, setSosState] = useState(null);

  const liveLocationsRef = useRef({});
  const userRef = useRef(user);
  const posRef = useRef(null);
  const watchIdRef = useRef(null);
  const tickingRef = useRef(false);

  useEffect(() => {
    liveLocationsRef.current = liveLocations;
  }, [liveLocations]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const stopGeolocation = useCallback(() => {
    if (watchIdRef.current != null && typeof window !== "undefined" && window.navigator.geolocation) {
      window.navigator.geolocation.clearWatch(watchIdRef.current);
    }
    watchIdRef.current = null;
    posRef.current = null;
  }, []);

  const startGeolocation = useCallback(() => {
    stopGeolocation();
    if (typeof window === "undefined" || !window.navigator || !window.navigator.geolocation) return;
    watchIdRef.current = window.navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        posRef.current = { lat: latitude, lng: longitude };
        const current = userRef.current;
        if (current && current.locationSharing) {
          const now = Date.now();
          const loc = { lat: latitude, lng: longitude, ts: now };
          locationService.pushLocation({
            userId: current.id,
            lat: latitude,
            lng: longitude,
            battery: randomBattery(),
            source: "gps",
            createdAt: now,
          }).catch(() => {});
          socketService.emitLocation(current.id, loc);
          setLiveLocations((prev) => ({ ...prev, [current.id]: { lat: latitude, lng: longitude, ts: now } }));
        }
      },
      () => {
        posRef.current = null;
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
  }, [stopGeolocation]);

  // Subscribe to location / sos events from the mock realtime bus.
  useEffect(() => {
    socketService.connect();
    const offLocation = socketService.onLocationUpdate(({ userId, location }) => {
      if (!userId || !location) return;
      setLiveLocations((prev) => ({
        ...prev,
        [userId]: { lat: location.lat, lng: location.lng, ts: location.ts || Date.now() },
      }));
    });
    const offSos = socketService.onSos((payload) => {
      if (!payload) return;
      setSosState({ at: payload.at || Date.now(), recipients: payload.recipients || [], from: payload.userId });
    });
    return () => {
      offLocation();
      offSos();
      stopGeolocation();
    };
  }, [stopGeolocation, user?.id]);

  // Hydrate current positions + (re)start the simulator when the auth user changes.
  useEffect(() => {
    if (!user) {
      setLiveLocations({});
      stopGeolocation();
      return;
    }
    let cancelled = false;

    async function hydrate() {
      try {
        const lovedOnes = await lovedOnesService.listLovedOnes(user.id);
        const ids = [user.id, ...lovedOnes.map((lo) => lo.person.id)];
        const refs = await locationService.getLatestForUsers(ids);
        if (cancelled) return;
        const map = {};
        for (const id of ids) {
          if (refs[id]) map[id] = { lat: refs[id].lat, lng: refs[id].lng, ts: refs[id].createdAt };
        }
        if (user.lastLocation && !map[user.id]) {
          map[user.id] = { lat: user.lastLocation.lat, lng: user.lastLocation.lng, ts: user.lastLocation.ts };
        }
        setLiveLocations((prev) => ({ ...map, ...prev }));
      } catch {
        // ignore hydrate errors
      }
    }

    hydrate();

    if (user.locationSharing) startGeolocation();
    else stopGeolocation();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.locationSharing]);

  const tick = useCallback(async () => {
    const current = userRef.current;
    if (!current || tickingRef.current) return;
    tickingRef.current = true;
    try {
      let myLoc = null;
      if (current.locationSharing && !posRef.current) {
        const baseLive = liveLocationsRef.current[current.id];
        const base =
          baseLive ||
          current.lastLocation ||
          { lat: BASE_LAT, lng: BASE_LNG };
        const next = jitter(base.lat, base.lng, 0.0007);
        myLoc = { lat: next.lat, lng: next.lng, ts: Date.now() };
        locationService.pushLocation({
          userId: current.id,
          lat: next.lat,
          lng: next.lng,
          battery: randomBattery(),
          source: "sim",
        }).catch(() => {});
        socketService.emitLocation(current.id, myLoc);
        setLiveLocations((prev) => ({ ...prev, [current.id]: { lat: next.lat, lng: next.lng, ts: myLoc.ts } }));
      }

      const lovedOnes = await lovedOnesService.listLovedOnes(current.id);
      if (!lovedOnes.length) return;

      for (const lo of lovedOnes) {
        const person = lo.person;
        if (!person || person.locationSharing === false) continue;
        const live = liveLocationsRef.current[person.id];
        const base =
          live ||
          person.lastLocation ||
          { lat: BASE_LAT, lng: BASE_LNG };
        const next = jitter(base.lat, base.lng, 0.0007);
        const now = Date.now();
        locationService.pushLocation({
          userId: person.id,
          lat: next.lat,
          lng: next.lng,
          battery: randomBattery(),
          source: "sim",
        }).catch(() => {});

        socketService.emitLocation(person.id, { lat: next.lat, lng: next.lng, ts: now });
        setLiveLocations((prev) => ({
          ...prev,
          [person.id]: { lat: next.lat, lng: next.lng, ts: now },
        }));

        // Occasionally generate an ambient notification so the app feels alive.
        if (Math.random() < 0.025) {
          const poi = nearbyPOI(next.lat, next.lng);
          if (poi) {
            notificationService.create({
              userId: current.id,
              type: NOTIF_TYPES.location,
              title: `${person.name} arrived at ${poi}`,
              body: `${person.name} is around ${poi} right now.`,
              link: "/live-map",
              actorId: person.id,
            }).catch(() => {});
          }
        }
      }
    } catch {
      // ignore tick errors
    } finally {
      tickingRef.current = false;
    }
  }, []);

  // Simulate movement for tracked loved ones + own position fallback.
  useEffect(() => {
    if (!user) return;
    const timer = setInterval(() => {
      tick();
    }, LOCATION_TICK_MS);
    return () => clearInterval(timer);
  }, [user, tick]);

  const sendSos = useCallback(async () => {
    const current = userRef.current;
    if (!current) return { recipients: [] };
    const lovedOnes = await lovedOnesService.listLovedOnes(current.id);
    const recipients = lovedOnes.map((lo) => lo.person.id);

    const location =
      posRef.current ||
      liveLocationsRef.current[current.id] ||
      { lat: BASE_LAT, lng: BASE_LNG };

    for (const recipientId of recipients) {
      notificationService.create({
        userId: recipientId,
        type: NOTIF_TYPES.sos,
        title: `SOS alert from ${current.name}`,
        body: `${current.name} triggered an SOS alert. Tap to view their location.`,
        link: "/live-map",
        actorId: current.id,
      }).catch(() => {});
    }

    await notificationService.create({
      userId: current.id,
      type: NOTIF_TYPES.system,
      title: "SOS alert sent",
      body: `Your SOS alert was delivered to ${recipients.length || "your"} contact${recipients.length === 1 ? "" : "s"}.`,
      link: "/notification",
      actorId: current.id,
    });

    socketService.emitSos({
      userId: current.id,
      at: Date.now(),
      recipients,
      location,
    });

    setSosState({ at: Date.now(), recipients, from: current.id });
    return { recipients, location };
  }, []);

  const clearSos = useCallback(() => setSosState(null), []);

  const removeTrackedLocation = useCallback((userId) => {
    setLiveLocations((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      liveLocations,
      sosState,
      sendSos,
      clearSos,
      removeTrackedLocation,
      getPosition: (userId) => liveLocationsRef.current[userId] || null,
    }),
    [liveLocations, sosState, sendSos, clearSos, removeTrackedLocation]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationContext() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocationContext must be used within LocationProvider");
  return ctx;
}