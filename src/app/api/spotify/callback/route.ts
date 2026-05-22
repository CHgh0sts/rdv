import { NextRequest, NextResponse } from "next/server";
import { getAppUrl } from "@/lib/app-url";
import {
  exchangeCodeForTokens,
  verifyOAuthState,
} from "@/lib/spotify";

export async function GET(request: NextRequest) {
  const base = getAppUrl(request);
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/admin?spotify_error=${encodeURIComponent(error)}`, base),
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/admin?spotify_error=Paramètres+OAuth+invalides", base),
    );
  }

  const valid = await verifyOAuthState(state);
  if (!valid) {
    return NextResponse.redirect(
      new URL("/admin?spotify_error=État+OAuth+invalide", base),
    );
  }

  try {
    await exchangeCodeForTokens(code, request);
    return NextResponse.redirect(new URL("/admin?spotify=connected", base));
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Authentification échouée.";
    return NextResponse.redirect(
      new URL(`/admin?spotify_error=${encodeURIComponent(message)}`, base),
    );
  }
}
