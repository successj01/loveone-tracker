"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlarmClock,
  Heart,
  HeartPulse,
  MapPinned,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { APP_NAME } from "@/utils/constants";

const FEATURES = [
  {
    Icon: MapPinned,
    title: "Live location sharing",
    text: "See your loved ones move in real time on a beautiful map.",
  },
  {
    Icon: HeartPulse,
    title: "One-tap SOS",
    text: "Send an emergency alert with your location to everyone who matters.",
  },
  {
    Icon: AlarmClock,
    title: "Location history",
    text: "Revisit where everyone has been over the last 24 hours.",
  },
  {
    Icon: ShieldCheck,
    title: "Safe zones",
    text: "Get notified the moment someone reaches home, work or school.",
  },
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-6 md:px-10">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md shadow-rose-600/30">
            <Heart className="h-6 w-6" strokeWidth={2.4} />
          </span>
          <span className="text-lg font-bold tracking-tight text-zinc-900">
            {APP_NAME}
          </span>
        </div>
        <nav className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 pb-16 text-center">
        <span className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 ring-1 ring-rose-100">
          <HeartPulse className="h-3.5 w-3.5" />
          Keep the ones you love close
        </span>
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-zinc-900 sm:text-5xl">
          Never wonder where
          <span className="block text-rose-600">they are again.</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-zinc-500">
          {APP_NAME} lets your family share locations effortlessly — a private
          live map with SOS alerts and location history for the people who
          matter most.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register"
            className="rounded-full bg-rose-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-rose-600/30 transition hover:bg-rose-700"
          >
            Create an account
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-zinc-300 bg-white px-7 py-3 text-sm font-bold text-zinc-700 transition hover:border-rose-300 hover:text-rose-600"
          >
            Sign in
          </Link>
        </div>
        <p className="mt-4 text-xs text-zinc-400">
          Try the demo account: <code className="rounded bg-zinc-100 px-1.5 py-0.5">demo@lovetracker.app</code> /{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5">demo123</code>
        </p>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-4 px-6 pb-16 sm:grid-cols-2">
        {FEATURES.map(({ Icon, title, text }) => (
          <div
            key={title}
            className="flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-800">{title}</h3>
              <p className="mt-1 text-sm text-zinc-500">{text}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}