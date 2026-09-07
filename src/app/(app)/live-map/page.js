"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Link2, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLovedOnes } from "@/hooks/useLovedOnes";
import { useLocation } from "@/hooks/useLocation";
import UserAvatar from "@/components/UserAvatar";
import LocationStatus from "@/components/LocationStatus";
import SOSButton from "@/components/SOSButton";
import Loading from "@/components/Loading";
import { BASE_LAT, BASE_LNG } from "@/utils/constants";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[60vh] items-center justify-center rounded-2xl bg-zinc-100">
      <Loading text="Loading map…" />
    </div>
  ),
});

export default function LiveMapPage() {
  const { user } = useAuth();
  const { lovedOnes, loading } = useLovedOnes(user?.id);
  const { liveLocations, getPosition, sendSos } = useLocation();
  const [sosSending, setSosSending] = useState(false);

  const devices = useMemo(() => {
    if (!user) return [];
    const me = getPosition(user.id);
    const rows = [];
    rows.push({
      id: user.id,
      name: `${user.name}`,
      label: "You",
      kind: "me",
      color: "#2563eb",
      emoji: "🧿",
      lat: me ? me.lat : null,
      lng: me ? me.lng : null,
      ts: me ? me.ts : null,
      sharing: user.locationSharing,
    });
    for (const lo of lovedOnes) {
      const live = liveLocations[lo.person.id];
      const loc = live || lo.person.lastLocation;
      rows.push({
        id: lo.person.id,
        name: lo.person.name,
        label: lo.person.name,
        kind: "loved",
        color: lo.person.color,
        emoji: "❤",
        lat: loc ? loc.lat : null,
        lng: loc ? loc.lng : null,
        ts: live ? live.ts : (lo.person.lastLocation ? lo.person.lastLocation.ts : null),
        relationship: lo.relationship,
        sharing: lo.person.locationSharing,
      });
    }
    return rows;
  }, [user, lovedOnes, liveLocations, getPosition]);

  const markers = useMemo(
    () =>
      devices
        .filter((d) => d.lat != null && d.lng != null)
        .map((d) => ({
          id: d.id,
          lat: d.lat,
          lng: d.lng,
          label: d.label,
          color: d.color,
          emoji: d.emoji,
          me: d.kind === "me",
          pulse: d.kind === "me" && d.sharing,
        })),
    [devices]
  );

  const center = useMemo(() => {
    const first = markers[0];
    return first ? [first.lat, first.lng] : [BASE_LAT, BASE_LNG];
  }, [markers]);

  const handleSos = async () => {
    setSosSending(true);
    try {
      await sendSos();
    } finally {
      setSosSending(false);
    }
  };

  if (loading) return <Loading />;

  const anyOnMap = markers.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Live map</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Everyone&apos;s position, updating in real time.
          </p>
        </div>
        <SOSButton onPress={handleSos} disabled={sosSending} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          {anyOnMap ? (
            <MapView markers={markers} center={center} zoom={13} height="65vh" />
          ) : (
            <div className="flex h-[65vh] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white text-center">
              <Link2 className="h-10 w-10 text-zinc-300" />
              <p className="mt-4 text-sm font-semibold text-zinc-600">
                Nothing on the map yet
              </p>
              <p className="mt-1 max-w-xs text-sm text-zinc-400">
                Nobody you track is sharing a live location right now.
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-3">
          <h2 className="text-sm font-bold text-zinc-700">Devices</h2>
          <ul className="space-y-2">
            {devices.map((device) => (
              <li
                key={device.id}
                className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3"
              >
                <UserAvatar
                  name={device.name}
                  color={device.color}
                  size="md"
                  className={device.kind === "me" ? "ring-zinc-200" : ""}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-800">
                    {device.name}
                    {device.kind === "me" && (
                      <span className="ml-1.5 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">
                        You
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-zinc-400">
                    {device.kind === "me"
                      ? device.sharing
                        ? "Sharing my location"
                        : "Sharing paused"
                      : `${device.relationship || "Loved one"} · ${
                          device.sharing ? "sharing" : "paused"
                        }`}
                  </p>
                </div>
                <LocationStatus ts={device.ts} showWhen />
              </li>
            ))}
          </ul>
          <div className="flex items-start gap-2 rounded-2xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700">
            <UserRound className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              {devices.find((d) => d.kind === "me")?.sharing
                ? "Your loved ones can currently see your live position."
                : "You're not sharing your location. Turn it on in Settings so your family can see you."}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}