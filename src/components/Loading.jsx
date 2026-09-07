import { LoaderCircle, Heart } from "lucide-react";
import { APP_NAME } from "@/utils/constants";

export default function Loading({ text = "Loading…", full = false }) {
  return (
    <div
      className={
        full
          ? "flex min-h-screen w-full flex-col items-center justify-center gap-4"
          : "flex flex-col items-center justify-center gap-4 py-16"
      }
      aria-busy="true"
      aria-live="polite"
    >
      <div className="relative">
        <Heart className="h-8 w-8 text-rose-500" strokeWidth={2.2} />
        <LoaderCircle className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-spin text-zinc-400" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-sm font-medium text-zinc-500">{text}</p>
        <p className="text-xs text-zinc-400">{APP_NAME}</p>
      </div>
    </div>
  );
}