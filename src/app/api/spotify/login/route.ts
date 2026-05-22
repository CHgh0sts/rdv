import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAppUrl } from "@/lib/app-url";
import { buildSpotifyAuthUrl, setOAuthState } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  const appUrl = getAppUrl(request);

  try {
    const state = randomBytes(16).toString("hex");
    await setOAuthState(state);
    return NextResponse.redirect(buildSpotifyAuthUrl(state, request));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Configuration Spotify manquante.";
    return NextResponse.redirect(
      new URL(`/admin?spotify_error=${encodeURIComponent(message)}`, appUrl),
    );
  }
}
