import { NextResponse } from "next/server";
import { clearSpotifySession } from "@/lib/spotify";

export async function POST() {
  await clearSpotifySession();
  return NextResponse.json({ ok: true });
}
