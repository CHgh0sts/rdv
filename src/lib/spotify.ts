import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { getSpotifyRedirectUri } from "@/lib/app-url";

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API = "https://api.spotify.com/v1";

const SCOPES = [
  "playlist-modify-public",
  "playlist-modify-private",
  "playlist-read-private",
  "user-read-private",
].join(" ");

const COOKIE_ACCESS = "spotify_access_token";
const COOKIE_REFRESH = "spotify_refresh_token";
const COOKIE_EXPIRES = "spotify_expires_at";
const COOKIE_STATE = "spotify_oauth_state";

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
};

type SpotifyTrack = {
  id: string;
  uri: string;
  name: string;
  artists: { name: string }[];
};

type SpotifyUser = {
  id: string;
  display_name: string | null;
};

function getRedirectUri(request?: NextRequest) {
  return getSpotifyRedirectUri(request);
}

function getCredentials() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "Configurez SPOTIFY_CLIENT_ID et SPOTIFY_CLIENT_SECRET dans .env",
    );
  }
  return { clientId, clientSecret };
}

function authHeader(clientId: string, clientSecret: string) {
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
}

export function buildSpotifyAuthUrl(state: string, request?: NextRequest) {
  const { clientId } = getCredentials();
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: getRedirectUri(request),
    scope: SCOPES,
    state,
    show_dialog: "true",
  });
  return `${SPOTIFY_AUTH_URL}?${params.toString()}`;
}

function cookieOptions() {
  const appUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
  const secure =
    process.env.NODE_ENV === "production" || appUrl.startsWith("https://");

  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
  };
}

export async function setOAuthState(state: string) {
  const jar = await cookies();
  jar.set(COOKIE_STATE, state, {
    ...cookieOptions(),
    maxAge: 600,
  });
}

export async function verifyOAuthState(state: string) {
  const jar = await cookies();
  const stored = jar.get(COOKIE_STATE)?.value;
  jar.delete(COOKIE_STATE);
  return stored === state;
}

export async function exchangeCodeForTokens(code: string, request?: NextRequest) {
  const { clientId, clientSecret } = getCredentials();
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: authHeader(clientId, clientSecret),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: getRedirectUri(request),
    }),
  });

  if (!response.ok) {
    throw new Error("Échec de l'authentification Spotify.");
  }

  const tokens = (await response.json()) as TokenResponse;
  await persistTokens(tokens);
  return tokens;
}

async function refreshAccessToken(refreshToken: string) {
  const { clientId, clientSecret } = getCredentials();
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: authHeader(clientId, clientSecret),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    await clearSpotifySession();
    throw new Error("Session Spotify expirée. Reconnectez-vous.");
  }

  const tokens = (await response.json()) as TokenResponse;
  await persistTokens({ ...tokens, refresh_token: tokens.refresh_token ?? refreshToken });
  return tokens.access_token;
}

async function persistTokens(tokens: TokenResponse) {
  const jar = await cookies();
  const expiresAt = Date.now() + tokens.expires_in * 1000;
  const options = cookieOptions();

  jar.set(COOKIE_ACCESS, tokens.access_token, {
    ...options,
    maxAge: tokens.expires_in,
  });
  jar.set(COOKIE_EXPIRES, String(expiresAt), {
    ...options,
    maxAge: 60 * 60 * 24 * 30,
  });

  if (tokens.refresh_token) {
    jar.set(COOKIE_REFRESH, tokens.refresh_token, {
      ...options,
      maxAge: 60 * 60 * 24 * 30,
    });
  }
}

export async function clearSpotifySession() {
  const jar = await cookies();
  jar.delete(COOKIE_ACCESS);
  jar.delete(COOKIE_REFRESH);
  jar.delete(COOKIE_EXPIRES);
}

export async function getSpotifyAccessToken(): Promise<string | null> {
  const jar = await cookies();
  const access = jar.get(COOKIE_ACCESS)?.value;
  const refresh = jar.get(COOKIE_REFRESH)?.value;
  const expiresAt = Number(jar.get(COOKIE_EXPIRES)?.value ?? 0);

  if (access && Date.now() < expiresAt - 60_000) {
    return access;
  }

  if (refresh) {
    return refreshAccessToken(refresh);
  }

  return null;
}

export async function getSpotifySessionStatus() {
  const jar = await cookies();
  const refresh = jar.get(COOKIE_REFRESH)?.value;
  const access = jar.get(COOKIE_ACCESS)?.value;

  if (!refresh && !access) {
    return { connected: false as const };
  }

  const token = await getSpotifyAccessToken();
  if (!token) {
    return { connected: false as const };
  }

  try {
    const user = await spotifyFetch<SpotifyUser>("/me", token);
    return {
      connected: true as const,
      displayName: user.display_name ?? user.id,
    };
  } catch {
    if (refresh || access) {
      return { connected: true as const, displayName: null };
    }
    return { connected: false as const };
  }
}

