# 🚔 Insta Follow Cop

**Find out who doesn't follow you back on Instagram.**

No Instagram API. No OAuth with Meta. No rate limits. Just your GDPR data export — parsed entirely in your browser.

🔗 **[ig-follow-cop.vercel.app](https://ig-follow-cop.vercel.app)**

---

## What it does

- Upload your Instagram data export (ZIP or JSON files)
- Import directly from Google Drive if you exported there
- See who you follow that doesn't follow you back
- See who follows you that you don't follow back
- Summary stats with a ghost ratio bar
- Sign in with Google to save and revisit past analyses

## Why no Instagram API?

Instagram's GDPR data export is strictly better:
- No Meta app review required
- No rate limits
- No OAuth dance with Instagram
- The export contains exactly what's needed: `followers_1.json` and `following.json`

## How to use

### Option 1 — Upload ZIP

1. Open Instagram → **Settings & privacy** → **Your activity** → **Download your information**
2. Select **Some of your information** → tick **Followers and following** → JSON format
3. Download to your device, then upload the ZIP at [ig-follow-cop.vercel.app/upload](https://ig-follow-cop.vercel.app/upload)

### Option 2 — Google Drive

1. Same as above but choose **Transfer to destination → Google Drive**
2. Click **Import from Google Drive** on the upload page
3. Select the `instagram-username-date` folder inside the `meta-YYYY-Mon-DD-…` folder

## Tech stack

- **Next.js 15** (App Router) — deployed on Vercel free tier
- **Supabase** — Google OAuth + analysis history (RLS enforced)
- **JSZip** — client-side ZIP extraction, no server upload
- **Tailwind CSS v4**

## Running locally

```bash
git clone https://github.com/niananto/insta-follow-cop
cd insta-follow-cop
npm install
```

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Optional: Google Drive integration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
NEXT_PUBLIC_GOOGLE_PICKER_API_KEY=your_api_key
```

Run the Supabase migration in `supabase/migrations/001_create_analyses.sql`, then:

```bash
npm run dev
```

## Privacy

All file parsing happens in your browser. Your Instagram data is never uploaded to any server. Results are only stored in Supabase if you explicitly click "Save results" while signed in.
