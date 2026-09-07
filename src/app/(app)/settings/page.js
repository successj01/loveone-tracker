"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Crown, ExternalLink, LogOut, MapPin, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePlan } from "@/hooks/usePlan";
import * as userService from "@/services/userService";
import * as notificationService from "@/services/notificationService";
import * as billingService from "@/services/billingService";
import Loading from "@/components/Loading";
import PremiumBadge from "@/components/PremiumBadge";

function Toggle({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked ? "bg-rose-600" : "bg-zinc-300"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { user, setSharing, logout } = useAuth();
  const router = useRouter();
  const { isPremium, loading: planLoading, error: planError } = usePlan();
  const [portalBusy, setPortalBusy] = useState(false);

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState("");

  const handleManageBilling = async () => {
    setPortalBusy(true);
    try {
      const url = await billingService.openPortal();
      window.location.href = url;
    } catch (err) {
      setPortalBusy(false);
      window.alert(err.message);
    }
  };

  useEffect(() => {
    (async () => {
      if (!user) return;
      const row = await userService.getSettings(user.id);
      setSettings({ ...userService.DEFAULT_SETTINGS, ...row });
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <Loading />;
  if (!user || !settings) return null;

  const updateSetting = async (key, value) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    setSaved("");
    await userService.updateSettings(user.id, { [key]: value });
    setSaved("Settings saved.");
  };

  const toggleSharing = async (value) => {
    const updated = await setSharing(value);
    if (updated) setSaved("Location sharing updated.");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const groups = [
    {
      title: "Location sharing",
      items: [
        {
          key: "sharing",
          icon: MapPin,
          title: "Share my live location",
          text: "Your loved ones can only see you when this is on.",
          value: user.locationSharing,
          onToggle: toggleSharing,
        },
      ],
    },
    {
      title: "Notifications",
      items: [
        {
          key: "sosAlerts",
          icon: ShieldAlert,
          title: "SOS alerts",
          text: "Pop an alert when you trigger an SOS.",
          value: settings.sosAlerts,
          onToggle: (v) => updateSetting("sosAlerts", v),
        },
        {
          key: "lowBatteryAlerts",
          icon: DatabaseBackup,
          title: "Low battery alerts",
          text: "Be notified when a loved one's battery is running low.",
          value: settings.lowBatteryAlerts,
          onToggle: (v) => updateSetting("lowBatteryAlerts", v),
        },
        {
          key: "geofenceAlerts",
          icon: MapPin,
          title: "Arrival alerts",
          text: "Get notified when someone reaches Home, Work or School.",
          value: settings.geofenceAlerts,
          onToggle: (v) => updateSetting("geofenceAlerts", v),
        },
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Control what you share and how you&apos;re alerted.
        </p>
      </div>

      {saved && (
        <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-600">
          <Check className="h-4 w-4" />
          {saved}
        </p>
      )}

      {groups.map((group) => (
        <section key={group.title}>
          <h2 className="mb-2 px-1 text-sm font-bold text-zinc-700">{group.title}</h2>
          <ul className="space-y-2">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.key}
                  className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4"
                >
                  <Icon className="h-5 w-5 shrink-0 text-zinc-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zinc-800">{item.title}</p>
                    <p className="text-xs text-zinc-500">{item.text}</p>
                  </div>
                  <Toggle checked={item.value} onChange={item.onToggle} />
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <section>
        <h2 className="mb-2 px-1 text-sm font-bold text-zinc-700">Plan & billing</h2>
        <div className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <Crown className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
              {planLoading ? "Checking your plan…" : isPremium ? "Premium" : "Free plan"}
              <PremiumBadge premium={planLoading ? false : isPremium} />
            </p>
            <p className="text-xs text-zinc-500">
              {planError
                ? planError
                : isPremium
                  ? "Manage or cancel your subscription anytime."
                  : "Upgrade to unlock unlimited loved ones and 90 days of history."}
            </p>
          </div>
          {isPremium ? (
            <button
              type="button"
              onClick={handleManageBilling}
              disabled={portalBusy}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {portalBusy ? "Opening…" : "Manage"}
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          ) : (
            <Link
              href="/upgrade"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white shadow shadow-rose-600/25 transition hover:bg-rose-700"
            >
              Upgrade
            </Link>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-2 px-1 text-sm font-bold text-zinc-700">Privacy & safety</h2>
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 text-left transition hover:border-red-200 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5 shrink-0 text-zinc-400" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-zinc-800">Sign out</p>
              <p className="text-xs text-zinc-500">Return to the sign-in screen.</p>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}