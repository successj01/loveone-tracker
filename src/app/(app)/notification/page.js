"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellRing, CheckCheck, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications, useRequests } from "@/hooks/useSocket";
import * as notificationService from "@/services/notificationService";
import NotificationCard from "@/components/NotificationCard";
import Loading from "@/components/Loading";

export default function NotificationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!user) return;
    try {
      const rows = await notificationService.list(user.id);
      setNotifications(rows);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useNotifications(() => refresh());
  useRequests(() => refresh());

  const unread = notifications.filter((n) => !n.read).length;

  const openNotification = (notif) => {
    if (!notif.read) {
      notificationService.markRead(notif.id).then(refresh);
    }
    if (notif.link) router.push(notif.link);
  };

  const markAll = async () => {
    await notificationService.markAllRead(user.id);
    await refresh();
  };

  const clearAll = async () => {
    if (window.confirm("Delete all notifications?")) {
      await notificationService.clearAll(user.id);
      await refresh();
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-zinc-900">
            <Bell className="h-6 w-6 text-rose-500" />
            Notifications
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {unread > 0
              ? `${unread} unread notification${unread === 1 ? "" : "s"}`
              : "You're all caught up."}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={markAll}
            disabled={unread === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:border-rose-300 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={notifications.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:border-red-300 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </button>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : notifications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <BellRing className="mx-auto h-10 w-10 text-zinc-300" />
          <h2 className="mt-4 text-lg font-bold text-zinc-800">No notifications yet</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Arrivals, low battery alerts and SOS activity will show up here.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {notifications.map((notif) => (
            <li key={notif.id}>
              <NotificationCard
                notification={notif}
                onOpen={() => openNotification(notif)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}