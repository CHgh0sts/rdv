import type { NextRequest } from "next/server";

export type MusicSuggestion = {
  id: string;
  label: string;
  subtitle?: string;
  type: "artist" | "track";
};

export function parseSpotifyPlaylistId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const urlMatch = trimmed.match(
    /playlist\/([a-zA-Z0-9]+)(?:\?|$)/,
  );
  if (urlMatch?.[1]) return urlMatch[1];

  if (/^[a-zA-Z0-9]{10,}$/.test(trimmed)) return trimmed;

  return null;
}
