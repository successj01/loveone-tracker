"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, KeyRound, LogIn, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { validateLogin } from "@/utils/validators";
import { APP_NAME, DEMO_EMAIL, DEMO_PASSWORD } from "@/utils/constants";

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateLogin({ email, password });
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (error) {
      setFormError(error.message || "Unable to sign in. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setErrors({});
    setFormError("");
  };

  return (
    <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-rose-50 via-white to-pink-50 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl shadow-rose-900/5">
          <div className="mb-6 flex flex-col items-center text-center">
            <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/30">
              <Heart className="h-7 w-7" strokeWidth={2.4} />
            </span>
            <h1 className="text-2xl font-bold text-zinc-900">Welcome back</h1>
            <p className="mt-1 text-sm text-zinc-500">Sign in to {APP_NAME}</p>
          </div>

          {formError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className={`w-full rounded-xl border px-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "border-red-300 focus:ring-red-100"
                    : "border-zinc-200 focus:border-rose-400 focus:ring-rose-100"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs font-medium text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
              >
                Password
              </label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-300" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className={`w-full rounded-xl border py-2.5 pl-9 pr-4 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "border-red-300 focus:ring-red-100"
                      : "border-zinc-200 focus:border-rose-400 focus:ring-rose-100"
                  }`}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs font-medium text-red-500">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-rose-600/25 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" />
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <button
            type="button"
            onClick={fillDemo}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-rose-300 bg-rose-50/60 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
          >
            <Sparkles className="h-4 w-4" />
            Use demo account
          </button>

          <p className="mt-6 text-center text-sm text-zinc-500">
            No account yet?{" "}
            <Link
              href="/register"
              className="font-semibold text-rose-600 hover:text-rose-700"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}