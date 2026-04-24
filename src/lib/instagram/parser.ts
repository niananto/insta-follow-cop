import type { IGUser, InstagramEntry } from "./types";

/**
 * Parse a raw Instagram export JSON array into normalised IGUser[].
 *
 * Handles two shapes Instagram uses:
 *  - followers_1.json: string_list_data[0].value = username
 *  - following.json:   string_list_data[0].value is MISSING; username is in entry.title
 *
 * Skips malformed entries rather than throwing.
 */
export function parseInstagramFile(raw: unknown): IGUser[] {
  if (!Array.isArray(raw)) {
    console.warn("[parser] Expected array at root, got:", typeof raw);
    return [];
  }

  const users: IGUser[] = [];

  for (const entry of raw as InstagramEntry[]) {
    try {
      const data = entry?.string_list_data?.[0];

      // Username: prefer string_list_data[0].value, fall back to entry.title
      const username = data?.value || (entry as unknown as Record<string, unknown>).title as string;
      if (!username) continue;

      // href from Instagram sometimes uses /_u/username — normalise to clean profile URL
      const rawHref = data?.href ?? "";
      const profileUrl = rawHref.includes("/_u/")
        ? `https://www.instagram.com/${username}/`
        : rawHref || `https://www.instagram.com/${username}/`;

      users.push({
        username,
        profileUrl,
        followedAt: new Date((data?.timestamp ?? 0) * 1000),
      });
    } catch {
      // skip bad entries silently
    }
  }

  return users;
}

/**
 * Compute the diff between followers and following lists.
 * Uses Set for O(n) lookup — important for large accounts.
 */
export function computeDiff(
  followers: IGUser[],
  following: IGUser[]
): {
  notFollowingBack: IGUser[];
  notFollowedBack: IGUser[];
} {
  const followerSet = new Set(followers.map((u) => u.username.toLowerCase()));
  const followingSet = new Set(following.map((u) => u.username.toLowerCase()));

  return {
    // you follow them, they don't follow you back
    notFollowingBack: following.filter(
      (u) => !followerSet.has(u.username.toLowerCase())
    ),
    // they follow you, you don't follow them back
    notFollowedBack: followers.filter(
      (u) => !followingSet.has(u.username.toLowerCase())
    ),
  };
}