async function spotifyFetch<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith("http") ? path : `${SPOTIFY_API}${path}`;
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Spotify API: ${response.status} ${body}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function searchTrack(
  token: string,
  query: string,
  avoidArtists: string[] = [],
): Promise<SpotifyTrack | null> {
  const params = new URLSearchParams({
    q: query,
    type: "track",
    limit: "5",
  });

  const result = await spotifyFetch<{
    tracks: { items: SpotifyTrack[] };
  }>(`/search?${params}`, token);

  const avoid = new Set(avoidArtists.map((a) => a.toLowerCase()));

  return (
    result.tracks.items.find(
      (track) =>
        !track.artists.some((artist) => avoid.has(artist.name.toLowerCase())),
    ) ?? null
  );
}

export async function searchArtistTopTrack(
  token: string,
  artistName: string,
  avoidArtists: string[] = [],
): Promise<SpotifyTrack | null> {
  const avoid = new Set(avoidArtists.map((a) => a.toLowerCase()));
  if (avoid.has(artistName.toLowerCase())) return null;

  const params = new URLSearchParams({
    q: artistName,
    type: "artist",
    limit: "1",
  });

  const result = await spotifyFetch<{
    artists: { items: { id: string; name: string }[] };
  }>(`/search?${params}`, token);

  const artist = result.artists.items[0];
  if (!artist) return null;

  const topTracks = await spotifyFetch<{
    tracks: SpotifyTrack[];
  }>(`/artists/${artist.id}/top-tracks?market=FR`, token);

  return (
    topTracks.tracks.find(
      (track) =>
        !track.artists.some((a) => avoid.has(a.name.toLowerCase())),
    ) ?? topTracks.tracks[0] ?? null
  );
}

export type ResolvedTrack = {
  uri: string;
  name: string;
  artist: string;
  reason: string;
};

export async function resolveTracksForPlaylist(
  token: string,
  queries: { query: string; reason: string; category: string }[],
  avoidArtists: string[],
  mustHaveArtists: string[],
): Promise<ResolvedTrack[]> {
  const seen = new Set<string>();
  const resolved: ResolvedTrack[] = [];

  async function addTrack(
    track: SpotifyTrack | null,
    reason: string,
  ) {
    if (!track || seen.has(track.uri)) return;
    seen.add(track.uri);
    resolved.push({
      uri: track.uri,
      name: track.name,
      artist: track.artists.map((a) => a.name).join(", "),
      reason,
    });
  }

  for (const artist of mustHaveArtists) {
    const track = await searchArtistTopTrack(token, artist, avoidArtists);
    await addTrack(track, `Indispensable · ${artist}`);
  }

  for (const item of queries) {
    let track: SpotifyTrack | null = null;

    if (item.category === "artist") {
      track = await searchArtistTopTrack(token, item.query, avoidArtists);
    } else {
      track = await searchTrack(token, item.query, avoidArtists);
    }

    await addTrack(track, item.reason);
  }

  return resolved.slice(0, 50);
}

export async function createSpotifyPlaylist(
  token: string,
  name: string,
  description: string,
  trackUris: string[],
) {
  const user = await spotifyFetch<SpotifyUser>("/me", token);

  const playlist = await spotifyFetch<{ id: string; external_urls: { spotify: string } }>(
    `/users/${user.id}/playlists`,
    token,
    {
      method: "POST",
      body: JSON.stringify({
        name,
        description,
        public: true,
      }),
    },
  );

  if (trackUris.length > 0) {
    for (let i = 0; i < trackUris.length; i += 100) {
      const chunk = trackUris.slice(i, i + 100);
      await spotifyFetch(`/playlists/${playlist.id}/tracks`, token, {
        method: "POST",
        body: JSON.stringify({ uris: chunk }),
      });
    }
  }

  return {
    id: playlist.id,
    url: playlist.external_urls.spotify,
    trackCount: trackUris.length,
  };
}

let clientCredentialsCache: { token: string; expiresAt: number } | null = null;

