"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell, Menu } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { APP_NAME } from "@/utils/constants";

export default function Navbar({ user, unread = 0, onMenu }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur md:px-6">
      <button
        type="button"
        aria-label="Open navigation"
        onClick={onMenu}
        className="rounded-xl p-2 text-zinc-600 hover:bg-zinc-100 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Link href="/dashboard" className="flex items-center gap-2">
        <Image
          src="/images/logo.svg"
          alt={`${APP_NAME} logo`}
          width={36}
          height={36}
          unoptimized
          className="h-9 w-9 rounded-xl shadow-sm shadow-rose-600/30"
        />
        <span className="hidden text-base font-bold tracking-tight text-zinc-900 sm:block">
          {APP_NAME}
        </span>
      </Link>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <Link
          href="/notification"
          aria-label="Notifications"
          className="relative rounded-xl p-2 text-zinc-600 transition hover:bg-zinc-100"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>
        <Link
          href="/profile"
          aria-label="Profile"
          className="rounded-xl p-1 transition hover:bg-zinc-100"
        >
          <UserAvatar name={user?.name} color={user?.color} size="sm" />
        </Link>
      </div>
    </header>
  );
}