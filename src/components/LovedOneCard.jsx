import Link from "next/link";
import { History, MapPinned, Trash2, Users } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import LocationStatus from "@/components/LocationStatus";
import { formatDistance, haversineMeters } from "@/utils/helpers";
import { permissionLabel } from "@/utils/permissions";

export default function LovedOneCard({
  lovedOne,
  viewerLocation = null,
  onRemove,
  className = "",
}) {
  const person = lovedOne.person || {};
  const canHistory = lovedOne.permission === "history";
  const distance =
    lovedOne.lastSeen && viewerLocation
      ? haversineMeters(
          viewerLocation.lat,
          viewerLocation.lng,
          person.lastLocation?.lat,
          person.lastLocation?.lng
        )
      : null;

  return (
    <article
      className={`group flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-rose-200 hover:shadow-md ${className}`}
    >
      <div className="flex items-start gap-3">
        <UserAvatar name={person.name} color={person.color} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-zinc-800">
              {person.name}
            </h3>
            {!person.locationSharing && (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                Paused
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-500">{lovedOne.relationship}</p>
        </div>
        <button
          type="button"
          aria-label={`Remove ${person.name}`}
          onClick={onRemove}
          className="rounded-full p-2 text-zinc-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <LocationStatus ts={lovedOne.lastSeen} showWhen />
        <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
          <History className="h-3 w-3" />
          {permissionLabel(lovedOne.permission)}
        </span>
      </div>

      {distance != null && (
        <p className="text-xs text-zinc-400">
          About <span className="font-semibold text-zinc-600">{formatDistance(distance)}</span>{" "}
          from you
        </p>
      )}

      <div className="mt-auto flex gap-2 border-t border-zinc-100 pt-3">
        <Link
          href="/live-map"
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-zinc-700"
        >
          <MapPinned className="h-3.5 w-3.5" />
          Live map
        </Link>
        {canHistory ? (
          <Link
            href="/location-history"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:border-rose-300 hover:text-rose-600"
          >
            <History className="h-3.5 w-3.5" />
            History
          </Link>
        ) : (
          <span
            title="This person only shares live location"
            className="inline-flex flex-1 cursor-not-allowed items-center justify-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-300"
          >
            <Users className="h-3.5 w-3.5" />
            History
          </span>
        )}
      </div>
    </article>
  );
}