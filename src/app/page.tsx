export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AuthButton } from "@/components/AuthButton";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const steps = [
    {
      emoji: "📲",
      title: "Download your Instagram export",
      desc: 'Go to Instagram → Settings → Your activity → Download your information. Select "Followers and following" and request a JSON export.',
    },
    {
      emoji: "📦",
      title: "Upload the ZIP (or JSON files)",
      desc: "Drop your downloaded export ZIP — or just the followers_1.json and following.json files — onto the upload page.",
    },
    {
      emoji: "🔍",
      title: "See who ghosted you",
      desc: "Instantly see everyone who you follow that doesn't follow you back. Sort, search, and copy the list.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚔</span>
            <span className="font-bold text-white">Insta Follow Cop</span>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <Link
                href="/results"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                History
              </Link>
            )}
            <AuthButton user={user} />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-pink-500/10 border border-pink-500/20 px-4 py-1.5 text-sm text-pink-400 mb-8">
            <span>🔒</span>
            <span>No API keys. No Instagram login. Just your data.</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
            Find out who{" "}
            <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              doesn&apos;t follow
            </span>{" "}
            you back
          </h1>

          <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
            Upload your Instagram GDPR data export and instantly see who you
            follow that doesn&apos;t follow you back. Everything is processed in
            your browser — your data never leaves your device.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/upload"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold px-8 py-4 text-base hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg shadow-pink-500/20"
            >
              Upload export →
            </Link>
            <a
              href="https://www.instagram.com/download/request/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 text-white font-semibold px-8 py-4 text-base hover:bg-white/10 transition-all"
            >
              Request Instagram data
            </a>
          </div>
        </div>
      </main>

      {/* How it works */}
      <section className="border-t border-white/10 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-white mb-12">
            How it works
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl mb-4">{step.emoji}</div>
                <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-6 text-center text-sm text-gray-600">
        Built with Next.js · No data leaves your browser
      </footer>
    </div>
  );
}
