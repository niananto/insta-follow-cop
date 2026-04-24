import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("analyses")
    .insert({
      user_id: user.id,
      source_type: body.source_type,
      followers_count: body.followers_count,
      following_count: body.following_count,
      not_following_back_count: body.not_following_back_count,
      not_followed_back_count: body.not_followed_back_count,
      not_following_back: body.not_following_back,
      not_followed_back: body.not_followed_back,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[POST /api/analyses]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("analyses")
    .select(
      "id, created_at, source_type, followers_count, following_count, not_following_back_count, not_followed_back_count"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ analyses: data });
}
