// Persist an analysis result to localStorage before OAuth redirect,
// restore and auto-save after the user comes back signed in.

import type { AnalysisResult } from "@/lib/instagram/types";

const KEY = "insta_follow_cop_pending_save";

export function storePendingResult(result: AnalysisResult): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(result));
  } catch {
    // storage full or unavailable — silent fail
  }
}

export function loadPendingResult(): AnalysisResult | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Rehydrate Date fields
    return {
      ...parsed,
      analyzedAt: new Date(parsed.analyzedAt),
      followers: parsed.followers.map((u: { followedAt: string }) => ({
        ...u,
        followedAt: new Date(u.followedAt),
      })),
      following: parsed.following.map((u: { followedAt: string }) => ({
        ...u,
        followedAt: new Date(u.followedAt),
      })),
      notFollowingBack: parsed.notFollowingBack.map((u: { followedAt: string }) => ({
        ...u,
        followedAt: new Date(u.followedAt),
      })),
      notFollowedBack: parsed.notFollowedBack.map((u: { followedAt: string }) => ({
        ...u,
        followedAt: new Date(u.followedAt),
      })),
    } as AnalysisResult;
  } catch {
    return null;
  }
}

export function clearPendingResult(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
