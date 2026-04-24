"use client";

import { useState, useCallback } from "react";
import {
  extractInstagramFiles,
  parseJsonFiles,
} from "@/lib/instagram/zip-handler";
import { computeDiff } from "@/lib/instagram/parser";
import type { AnalysisResult } from "@/lib/instagram/types";

type ProcessingState =
  | "idle"
  | "reading"
  | "parsing"
  | "saving"
  | "done"
  | "error";

interface UseFileProcessorReturn {
  state: ProcessingState;
  result: AnalysisResult | null;
  error: string | null;
  savedId: string | null;
  processFiles: (files: FileList) => Promise<void>;
  saveResult: () => Promise<void>;
  reset: () => void;
}

export function useFileProcessor(): UseFileProcessorReturn {
  const [state, setState] = useState<ProcessingState>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const processFiles = useCallback(async (files: FileList) => {
    if (!files.length) return;

    setState("reading");
    setError(null);
    setResult(null);
    setSavedId(null);

    try {
      const isZip =
        files.length === 1 &&
        (files[0].name.endsWith(".zip") || files[0].type === "application/zip");

      setState("parsing");

      const { followers, following } = isZip
        ? await extractInstagramFiles(files[0])
        : await parseJsonFiles(files);

      const { notFollowingBack, notFollowedBack } = computeDiff(
        followers,
        following
      );

      const analysisResult: AnalysisResult = {
        followers,
        following,
        notFollowingBack,
        notFollowedBack,
        analyzedAt: new Date(),
        sourceType: isZip ? "zip" : "json",
      };

      setResult(analysisResult);
      setState("done");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      setState("error");
    }
  }, []);

  const saveResult = useCallback(async () => {
    if (!result) return;

    setState("saving");

    try {
      const response = await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_type: result.sourceType,
          followers_count: result.followers.length,
          following_count: result.following.length,
          not_following_back_count: result.notFollowingBack.length,
          not_followed_back_count: result.notFollowedBack.length,
          not_following_back: result.notFollowingBack,
          not_followed_back: result.notFollowedBack,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (response.status === 401) {
          throw new Error("Sign in to save your results.");
        }
        throw new Error(data.error || "Failed to save analysis.");
      }

      const { id } = await response.json();
      setSavedId(id);
      setState("done");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save analysis.";
      setError(message);
      setState("done"); // still done, save just failed
    }
  }, [result]);

  const reset = useCallback(() => {
    setState("idle");
    setResult(null);
    setError(null);
    setSavedId(null);
  }, []);

  return { state, result, error, savedId, processFiles, saveResult, reset };
}
