"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  HeartHandshake,
  MapPin,
  Plus,
  UserPlus,
  Users,
  Bell,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLovedOnes } from "@/hooks/useLovedOnes";
import { useLocation } from "@/hooks/useLocation";
import { useNotifications, useRequests } from "@/hooks/useSocket";
import * as notificationService from "@/services/notificationService";
import * as lovedOnesService from "@/services/lovedOnesService";
import UserAvatar from "@/components/UserAvatar";
import NotificationCard from "@/components/NotificationCard";
import SOSButton from "@/components/SOSButton";
import Loading from "@/components/Loading";
import { getLocationStatus } from "@/utils/helpers";

export default function DashboardPage() {
  const { user } = useAuth();
  const { lovedOnes, loading } = useLovedOnes(user?.id);
  const { liveLocations, sendSos } = useLocation();

  const [recentNotifs, setRecentNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [sosSending, setSosSending] = useState(false);

  const loadNotifs = async () => {
    if (!user) return;
    try {
      const rows = await notificationService.list(user.id);
      setRecentNotifs(rows.slice(0, 5));
      setUnread(rows.filter((n) => !n.read).length);
      const reqs = await lovedOnesService.listRequests(user.id);
      setPendingRequests(reqs.filter((r) => r.status === "pending").length);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadNotifs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useNotifications(() => {
    loadNotifs();
  });

  useRequests(() => {
    loadNotifs();
  });

  const liveNow = useMemo(
    () =>
      lovedOnes.filter((lo) => {
        const point = liveLocations[lo.person.id];
        const ts = point ? point.ts : lo.lastSeen;
        return getLocationStatus(ts).key === "online";
      }).length,
    [lovedOnes, liveLocations]
  );

  const stats = [
    { label: "Loved ones", value: lovedOnes.length, Icon: Users, href: "/loved-ones" },
    { label: "Live now", value: liveNow, Icon: MapPin, href: "/live-map" },
    { label: "Unread alerts", value: unread, Icon: Bell, href: "/notification" },
    { label: "Pending requests", value: pendingRequests, Icon: HeartHandshake, href: "/requests" },
  ];

  const handleSos = async () => {
    setSosSending(true);
    try {
      await sendSos();
    } finally {
      setSosSending(false);
    }
  };

  if (loading) return <Loading />;

  const firstName = (user?.name || "").split(" ")[0] || "there";

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-zinc-400">
            {new Date().toLocaleDateString([], {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Your loved ones are safe and moving around the city.
          </p>
        </div>
        <SOSButton onPress={handleSos} disabled={sosSending} />
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-rose-200 hover:shadow-sm"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xl font-bold text-zinc-900">{value}</p>
              <p className="text-xs font-medium text-zinc-500">{label}</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900">Your loved ones</h2>
            <Link
              href="/loved-ones"
              className="text-sm font-semibold text-rose-600 hover:text-rose-700"
            >
              View all
            </Link>
          </div>

          {lovedOnes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
              <Users className="mx-auto h-8 w-8 text-zinc-300" />
              <p className="mt-3 text-sm font-semibold text-zinc-600">
                No loved ones yet
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Add people you care about and start seeing their location.
              </p>
              <Link
                href="/add-loved-one"
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                <Plus className="h-4 w-4" />
                Add loved one
              </Link>
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {lovedOnes.slice(0, 4).map((lo) => {
                const point = liveLocations[lo.person.id];
                const ts = point ? point.ts : lo.lastSeen;
                const status = getLocationStatus(ts);
                return (
                  <li key={lo.id}>
                    <Link
                      href="/live-map"
                      className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-rose-200 hover:shadow-sm"
                    >
                      <UserAvatar name={lo.person.name} color={lo.person.color} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-zinc-800">
                          {lo.person.name}
                        </p>
                        <p className="text-xs text-zinc-400">{lo.relationship}</p>
                      </div>
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                          status.key === "online"
                            ? "bg-emerald-500"
                            : status.key === "idle"
                              ? "bg-amber-400"
                              : "bg-zinc-300"
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="flex flex-wrap gap-3">
            <Link
              href="/add-loved-one"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-rose-300 hover:text-rose-600"
            >
              <UserPlus className="h-4 w-4" />
              Add loved one
            </Link>
            <Link
              href="/live-map"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              <MapPin className="h-4 w-4" />
              Open live map
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900">Recent activity</h2>
            {unread > 0 && (
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-600">
                {unread} new
              </span>
            )}
          </div>
          {recentNotifs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-400">
              No activity yet.
            </div>
          ) : (
            <ul className="space-y-2">
              {recentNotifs.map((notif) => (
                <li key={notif.id}>
                  <NotificationCard
                    notification={notif}
                    onOpen={() => notificationService.markRead(notif.id).then(loadNotifs)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}