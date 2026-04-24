// Stub — Google Drive token exchange will be implemented here.
// When ready: exchange OAuth code for access token, store in session.
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Google Drive integration not yet enabled." },
    { status: 501 }
  );
}
