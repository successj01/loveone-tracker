"use client";

import { Search, X } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder = "Search…", className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-zinc-200 bg-white py-2 pl-9 pr-9 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange?.("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-zinc-400 hover:text-zinc-700"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}