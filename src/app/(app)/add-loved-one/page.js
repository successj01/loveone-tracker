"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Send, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import * as lovedOnesService from "@/services/lovedOnesService";
import * as userService from "@/services/userService";
import { validateLovedOneRequest } from "@/utils/validators";
import { PERMISSIONS, RELATIONSHIPS } from "@/utils/constants";
import UserAvatar from "@/components/UserAvatar";

export default function AddLovedOnePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    relationship: RELATIONSHIPS[0],
    permission: "history",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [community, setCommunity] = useState([]);

  useEffect(() => {
    if (!user) return;
    userService.community().then(setCommunity).catch(() => {});
  }, [user]);

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateLovedOneRequest(form);
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length) return;

    const target = await lovedOnesService.findPersonByEmail(form.email).catch(() => null);
    if (!target) {
      setFormError(
        "No LoveOne account found with that email. Invite a person listed below."
      );
      return;
    }

    setSubmitting(true);
    try {
      await lovedOnesService.sendRequest({
        fromId: user.id,
        toId: target.id,
        relationship: form.relationship,
        permission: form.permission,
        message: form.message,
      });
      setSent(true);
    } catch (error) {
      setFormError(error.message || "Unable to send the request.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = (key) =>
    `w-full rounded-xl border px-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 ${
      errors[key]
        ? "border-red-300 focus:ring-red-100"
        : "border-zinc-200 focus:border-rose-400 focus:ring-rose-100"
    }`;

  if (sent) {
    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
        <h1 className="mt-4 text-2xl font-bold text-zinc-900">Request sent!</h1>
        <p className="mt-2 text-sm text-zinc-500">
          {form.email} will be asked to share their location with you. As soon as
          they accept, they&apos;ll appear on your live map.
        </p>
        <button
          type="button"
          onClick={() => router.push("/requests")}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-700"
        >
          View your requests
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Add a loved one
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Ask a person to share their location with you. They need to accept the
          request first.
        </p>
      </div>

      {formError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {formError}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-6"
        noValidate
      >
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Their email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={setField("email")}
            placeholder="person@love.app"
            className={inputCls("email")}
          />
          {errors.email && (
            <p className="mt-1 text-xs font-medium text-red-500">{errors.email}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Relationship
            </label>
            <select
              value={form.relationship}
              onChange={setField("relationship")}
              className={`${inputCls("relationship")} appearance-none`}
            >
              {RELATIONSHIPS.map((rel) => (
                <option key={rel} value={rel}>
                  {rel}
                </option>
              ))}
            </select>
            {errors.relationship && (
              <p className="mt-1 text-xs font-medium text-red-500">
                {errors.relationship}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              What they share
            </label>
            <select
              value={form.permission}
              onChange={setField("permission")}
              className={`${inputCls("permission")} appearance-none`}
            >
              {PERMISSIONS.map((perm) => (
                <option key={perm.value} value={perm.value}>
                  {perm.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Message <span className="font-normal normal-case text-zinc-400">(optional)</span>
          </label>
          <textarea
            value={form.message}
            onChange={setField("message")}
            rows={3}
            placeholder="Hey! Would you be ok sharing your live location with me?"
            className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {submitting ? "Sending request…" : "Send location request"}
        </button>
      </form>

      {community.length > 0 && (
        <section>
          <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-zinc-700">
            <Users className="h-4 w-4 text-zinc-400" />
            People you can invite in the demo
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {community.map((member) => (
              <li key={member.id}>
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, email: member.email }))
                  }
                  className="flex w-full items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 text-left transition hover:border-rose-300"
                >
                  <UserAvatar name={member.name} color={member.color} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-800">
                      {member.name}
                    </p>
                    <p className="truncate text-xs text-zinc-400">{member.email}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}