"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Camera, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePlan } from "@/hooks/usePlan";
import * as userService from "@/services/userService";
import UserAvatar from "@/components/UserAvatar";
import PremiumBadge from "@/components/PremiumBadge";
import { AVATAR_COLORS } from "@/utils/constants";
import { validateProfile } from "@/utils/validators";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { isPremium, loading: planLoading } = usePlan();
  const [form, setForm] = useState({ name: "", phone: "", bio: "", color: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        bio: user.bio || "",
        color: user.color || AVATAR_COLORS[0],
      });
    }
  }, [user]);

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateProfile(form);
    setErrors(nextErrors);
    setStatus("");
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
        bio: form.bio.trim(),
        color: form.color,
      });
      setStatus("Profile saved.");
    } catch (error) {
      setStatus(error.message || "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const inputCls = (key) =>
    `w-full rounded-xl border px-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 ${
      errors[key]
        ? "border-red-300 focus:ring-red-100"
        : "border-zinc-200 focus:border-rose-400 focus:ring-rose-100"
    }`;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Profile</h1>
        <p className="mt-1 text-sm text-zinc-500">
          How your loved ones see you.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-6"
        noValidate
      >
        <div className="flex items-center gap-4">
          <UserAvatar name={form.name || user.name} color={form.color} size="xl" />
          <div>
            <p className="text-sm font-semibold text-zinc-800">
              {form.name || "Your name"}
            </p>
            <p className="inline-flex items-center gap-1 text-xs text-zinc-400">
              <Camera className="h-3 w-3" />
              Trusted by {user.email}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Full name
            </label>
            <input value={form.name} onChange={setField("name")} className={inputCls("name")} />
            {errors.name && (
              <p className="mt-1 text-xs font-medium text-red-500">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Phone
            </label>
            <input
              value={form.phone}
              onChange={setField("phone")}
              placeholder="+1 555 0100"
              className={inputCls("phone")}
            />
            {errors.phone && (
              <p className="mt-1 text-xs font-medium text-red-500">{errors.phone}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Bio
          </label>
          <textarea
            value={form.bio}
            onChange={setField("bio")}
            rows={3}
            placeholder="A short note your family can see…"
            className="w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Avatar color
          </label>
          <div className="flex flex-wrap gap-2">
            {AVATAR_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Use color ${color}`}
                onClick={() => setForm((prev) => ({ ...prev, color }))}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
                  form.color === color ? "ring-2 ring-zinc-900 ring-offset-2" : "hover:scale-105"
                }`}
                style={{ backgroundColor: color }}
              >
                {form.color === color && <CheckIcon />}
              </button>
            ))}
          </div>
        </div>

        {status && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-600">
            {status}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-600/25 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6">
        <p className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
          <BadgeCheck className="h-4 w-4 text-emerald-500" />
          Account
        </p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-zinc-400">Email</dt>
            <dd className="font-medium text-zinc-700">{user.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-400">Plan</dt>
            <dd>
              <PremiumBadge premium={planLoading ? false : isPremium} />
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-400">Member since</dt>
            <dd className="font-medium text-zinc-700">
              {new Date(user.createdAt).toLocaleDateString([], {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      className="h-4 w-4 text-white"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}