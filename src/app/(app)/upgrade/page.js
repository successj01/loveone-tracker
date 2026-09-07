"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  Check,
  Crown,
  ExternalLink,
  Lock,
  RefreshCcw,
  Settings2,
  Zap,
} from "lucide-react";
import PremiumBadge from "@/components/PremiumBadge";
import { usePlan } from "@/hooks/usePlan";
import * as billingService from "@/services/billingService";

const FALLBACK_FEATURES = {
  free: [
    "Track up to 5 loved ones",
    "Live location map",
    "SOS alerts",
    "7 days of location history",
  ],
  premium: [
    "Track unlimited loved ones",
    "Live location map with priority alerts",
    "SOS alerts with priority delivery",
    "90 days of location history",
    "Geofence & low-battery alerts",
    "Premium support",
  ],
};

const FALLBACK_PRICING = {
  currency: "usd",
  premium: {
    monthly: { label: "$4.99", note: "per month" },
    yearly: { label: "$39.99", note: "per year" },
    yearlySaveNote: "Billed yearly — save 33% vs monthly",
    yearlyEffective: "≈ $3.33/mo",
  },
};

const FAQS = [
  {
    q: "How does billing work?",
    a: "Premium is a subscription billed monthly or yearly through Stripe. Your plan activates immediately after payment and renews automatically until you cancel.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Open your Stripe billing portal from this page or Settings and cancel with one click. You keep Premium until the end of your paid period, then switch to the Free plan automatically.",
  },
  {
    q: "What happens if I downgrade from Premium?",
    a: "You keep all connections you already have. You'll be limited to 5 loved ones and won't be able to accept new requests over that limit. Location history is pruned to the Free plan window of 7 days.",
  },
  {
    q: "Is my payment information secure?",
    a: "Yes. Payments are processed by Stripe — we never see or store your card details. Card numbers are handled entirely within Stripe's PCI-DSS-compliant checkout.",
  },
];

function BillingToggle({ mode, onChange }) {
  return (
    <div className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 p-1">
      <button
        type="button"
        onClick={() => onChange("month")}
        className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
          mode === "month" ? "bg-white text-zinc-900 shadow" : "text-zinc-500 hover:text-zinc-700"
        }`}
      >
        Monthly
      </button>
      <button
        type="button"
        onClick={() => onChange("year")}
        className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
          mode === "year" ? "bg-white text-zinc-900 shadow" : "text-zinc-500 hover:text-zinc-700"
        }`}
      >
        Yearly
        <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-600">
          Save 33%
        </span>
      </button>
    </div>
  );
}

function PlanCard({ name, price, period, features, highlighted = false, button, note = null }) {
  return (
    <div
      className={`relative flex flex-col rounded-3xl border p-6 ${
        highlighted
          ? "border-rose-300 bg-gradient-to-b from-rose-50 to-white shadow-xl shadow-rose-600/10 ring-1 ring-rose-200"
          : "border-zinc-200 bg-white"
      }`}
    >
      {highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-rose-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow shadow-rose-600/30">
          Most popular
        </span>
      )}
      <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-500">{name}</h3>
      <p className="mt-3 flex items-end gap-1">
        <span className="text-4xl font-extrabold tracking-tight text-zinc-900">{price}</span>
        <span className="pb-1 text-sm text-zinc-500">{period}</span>
      </p>
      <ul className="mt-5 flex-1 space-y-2.5">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-zinc-600">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            {feature}
          </li>
        ))}
      </ul>
      {note && <p className="mt-3 text-xs text-zinc-400">{note}</p>}
      <div className="mt-5">{button}</div>
    </div>
  );
}

