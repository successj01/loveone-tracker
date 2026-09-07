import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  HeartPulse,
  MapPin,
  Send,
  UserPlus,
} from "lucide-react";
import { formatRelative } from "@/utils/helpers";
import { NOTIF_TYPES } from "@/utils/constants";

const ICON_BY_TYPE = {
  [NOTIF_TYPES.location]: { Icon: MapPin, cls: "bg-emerald-100 text-emerald-600" },
  [NOTIF_TYPES.alert]: { Icon: AlertTriangle, cls: "bg-amber-100 text-amber-600" },
  [NOTIF_TYPES.request]: { Icon: UserPlus, cls: "bg-blue-100 text-blue-600" },
  [NOTIF_TYPES.sos]: { Icon: HeartPulse, cls: "bg-red-100 text-red-600" },
  [NOTIF_TYPES.system]: { Icon: Bell, cls: "bg-zinc-100 text-zinc-600" },
};

export default function NotificationCard({ notification, onOpen, className = "" }) {
  const { Icon, cls } = ICON_BY_TYPE[notification.type] || ICON_BY_TYPE[NOTIF_TYPES.system];

  const body = (
    <div
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
        notification.read
          ? "border-zinc-200 bg-white hover:border-zinc-300"
          : "border-rose-200 bg-rose-50 hover:border-rose-300"
      } ${className}`}
      onClick={onOpen}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cls}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-zinc-800">
            {notification.title}
            {!notification.read && (
              <span className="ml-2 inline-block h-2 w-2 shrink-0 rounded-full bg-rose-500" />
            )}
          </p>
          <span className="shrink-0 text-xs text-zinc-400">
            {formatRelative(notification.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-zinc-500">{notification.body}</p>
      </div>
      {notification.link ? (
        <span className="hidden shrink-0 items-center text-xs font-medium text-rose-600 sm:inline-flex">
          <Send className="h-3.5 w-3.5" />
        </span>
      ) : null}
    </div>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} onClick={onOpen}>
        {body}
      </Link>
    );
  }
  return body;
}