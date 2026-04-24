"use client";

import { useState } from "react";
import { pickInstagramZipFromDrive } from "@/lib/drive/picker";
import { Spinner } from "./ui/Spinner";

interface DrivePickerButtonProps {
  onFile: (file: File) => void;
}

export function DrivePickerButton({ onFile }: DrivePickerButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const isConfigured =
    !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID &&
    !!process.env.NEXT_PUBLIC_GOOGLE_PICKER_API_KEY;

  const handleClick = async () => {
    setError(null);
    setState("loading");
    try {
      const file = await pickInstagramZipFromDrive();
      setState("idle");
      onFile(file);
    } catch (err) {
      if (err instanceof Error && err.message === "cancelled") {
        setState("idle");
        return;
      }
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("idle");
    }
  };

  if (!isConfigured) {
    return (
      <div className="relative group">
        <button
          disabled
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/5 border border-white/10 text-gray-500 px-4 py-2 text-sm cursor-not-allowed"
        >
          <DriveIcon />
          Import from Google Drive
          <span className="text-xs opacity-60">(soon)</span>
        </button>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block pointer-events-none">
          <div className="rounded-lg bg-gray-800 border border-white/10 px-3 py-2 text-xs text-gray-300 whitespace-nowrap shadow-lg">
            Google Drive integration coming soon
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleClick}
        disabled={state === "loading"}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 px-4 py-2 text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state === "loading" ? (
          <Spinner className="h-4 w-4 text-gray-400" />
        ) : (
          <DriveIcon />
        )}
        {state === "loading" ? "Opening Drive…" : "Import from Google Drive"}
      </button>
      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
    </div>
  );
}

function DriveIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 87.3 78" fill="none">
      <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
      <path d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L1.2 48.35A9.38 9.38 0 000 52.8h27.5z" fill="#00ac47" />
      <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H60l5.85 10.6z" fill="#ea4335" />
      <path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
      <path d="M60 52.8H27.5L13.75 76.6c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
      <path d="M73.4 26.5l-12.6-21.8A9.46 9.46 0 0057.4 1.2L43.65 25 60 52.8h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
    </svg>
  );
}
