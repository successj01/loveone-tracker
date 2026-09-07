import { Siren } from "lucide-react";

export default function SOSButton({ onPress, disabled = false, className = "" }) {
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={disabled}
      className={`sos-pulse inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <Siren className="h-4 w-4" />
      SOS
    </button>
  );
}