"use client";

import { useState } from "react";

export function DriveInstructions() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full max-w-sm mx-auto">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mx-auto"
      >
        <span>{open ? "▾" : "▸"}</span>
        How do I get my Instagram data on Drive?
      </button>

      {open && (
        <div className="mt-3 rounded-xl bg-white/[0.03] border border-white/10 p-4 text-sm text-gray-400 space-y-3">
          <p className="text-white font-medium text-xs uppercase tracking-wide">
            How to export Instagram data to Google Drive
          </p>

          <ol className="space-y-2.5 list-none">
            {[
              <>Open Instagram → <strong className="text-gray-200">Settings & privacy</strong> → <strong className="text-gray-200">Your activity</strong> → <strong className="text-gray-200">Download your information</strong></>,
              <>Tap <strong className="text-gray-200">Download or transfer information</strong> → choose your account</>,
              <>Select <strong className="text-gray-200">Some of your information</strong> → tick <strong className="text-gray-200">Followers and following</strong> → tap Next</>,
              <>Choose <strong className="text-gray-200">Transfer to destination</strong> → pick <strong className="text-gray-200">Google Drive</strong> → sign in if prompted</>,
              <>Set format to <strong className="text-gray-200">JSON</strong> → tap <strong className="text-gray-200">Create files</strong></>,
              <>Wait for the transfer — Instagram will notify you (usually a few minutes to a few hours)</>,
              <>Come back here → click <strong className="text-gray-200">Import from Google Drive</strong> → look for a folder named <code className="text-pink-400 bg-pink-500/10 px-1 rounded">meta-YYYY-Mon-DD-…</code> → open it → select the <code className="text-pink-400 bg-pink-500/10 px-1 rounded">instagram-username-date</code> folder inside</>,
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 text-xs flex items-center justify-center font-medium">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
