import { Crown } from "lucide-react";
import Link from "next/link";

export default function PremiumBadge({ premium = false, size = "sm" }) {
  if (!premium) {
    return (
      <Link
        href="/upgrade"
        className={`inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 font-semibold text-amber-700 transition hover:bg-amber-100 ${
          size === "sm" ? "text-[11px]" : "text-xs"
        }`}
      >
        <Crown className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
        Upgrade
      </Link>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-amber-300 bg-gradient-to-r from-amber-400 to-amber-500 px-2 py-0.5 font-bold text-white shadow-sm shadow-amber-500/30 ${
        size === "sm" ? "text-[11px]" : "text-xs"
      }`}
    >
      <Crown className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      Premium
    </span>
  );
}