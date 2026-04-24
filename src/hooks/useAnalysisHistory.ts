"use client";

import { useState, useEffect } from "react";

export interface AnalysisSummary {
  id: string;
  created_at: string;
  source_type: "zip" | "json";
  followers_count: number;
  following_count: number;
  not_following_back_count: number;
  not_followed_back_count: number;
}

export function useAnalysisHistory() {
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/analyses")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setAnalyses(data.analyses ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { analyses, loading, error };
}
