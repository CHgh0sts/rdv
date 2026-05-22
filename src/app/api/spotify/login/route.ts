import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { buildSpotifyAuthUrl, setOAuthState } from "@/lib/spotify";

export async function GET() {
  try {
    const state = randomBytes(16).toString("hex");
    await setOAuthState(state);
    return NextResponse.redirect(buildSpotifyAuthUrl(state));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Configuration Spotify manquante.";
    return NextResponse.redirect(
      new URL(`/admin?spotify_error=${encodeURIComponent(message)}`, process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
    );
  }
}