function UpgradePageInner() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const { isPremium, loading, error, refresh } = usePlan();
  const [busy, setBusy] = useState(null);
  const [mode, setMode] = useState("month");
  const [catalog, setCatalog] = useState({ features: FALLBACK_FEATURES, pricing: FALLBACK_PRICING });

  useEffect(() => {
    let mounted = true;
    billingService
      .getPlans()
      .then((data) => {
        if (!mounted) return;
        setCatalog({
          features: data?.features || FALLBACK_FEATURES,
          pricing: data?.pricing || FALLBACK_PRICING,
        });
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (status === "success") refresh();
  }, [status, refresh]);

  const handleUpgrade = async () => {
    setBusy("checkout");
    try {
      const url = await billingService.startCheckout(mode);
      window.location.href = url;
    } catch (err) {
      setBusy(null);
      window.alert(err.message);
    }
  };

  const handleManage = async () => {
    setBusy("portal");
    try {
      const url = await billingService.openPortal();
      window.location.href = url;
    } catch (err) {
      setBusy(null);
      window.alert(err.message);
    }
  };

  const pricing = catalog.pricing;
  const period = mode === "year" ? pricing.premium.yearly : pricing.premium.monthly;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
          Upgrade to Premium
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-500">
          Keep closer to the people you love. Premium powers unlimited loved ones, 90 days of
          history, and priority alerts.
        </p>
      </div>

      {status === "success" && (
        <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-600">
          <BadgeCheck className="h-4 w-4" />
          Your subscription is active. Welcome to Premium!
        </p>
      )}
      {status === "cancelled" && (
        <p className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-600">
          Checkout was cancelled. No changes were made.
        </p>
      )}

      <div className="flex justify-center">
        <BillingToggle mode={mode} onChange={setMode} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PlanCard
          name="Free"
          price="$0"
          period="forever"
          features={catalog.features.free}
          button={
            <Link
              href="/dashboard"
              className="flex w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
            >
              Your current plan
            </Link>
          }
        />
        <PlanCard
          name="Premium"
          price={period.label}
          period={period.note}
          features={catalog.features.premium}
          highlighted
          note={
            mode === "year"
              ? `${pricing.premium.yearlySaveNote} (${pricing.premium.yearlyEffective})`
              : pricing.premium.yearlySaveNote
          }
          button={
            isPremium ? (
              <button
                type="button"
                onClick={handleManage}
                disabled={busy === "portal"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-600/25 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Settings2 className="h-4 w-4" />
                {busy === "portal" ? "Opening Stripe…" : "Manage subscription"}
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleUpgrade}
                disabled={busy === "checkout"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-600/25 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Crown className="h-4 w-4" />
                {busy === "checkout"
                  ? "Opening Stripe…"
                  : mode === "year"
                    ? `Upgrade with Stripe — ${period.label}/yr`
                    : `Upgrade with Stripe — ${period.label}/mo`}
              </button>
            )
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            icon: Lock,
            title: "Secured by Stripe",
            text: "PCI-DSS compliant checkout. We never touch your card.",
          },
          {
            icon: RefreshCcw,
            title: "Cancel anytime",
            text: "Manage or cancel your subscription in one click.",
          },
          {
            icon: Zap,
            title: "Instant activation",
            text: "Premium unlocks the moment your payment is confirmed.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-4"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <item.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-zinc-800">{item.title}</p>
              <p className="mt-0.5 text-xs text-zinc-500">{item.text}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-3xl border border-zinc-200 bg-white p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-500">
          Frequently asked questions
        </h2>
        <div className="mt-4 space-y-3">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl border border-zinc-100 bg-zinc-50/50 px-4 py-3"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-zinc-800">
                {faq.q}
                <span className="ml-4 text-zinc-400 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <PremiumStatusBar isPremium={isPremium} loading={loading} error={error} />

      <p className="text-center text-xs text-zinc-400">
        Payments are processed securely by Stripe. Prices in USD. Billing and refunds are managed
        in your Stripe customer portal.
      </p>
    </div>
  );
}

function PremiumStatusBar({ isPremium, loading, error }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
        <Crown className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-zinc-800">Current plan</p>
        <p className="text-xs text-zinc-500">
          {loading
            ? "Checking your plan…"
            : error
              ? error
              : isPremium
                ? "Premium is active on your account."
                : "Free plan — upgrade to unlock everything."}
        </p>
      </div>
      <PremiumBadge premium={isPremium} />
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={null}>
      <UpgradePageInner />
    </Suspense>
  );
}