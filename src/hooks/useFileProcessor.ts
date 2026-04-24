"use client";

import { useState, useCallback, useEffect } from "react";
import {
  extractInstagramFiles,
  parseJsonFiles,
} from "@/lib/instagram/zip-handler";
import { computeDiff } from "@/lib/instagram/parser";
import type { AnalysisResult, IGUser } from "@/lib/instagram/types";
import {
  storePendingResult,
  loadPendingResult,
  clearPendingResult,
} from "@/lib/pending-save";
import { createClient } from "@/lib/supabase/client";

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
  processFromDrive: (data: { followers: IGUser[]; following: IGUser[] }) => void;
  saveResult: () => Promise<void>;
  signInAndSave: () => Promise<void>;
  reset: () => void;
}

async function doSave(result: AnalysisResult): Promise<string> {
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
    if (response.status === 401) throw new Error("__auth__");
    throw new Error(data.error || "Failed to save analysis.");
  }

  const { id } = await response.json();
  return id;
}

export function useFileProcessor(): UseFileProcessorReturn {
  const [state, setState] = useState<ProcessingState>("idle");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  // On mount: check for a pending result left before OAuth redirect
  useEffect(() => {
    const pending = loadPendingResult();
    if (!pending) return;

    // Restore the result immediately so the user sees it
    setResult(pending);
    setState("done");

    // If now signed in, auto-save it
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return; // still not signed in — leave result visible, don't clear storage
      clearPendingResult();
      setState("saving");
      doSave(pending)
        .then((id) => {
          setSavedId(id);
          setState("done");
        })
        .catch(() => setState("done"));
    });
  }, []);

  const finalize = useCallback(
    (followers: IGUser[], following: IGUser[], sourceType: AnalysisResult["sourceType"]) => {
      const { notFollowingBack, notFollowedBack } = computeDiff(followers, following);
      const r: AnalysisResult = {
        followers,
        following,
        notFollowingBack,
        notFollowedBack,
        analyzedAt: new Date(),
        sourceType,
      };
      setResult(r);
      setState("done");
    },
    []
  );

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
      finalize(followers, following, isZip ? "zip" : "json");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setState("error");
    }
  }, [finalize]);

  const processFromDrive = useCallback(
    ({ followers, following }: { followers: IGUser[]; following: IGUser[] }) => {
      setError(null);
      setResult(null);
      setSavedId(null);
      finalize(followers, following, "json");
    },
    [finalize]
  );

  const saveResult = useCallback(async () => {
    if (!result) return;
    setState("saving");
    try {
      const id = await doSave(result);
      setSavedId(id);
      setState("done");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save analysis.";
      setError(msg === "__auth__" ? "Sign in to save your results." : msg);
      setState("done");
    }
  }, [result]);

  // Save to localStorage then trigger Google OAuth.
  // On return, useEffect above will auto-save.
  const signInAndSave = useCallback(async () => {
    if (!result) return;
    storePendingResult(result);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin.replace("0.0.0.0", "localhost")}/upload` },
    });
  }, [result]);

  const reset = useCallback(() => {
    setState("idle");
    setResult(null);
    setError(null);
    setSavedId(null);
    clearPendingResult();
  }, []);

  return { state, result, error, savedId, processFiles, processFromDrive, saveResult, signInAndSave, reset };
}
