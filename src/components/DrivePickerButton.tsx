"use client";

import { Button } from "./ui/Button";

export function DrivePickerButton() {
  return (
    <div className="relative group">
      <Button variant="secondary" size="sm" disabled>
        <svg className="h-4 w-4 mr-2" viewBox="0 0 87.3 78" fill="none">
          <path
            d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z"
            fill="#0066da"
          />
          <path
            d="M43.65 25L29.9 1.2C28.55 2 27.4 3.1 26.6 4.5L1.2 48.35A9.38 9.38 0 000 52.8h27.5z"
            fill="#00ac47"
          />
          <path
            d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H60l5.85 10.6z"
            fill="#ea4335"
          />
          <path
            d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.45-4.5 1.2z"
            fill="#00832d"
          />
          <path
            d="M60 52.8H27.5L13.75 76.6c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z"
            fill="#2684fc"
          />
          <path
            d="M73.4 26.5l-12.6-21.8A9.46 9.46 0 0057.4 1.2L43.65 25 60 52.8h27.45c0-1.55-.4-3.1-1.2-4.5z"
            fill="#ffba00"
          />
        </svg>
        Import from Google Drive
        <span className="ml-2 text-xs opacity-60">(soon)</span>
      </Button>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block">
        <div className="rounded-lg bg-gray-800 border border-white/10 px-3 py-2 text-xs text-gray-300 whitespace-nowrap shadow-lg">
          Google Drive integration coming soon
        </div>
      </div>
    </div>
  );
}
