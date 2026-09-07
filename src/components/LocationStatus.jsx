import { MapPin } from "lucide-react";
import { formatRelative, getLocationStatus } from "@/utils/helpers";

const STYLES = {
  online: "bg-emerald-500 text-white",
  idle: "bg-amber-400 text-white",
  offline: "bg-zinc-400 text-white",
};

const DOT = {
  online: "bg-emerald-500",
  idle: "bg-amber-500",
  offline: "bg-zinc-400",
};

export default function LocationStatus({ ts, showWhen = false }) {
  const status = getLocationStatus(ts);

  if (!showWhen && !ts) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400">
        <MapPin className="h-3.5 w-3.5" />
        No location data
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        STYLES[status.key]
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[status.key]} ${status.key === "online" ? "animate-pulse" : ""}`} />
      {status.label}
      {ts ? <span className="font-normal opacity-80">· {formatRelative(ts)}</span> : null}
    </span>
  );
}