"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/lib/instagram/types";
import { formatNumber } from "@/lib/utils";
import { UserTable } from "./UserTable";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";

interface AnalysisResultsProps {
  result: AnalysisResult;
  onSave?: () => void;
  onSignIn?: () => void;
  savedId?: string | null;
  isSaving?: boolean;
  saveError?: string | null;
}

type Tab = "notFollowingBack" | "notFollowedBack" | "summary";

export function AnalysisResults({
  result,
  onSave,
  onSignIn,
  savedId,
  isSaving,
  saveError,
}: AnalysisResultsProps) {
  const [tab, setTab] = useState<Tab>("notFollowingBack");

  const tabs: { id: Tab; label: string; count: number; badge: "pink" | "yellow" | "green" }[] = [
    {
      id: "notFollowingBack",
      label: "Not following you back",
      count: result.notFollowingBack.length,
      badge: "pink",
    },
    {
      id: "notFollowedBack",
      label: "You don't follow back",
      count: result.notFollowedBack.length,
      badge: "yellow",
    },
    {
      id: "summary",
      label: "Summary",
      count: 0,
      badge: "green",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
          <p className="text-sm text-gray-400 mt-1">
            {formatNumber(result.following.length)} following ·{" "}
            {formatNumber(result.followers.length)} followers
          </p>
        </div>

        {onSave && (
          <div className="flex items-center gap-3">
            {saveError && (
              <p className="text-sm text-red-400">
                {saveError === "Sign in to save your results." && onSignIn ? (
                  <>
                    <button
                      onClick={onSignIn}
                      className="underline hover:text-red-300 transition-colors font-medium"
                    >
                      Sign in
                    </button>
                    {" to save your results."}
                  </>
                ) : (
                  saveError
                )}
              </p>
            )}
            {savedId ? (
              <Badge variant="green">✓ Saved</Badge>
            ) : (
              <Button
                onClick={onSave}
                disabled={isSaving}
                variant="secondary"
                size="sm"
              >
                {isSaving ? "Saving…" : "Save results"}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-white/5 p-1 border border-white/10">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-white/10 text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <span className="hidden sm:inline">{t.label}</span>
            <span className="sm:hidden">
              {t.id === "notFollowingBack"
                ? "Not back"
                : t.id === "notFollowedBack"
                ? "You skip"
                : "Summary"}
            </span>
            {t.count > 0 && (
              <Badge variant={t.badge}>{formatNumber(t.count)}</Badge>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 sm:p-6">
        {tab === "notFollowingBack" && (
          <UserTable
            users={result.notFollowingBack}
            emptyMessage="Everyone follows you back! 🎉"
          />
        )}
        {tab === "notFollowedBack" && (
          <UserTable
            users={result.notFollowedBack}
            emptyMessage="You follow everyone back!"
          />
        )}
        {tab === "summary" && <SummaryTab result={result} />}
      </div>
    </div>
  );
}

function SummaryTab({ result }: { result: AnalysisResult }) {
  const total = result.following.length;
  const ghosts = result.notFollowingBack.length;
  const mutuals = total - ghosts;
  const ghostPct = total > 0 ? Math.round((ghosts / total) * 100) : 0;

  const stats = [
    { label: "Following", value: result.following.length, color: "text-white" },
    { label: "Followers", value: result.followers.length, color: "text-white" },
    {
      label: "Not following you back",
      value: result.notFollowingBack.length,
      color: "text-pink-400",
    },
    {
      label: "Mutuals",
      value: mutuals,
      color: "text-green-400",
    },
    {
      label: "You don't follow back",
      value: result.notFollowedBack.length,
      color: "text-yellow-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl bg-white/5 border border-white/10 p-4"
          >
            <p className={`text-2xl font-bold ${s.color}`}>
              {formatNumber(s.value)}
            </p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Ghost ratio bar */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Ghost ratio</span>
          <span className="text-pink-400 font-medium">{ghostPct}% not following back</span>
        </div>
        <div className="h-3 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-700"
            style={{ width: `${ghostPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
