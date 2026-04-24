export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AnalysisResults } from "@/components/AnalysisResults";
import type { IGUser } from "@/lib/instagram/types";
import type { Json } from "@/types/supabase";

function parseUsers(raw: Json): IGUser[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((u: unknown) => {
    const item = u as { username: string; profileUrl: string; followedAt: string };
    return {
      username: item.username,
      profileUrl: item.profileUrl,
      followedAt: new Date(item.followedAt),
    };
  });
}

export default async function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ analysisId: string }>;
}) {
  const { analysisId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", analysisId)
    .eq("user_id", user.id)
    .single();

  if (error || !data) notFound();

  const result = {
    followers: [] as IGUser[], // not stored; reconstructing from counts
    following: [] as IGUser[],
    notFollowingBack: parseUsers(data.not_following_back),
    notFollowedBack: parseUsers(data.not_followed_back),
    analyzedAt: new Date(data.created_at),
    sourceType: data.source_type,
    // Synthesise dummy follower/following arrays to match expected counts
    _followersCount: data.followers_count,
    _followingCount: data.following_count,
  };

  // AnalysisResults uses followers.length and following.length for display
  // Pad arrays with placeholder count so the summary shows correct numbers
  const paddedResult = {
    ...result,
    followers: Array(data.followers_count).fill({ username: "", profileUrl: "", followedAt: new Date() }),
    following: Array(data.following_count).fill({ username: "", profileUrl: "", followedAt: new Date() }),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-white/10 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🚔</span>
            <span className="font-bold text-white">Insta Follow Cop</span>
          </Link>
          <Link
            href="/results"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← All analyses
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        <AnalysisResults result={paddedResult} />
      </main>
    </div>
  );
}
