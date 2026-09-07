"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownToLine, ArrowUpFromLine, Check, Plus, UserPlus, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRequests } from "@/hooks/useSocket";
import { useLovedOnes } from "@/hooks/useLovedOnes";
import * as lovedOnesService from "@/services/lovedOnesService";
import UserAvatar from "@/components/UserAvatar";
import Loading from "@/components/Loading";
import { formatRelative, formatDateTime } from "@/utils/helpers";
import { permissionLabel } from "@/utils/permissions";

function EmptyState({ icon: Icon, title, text, children }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
      <Icon className="mx-auto h-8 w-8 text-zinc-300" />
      <p className="mt-3 text-sm font-semibold text-zinc-600">{title}</p>
      <p className="mt-1 text-sm text-zinc-400">{text}</p>
      {children}
    </div>
  );
}

export default function RequestsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { refresh } = useLovedOnes(user?.id);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const rows = await lovedOnesService.listRequests(user.id);
      setRequests(rows);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  useRequests(() => load());

  const incoming = requests.filter((r) => r.toId === user?.id);
  const outgoing = requests.filter((r) => r.fromId === user?.id);

  const handleRespond = async (request, accept) => {
    setBusyId(request.id);
    try {
      await lovedOnesService.respondRequest(request.id, accept);
      await Promise.all([load(), refresh()]);
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async (request) => {
    setBusyId(request.id);
    try {
      await lovedOnesService.cancelRequest(request.id);
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const renderCard = (request) => {
    const isIncoming = request.toId === user?.id;
    const person = isIncoming ? request.from : request.to;
    const otherName = person ? person.name : "Someone";
    const pending = request.status === "pending";

    return (
      <li
        key={request.id}
        className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
      >
        <div className="flex items-start gap-3">
          <UserAvatar name={person?.name} color={person?.color} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold text-zinc-800">{otherName}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  request.status === "accepted"
                    ? "bg-emerald-100 text-emerald-600"
                    : request.status === "declined"
                      ? "bg-zinc-100 text-zinc-500"
                      : "bg-amber-100 text-amber-600"
                }`}
              >
                {request.status}
              </span>
              <span className="text-xs text-zinc-400">
                {formatRelative(request.createdAt)}
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              {isIncoming ? "wants to see your location" : "you asked them to share"} ·{" "}
              {request.relationship} · {permissionLabel(request.permission)}
            </p>
            {request.message && (
              <p className="mt-1.5 rounded-lg bg-zinc-50 px-3 py-2 text-xs italic text-zinc-500">
                “{request.message}”
              </p>
            )}
          </div>
        </div>

        {pending && (
          <div className="mt-3 flex gap-2 border-t border-zinc-100 pt-3">
            {isIncoming ? (
              <>
                <button
                  type="button"
                  disabled={busyId === request.id}
                  onClick={() => handleRespond(request, true)}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                  Accept
                </button>
                <button
                  type="button"
                  disabled={busyId === request.id}
                  onClick={() => handleRespond(request, false)}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-bold text-zinc-600 transition hover:border-red-300 hover:text-red-500 disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Decline
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={busyId === request.id}
                onClick={() => handleCancel(request)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-bold text-zinc-600 transition hover:border-red-300 hover:text-red-500 disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
                Cancel request
              </button>
            )}
          </div>
        )}
      </li>
    );
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Location requests
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Approve or decline who can see your location.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/add-loved-one")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-600/25 hover:bg-rose-700"
        >
          <Plus className="h-4 w-4" />
          New request
        </button>
      </div>

      <section>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-zinc-700">
          <ArrowDownToLine className="h-4 w-4 text-zinc-400" />
          Incoming
        </h2>
        {incoming.length === 0 ? (
          <EmptyState
            icon={ArrowDownToLine}
            title="No incoming requests"
            text="People who ask to see your location will appear here."
          />
        ) : (
          <ul className="space-y-2.5">{incoming.map(renderCard)}</ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-zinc-700">
          <ArrowUpFromLine className="h-4 w-4 text-zinc-400" />
          Outgoing
        </h2>
        {outgoing.length === 0 ? (
          <EmptyState
            icon={UserPlus}
            title="No outgoing requests"
            text="Requests you've sent to family and friends will appear here."
          />
        ) : (
          <ul className="space-y-2.5">{outgoing.map(renderCard)}</ul>
        )}
      </section>
    </div>
  );
}
