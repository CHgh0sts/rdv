import type { NextRequest } from "next/server";

function normalizeUrl(url: string) {
  return url.replace(/\/$/, "");
}

function fromForwardedHeaders(request: NextRequest): string | null {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return null;

  const hostname = host.split(",")[0]?.trim();
  if (!hostname || hostname.startsWith("localhost")) return null;

  const protoHeader = request.headers.get("x-forwarded-proto");
  const protocol = (protoHeader?.split(",")[0]?.trim() ?? "https") as string;

  return `${protocol}://${hostname}`;
}

function isLocalhost(url: string) {
  try {
    const { hostname } = new URL(url);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return url.includes("localhost");
  }
}

/**
 * Résout l'URL publique de l'app à partir de la requête (proxy Coolify/Traefik)
 * plutôt que d'une variable figée au build (NEXT_PUBLIC_APP_URL=localhost).
 */
export function getAppUrl(request?: NextRequest): string {
  if (process.env.APP_URL) {
    return normalizeUrl(process.env.APP_URL);
  }

  if (request) {
    const forwarded = fromForwardedHeaders(request);
    if (forwarded) return normalizeUrl(forwarded);

    const origin = request.nextUrl.origin;
    if (!isLocalhost(origin)) return normalizeUrl(origin);
  }

  const publicUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (publicUrl && !isLocalhost(publicUrl)) {
    return normalizeUrl(publicUrl);
  }

  if (request) {
    return normalizeUrl(request.nextUrl.origin);
  }

  return normalizeUrl(publicUrl ?? "http://localhost:3000");
}

export function getSpotifyRedirectUri(request?: NextRequest): string {
  if (process.env.SPOTIFY_REDIRECT_URI) {
    return process.env.SPOTIFY_REDIRECT_URI;
  }
  return `${getAppUrl(request)}/api/spotify/callback`;
}
