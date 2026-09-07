"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Phone, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { validateRegister } from "@/utils/validators";
import { APP_NAME } from "@/utils/constants";

export default function RegisterPage() {
  const { user, loading, register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateRegister(form);
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      await register(form);
      router.replace("/dashboard");
    } catch (error) {
      setFormError(error.message || "Unable to create your account.");
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

  return (
    <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-rose-50 via-white to-pink-50 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl shadow-rose-900/5">
          <div className="mb-6 flex flex-col items-center text-center">
            <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/30">
              <Heart className="h-7 w-7" strokeWidth={2.4} />
            </span>
            <h1 className="text-2xl font-bold text-zinc-900">Join {APP_NAME}</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Your account starts with a couple of sample contacts so you can explore.
            </p>
          </div>

          {formError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Full name
              </label>
              <input
                value={form.name}
                onChange={setField("name")}
                placeholder="Jordan Smith"
                className={inputCls("name")}
              />
              {errors.name && (
                <p className="mt-1 text-xs font-medium text-red-500">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={setField("email")}
                placeholder="you@example.com"
                className={inputCls("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs font-medium text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Phone <span className="font-normal normal-case text-zinc-400">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-300" />
                <input
                  value={form.phone}
                  onChange={setField("phone")}
                  placeholder="+1 555 0100"
                  className={`${inputCls("phone")} pl-9`}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-xs font-medium text-red-500">{errors.phone}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Password
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={setField("password")}
                  placeholder="Min. 6 characters"
                  className={inputCls("password")}
                />
                {errors.password && (
                  <p className="mt-1 text-xs font-medium text-red-500">{errors.password}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Confirm
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={setField("confirmPassword")}
                  placeholder="Repeat password"
                  className={inputCls("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs font-medium text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-rose-600/25 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UserPlus className="h-4 w-4" />
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-rose-600 hover:text-rose-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}