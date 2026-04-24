"use client";

import Link from "next/link";
import { useAnalysisHistory } from "@/hooks/useAnalysisHistory";
import { formatDate, formatNumber } from "@/lib/utils";
import { Badge } from "./ui/Badge";
import { Spinner } from "./ui/Spinner";

export function AnalysisHistory() {
  const { analyses, loading, error } = useAnalysisHistory();

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-8 w-8 text-pink-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-center text-red-400">
        {error}
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-5xl mb-4">📭</div>
        <h3 className="text-lg font-semibold text-white mb-2">No saved analyses yet</h3>
        <p className="text-gray-400 text-sm">
          Upload your Instagram export and save results to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {analyses.map((a) => (
        <Link
          key={a.id}
          href={`/results/${a.id}`}
          className="block rounded-xl bg-white/[0.03] border border-white/10 p-5 hover:bg-white/[0.06] hover:border-pink-500/30 transition-all"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-gray-400">{formatDate(a.created_at)}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="pink">
                  {formatNumber(a.not_following_back_count)} not following back
                </Badge>
                <Badge variant="gray">
                  {formatNumber(a.following_count)} following
                </Badge>
                <Badge variant="gray">
                  {formatNumber(a.followers_count)} followers
                </Badge>
              </div>
            </div>
            <Badge variant={a.source_type === "zip" ? "default" : "gray"}>
              {a.source_type === "zip" ? "ZIP" : "JSON"}
            </Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}
