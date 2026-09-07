"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, History, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLovedOnes } from "@/hooks/useLovedOnes";
import * as locationService from "@/services/locationService";
import UserAvatar from "@/components/UserAvatar";
import Loading from "@/components/Loading";
import { formatTime, nearbyPOI, groupByDay, formatDayLabel } from "@/utils/helpers";
import { canViewHistory } from "@/utils/permissions";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[55vh] items-center justify-center rounded-2xl bg-zinc-100">
      <Loading text="Loading history…" />
    </div>
  ),
});

const RANGES = [
  { key: "24h", label: "Last 24 hours", hours: 24 },
  { key: "7d", label: "Last 7 days", hours: 24 * 7 },
];

export default function LocationHistoryPage() {
  const { user } = useAuth();
  const { lovedOnes, loading } = useLovedOnes(user?.id);

  const [personId, setPersonId] = useState(null);
  const [rangeKey, setRangeKey] = useState("24h");
  const [points, setPoints] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [cleared, setCleared] = useState(false);
  const initialRef = useRef(false);

  const lovedOne = lovedOnes.find((lo) => lo.person.id === personId);

  useEffect(() => {
    if (!loading && lovedOnes.length && !initialRef.current) {
      initialRef.current = true;
      const first = lovedOnes.find((lo) => canViewHistory(lo.permission));
      setPersonId(first ? first.person.id : lovedOnes[0].person.id);
    }
  }, [loading, lovedOnes]);

  const range = RANGES.find((r) => r.key === rangeKey);
  const rangeHours = range.hours;

  useEffect(() => {
    let cancelled = false;
    if (!personId) return;
    setHistoryLoading(true);
    setCleared(false);
    locationService
      .getHistory(personId, { limit: 250 })
      .then((rows) => {
        if (cancelled) return;
        const since = Date.now() - rangeHours * 3600000;
        setPoints(rows.filter((p) => p.createdAt >= since));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [personId, rangeKey, rangeHours, cleared]);

  const { polyline, markers, grouped } = useMemo(() => {
    if (!points.length) return { polyline: [], markers: [], grouped: [] };
    const line = points.map((p) => [p.lat, p.lng]);
    const first = points[0];
    const last = points[points.length - 1];

    let color = "#94a3b8";
    let emoji = "❤";
    let label = "Person";
    if (lovedOne) {
      color = lovedOne.person.color;
      label = lovedOne.person.name;
    }
    const markersArr = [];
    if (first) markersArr.push({ id: "start", lat: first.lat, lng: first.lng, color: "#059669", emoji: "🏁", label: "Start" });
    if (last) markersArr.push({ id: "end", lat: last.lat, lng: last.lng, color, emoji, label });
    return {
      polyline: [{ points: line, color }],
      markers: markersArr,
      grouped: groupByDay(points),
    };
  }, [points, lovedOne]);

  const handleClear = async () => {
    if (!personId) return;
    if (window.confirm("Clear this person's location history? This cannot be undone.")) {
      await locationService.clearHistory(personId);
      setCleared(true);
    }
  };

  if (loading) return <Loading />;

  const canHistory = canViewHistory(lovedOne?.permission);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Location history
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Where your loved ones have been, over time.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {lovedOne && (
            <label className="relative inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700">
              <UserAvatar name={lovedOne.person.name} color={lovedOne.person.color} size="xs" />
              <select
                value={personId || ""}
                onChange={(event) => setPersonId(event.target.value)}
                className="appearance-none bg-transparent pr-6 focus:outline-none"
              >
                {lovedOnes.map((lo) => (
                  <option key={lo.person.id} value={lo.person.id}>
                    {lo.person.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 h-4 w-4 text-zinc-400" />
            </label>
          )}
          <div className="flex rounded-xl border border-zinc-200 bg-white p-1">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRangeKey(r.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  rangeKey === r.key
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!lovedOne ? (
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <History className="mx-auto h-10 w-10 text-zinc-300" />
          <h2 className="mt-4 text-lg font-bold text-zinc-800">No history available</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Add a loved one who shares their location history to see it here.
          </p>
        </div>
      ) : !canHistory ? (
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <History className="mx-auto h-10 w-10 text-zinc-300" />
          <h2 className="mt-4 text-lg font-bold text-zinc-800">
            {lovedOne.person.name} shares live location only
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Ask them to upgrade their sharing permission to include history.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0">
            {historyLoading ? (
              <div className="flex h-[55vh] items-center justify-center rounded-2xl bg-zinc-100">
                <Loading text="Loading history…" />
              </div>
            ) : points.length === 0 ? (
              <div className="flex h-[55vh] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white text-center">
                <History className="h-10 w-10 text-zinc-300" />
                <p className="mt-4 text-sm font-semibold text-zinc-600">
                  No locations in the {range.label.toLowerCase()}
                </p>
                {cleared ? (
                  <p className="mt-1 text-sm text-zinc-400">
                    History for {lovedOne.person.name} was cleared.
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-zinc-400">
                    {lovedOne.person.name} hasn&apos;t shared any location updates here.
                  </p>
                )}
              </div>
            ) : (
              <MapView
                markers={markers}
                polylines={polyline}
                center={[polyline[0].points[0][0], polyline[0].points[0][1]]}
                zoom={14}
                height="55vh"
              />
            )}
          </div>

          <aside className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-700">Places visited</h2>
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>
            {historyLoading ? (
              <p className="text-sm text-zinc-400">Loading…</p>
            ) : grouped.length === 0 ? (
              <p className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-400">
                No recorded places in this range.
              </p>
            ) : (
              <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
                {grouped.map(([day, dayPoints]) => (
                  <div key={day}>
                    <p className="mb-1 px-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      {formatDayLabel(dayPoints[0].createdAt)} · {dayPoints.length}{" "}
                      {dayPoints.length === 1 ? "update" : "updates"}
                    </p>
                    <ul className="space-y-1.5">
                      {[...dayPoints].reverse().map((p) => {
                        const place = nearbyPOI(p.lat, p.lng);
                        return (
                          <li
                            key={p.id}
                            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2"
                          >
                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: lovedOne.person.color }}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-zinc-700">
                                {place || "Moving"}
                              </p>
                              <p className="text-xs text-zinc-400">
                                {p.lat.toFixed(4)}, {p.lng.toFixed(4)}
                              </p>
                            </div>
                            <span className="shrink-0 text-xs font-medium text-zinc-500">
                              {formatTime(p.createdAt)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}