export async function getClientCredentialsToken(): Promise<string> {
  if (
    clientCredentialsCache &&
    Date.now() < clientCredentialsCache.expiresAt - 60_000
  ) {
    return clientCredentialsCache.token;
  }

  const { clientId, clientSecret } = getCredentials();
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: authHeader(clientId, clientSecret),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  if (!response.ok) {
    throw new Error("Impossible d'obtenir un token Spotify pour la recherche.");
  }

  const data = (await response.json()) as TokenResponse;
  clientCredentialsCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

export type MusicSuggestion = {
  id: string;
  label: string;
  subtitle?: string;
  type: "artist" | "track";
};

export async function searchMusicSuggestions(
  query: string,
  type: "artist" | "track" | "both" = "both",
  limit = 8,
): Promise<MusicSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const token = await getClientCredentialsToken();
  const searchType =
    type === "both" ? "artist,track" : type === "artist" ? "artist" : "track";

  const params = new URLSearchParams({
    q: trimmed,
    type: searchType,
    limit: String(limit),
    market: "FR",
  });

  const result = await spotifyFetch<{
    artists?: { items: { id: string; name: string }[] };
    tracks?: {
      items: { id: string; name: string; artists: { name: string }[] }[];
    };
  }>(`/search?${params}`, token);

  const suggestions: MusicSuggestion[] = [];

  if (type === "artist" || type === "both") {
    for (const artist of result.artists?.items ?? []) {
      suggestions.push({
        id: artist.id,
        label: artist.name,
        type: "artist",
      });
    }
  }

  if (type === "track" || type === "both") {
    for (const track of result.tracks?.items ?? []) {
      suggestions.push({
        id: track.id,
        label: track.name,
        subtitle: track.artists.map((a) => a.name).join(", "),
        type: "track",
      });
    }
  }

  return suggestions.slice(0, limit);
}

export type SpotifyPlaylistSummary = {
  id: string;
  name: string;
  url: string;
  trackCount: number;
  imageUrl?: string;
};

export async function getUserPlaylists(
  token: string,
): Promise<SpotifyPlaylistSummary[]> {
  const playlists: SpotifyPlaylistSummary[] = [];
  let path: string | null =
    "/me/playlists?limit=50&fields=items(id,name,external_urls,tracks.total,images),next";

  type PlaylistPage = {
    items: {
      id: string;
      name: string;
      external_urls: { spotify: string };
      tracks: { total: number };
      images: { url: string }[];
    }[];
    next: string | null;
  };

  while (path) {
    const page: PlaylistPage = await spotifyFetch<PlaylistPage>(path, token);

    for (const item of page.items) {
      playlists.push({
        id: item.id,
        name: item.name,
        url: item.external_urls.spotify,
        trackCount: item.tracks.total,
        imageUrl: item.images[0]?.url,
      });
    }

    path = page.next;
  }

  return playlists;
}

export async function getPlaylistById(token: string, playlistId: string) {
  return spotifyFetch<{
    id: string;
    name: string;
    external_urls: { spotify: string };
  }>(`/playlists/${playlistId}?fields=id,name,external_urls`, token);
}

async function getExistingTrackUris(token: string, playlistId: string) {
  const uris = new Set<string>();
  let path: string | null =
    `/playlists/${playlistId}/tracks?limit=100&fields=items(track(uri)),next`;

  type TrackPage = {
    items: { track: { uri: string | null } | null }[];
    next: string | null;
  };

  while (path) {
    const page: TrackPage = await spotifyFetch<TrackPage>(path, token);

    for (const item of page.items) {
      if (item.track?.uri) uris.add(item.track.uri);
    }

    path = page.next;
  }

  return uris;
}

export async function addTracksToPlaylist(
  token: string,
  playlistId: string,
  trackUris: string[],
) {
  const existing = await getExistingTrackUris(token, playlistId);
  const newUris = trackUris.filter((uri) => !existing.has(uri));

  if (newUris.length === 0) {
    const playlist = await getPlaylistById(token, playlistId);
    return {
      id: playlist.id,
      url: playlist.external_urls.spotify,
      addedCount: 0,
      skippedCount: trackUris.length,
    };
  }

  for (let i = 0; i < newUris.length; i += 100) {
    const chunk = newUris.slice(i, i + 100);
    await spotifyFetch(`/playlists/${playlistId}/tracks`, token, {
      method: "POST",
      body: JSON.stringify({ uris: chunk }),
    });
  }

  const playlist = await getPlaylistById(token, playlistId);
  return {
    id: playlist.id,
    url: playlist.external_urls.spotify,
    addedCount: newUris.length,
    skippedCount: trackUris.length - newUris.length,
  };
}

export async function pushTracksToGroupPlaylist(
  token: string,
  trackUris: string[],
  linkedPlaylistId: string | null,
  fallbackName: string,
  fallbackDescription: string,
) {
  if (linkedPlaylistId) {
    return addTracksToPlaylist(token, linkedPlaylistId, trackUris);
  }

  const created = await createSpotifyPlaylist(
    token,
    fallbackName,
    fallbackDescription,
    trackUris,
  );

  return {
    id: created.id,
    url: created.url,
    addedCount: created.trackCount,
    skippedCount: 0,
  };
}
