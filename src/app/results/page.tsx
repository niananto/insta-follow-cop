export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AnalysisHistory } from "@/components/AnalysisHistory";
import { AuthButton } from "@/components/AuthButton";

export default async function ResultsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-white/10 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🚔</span>
            <span className="font-bold text-white">Insta Follow Cop</span>
          </Link>
          <AuthButton user={user} />
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Your analyses</h1>
            <p className="text-gray-400 mt-1">Past Instagram export results</p>
          </div>
          <Link
            href="/upload"
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium px-4 py-2 text-sm hover:from-pink-600 hover:to-purple-700 transition-all"
          >
            + New analysis
          </Link>
        </div>

        <AnalysisHistory />
      </main>
    </div>
  );
}
