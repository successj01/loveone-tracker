"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLovedOnes } from "@/hooks/useLovedOnes";
import { useLocation } from "@/hooks/useLocation";
import LovedOneCard from "@/components/LovedOneCard";
import SearchBar from "@/components/SearchBar";
import Loading from "@/components/Loading";

export default function LovedOnesPage() {
  const { user } = useAuth();
  const { lovedOnes, loading, remove } = useLovedOnes(user?.id);
  const { getPosition } = useLocation();
  const [query, setQuery] = useState("");

  const filtered = lovedOnes.filter((lo) =>
    (lo.person.name || "").toLowerCase().includes(query.toLowerCase())
  );

  const viewerLocation = user ? getPosition(user.id) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Loved ones
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Everyone you&apos;re connected to, and their live status.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search loved ones…"
            className="w-full sm:w-56"
          />
          <Link
            href="/add-loved-one"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-600/25 transition hover:bg-rose-700"
          >
            <Plus className="h-4 w-4" />
            Add loved one
          </Link>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <Users className="mx-auto h-10 w-10 text-zinc-300" />
          <h2 className="mt-4 text-lg font-bold text-zinc-800">
            {lovedOnes.length === 0 ? "No loved ones yet" : "No matches found"}
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">
            {lovedOnes.length === 0
              ? "Add someone you care about and they'll appear here as soon as they accept your request."
              : `Try a different name — “${query}” didn't match anyone.`}
          </p>
          {lovedOnes.length === 0 && (
            <Link
              href="/add-loved-one"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-700"
            >
              <Plus className="h-4 w-4" />
              Add your first loved one
            </Link>
          )}
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((lo) => (
            <li key={lo.id}>
              <LovedOneCard
                lovedOne={lo}
                viewerLocation={viewerLocation}
                onRemove={async () => {
                  if (window.confirm(`Stop tracking ${lo.person.name}?`)) {
                    await remove(lo.id);
                  }
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}