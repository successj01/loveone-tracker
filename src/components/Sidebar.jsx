"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Heart,
  History,
  LayoutDashboard,
  LogOut,
  Map,
  MapPin,
  Settings,
  UserPlus,
  Users,
  X,
  Siren,
  Crown,
} from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { APP_NAME } from "@/utils/constants";
import { useLocation } from "@/hooks/useLocation";

const NAV_SECTIONS = [
  {
    label: "Track",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/loved-ones", label: "Loved ones", icon: Users },
      { href: "/live-map", label: "Live map", icon: MapPin },
      { href: "/location-history", label: "Location history", icon: History },
    ],
  },
  {
    label: "Alerts",
    items: [
      { href: "/requests", label: "Requests", icon: UserPlus },
      { href: "/notification", label: "Notifications", icon: Bell },
    ],
  },
  {
    label: "You",
    items: [
      { href: "/profile", label: "Profile", icon: Heart },
      { href: "/upgrade", label: "Upgrade", icon: Crown },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function Sidebar({ user, open = false, onClose, onLogout }) {
  const pathname = usePathname();
  const router = useRouter();
  const { sendSos } = useLocation();

  const handleSos = async () => {
    try {
      await sendSos();
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    if (window.confirm("Sign out of LoveOne Tracker?")) {
      onLogout?.();
      router.push("/login");
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-zinc-200 bg-white transition-transform duration-200 md:sticky md:top-0 md:h-screen md:w-64 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-100 px-4">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white">
              <Heart className="h-5 w-5" strokeWidth={2.4} />
            </span>
            <span className="text-base font-bold text-zinc-900">{APP_NAME}</span>
          </Link>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-500 hover:bg-zinc-100 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                {section.label}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                          active
                            ? "bg-rose-50 text-rose-600"
                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                        }`}
                      >
                        <Icon className="h-[18px] w-[18px]" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          <button
            type="button"
            onClick={handleSos}
            className="sos-pulse mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-700"
          >
            <Siren className="h-4 w-4" />
            Send SOS alert
          </button>
        </nav>

        <div className="border-t border-zinc-100 p-3">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <UserAvatar name={user?.name} color={user?.color} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-800">{user?.name}</p>
              <p className="truncate text-xs text-zinc-400">{user?.email}</p>
            </div>
            <button
              type="button"
              aria-label="Sign out"
              onClick={handleLogout}
              className="rounded-lg p-2 text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}