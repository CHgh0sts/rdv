import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseSpotifyPlaylistId } from "@/lib/spotify-utils";
import {
  formatSpotifyApiError,
  getPlaylistById,
  getSpotifyAccessToken,
  getUserPlaylists,
} from "@/lib/spotify";

export async function GET() {
  try {
    const settings = await prisma.groupSettings.findUnique({
      where: { id: "default" },
    });

    const token = await getSpotifyAccessToken();
    let userPlaylists: Awaited<ReturnType<typeof getUserPlaylists>> = [];

    if (token) {
      try {
        userPlaylists = await getUserPlaylists(token);
      } catch {
        userPlaylists = [];
      }
    }

    return NextResponse.json({
      linked: settings?.linkedPlaylistId
        ? {
            id: settings.linkedPlaylistId,
            name: settings.linkedPlaylistName,
            url: settings.linkedPlaylistUrl,
          }
        : null,
      userPlaylists,
    });
  } catch (error) {
    console.error("Playlist link GET error:", error);
    return NextResponse.json(
      { error: "Impossible de charger la playlist liée." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const playlistId =
      parseSpotifyPlaylistId(body.playlistId ?? body.playlistUrl ?? "") ??
      (typeof body.playlistId === "string" ? body.playlistId.trim() : null);

    if (!playlistId) {
      return NextResponse.json(
        { error: "URL ou ID de playlist Spotify invalide." },
        { status: 400 },
      );
    }

    const token = await getSpotifyAccessToken();
    if (!token) {
      return NextResponse.json(
        { error: "Connectez Spotify pour lier une playlist." },
        { status: 401 },
      );
    }

    const playlist = await getPlaylistById(token, playlistId);
    const settings = await prisma.groupSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        linkedPlaylistId: playlist.id,
        linkedPlaylistName: playlist.name,
        linkedPlaylistUrl: playlist.external_urls.spotify,
      },
      update: {
        linkedPlaylistId: playlist.id,
        linkedPlaylistName: playlist.name,
        linkedPlaylistUrl: playlist.external_urls.spotify,
      },
    });

    return NextResponse.json({
      linked: {
        id: settings.linkedPlaylistId,
        name: settings.linkedPlaylistName,
        url: settings.linkedPlaylistUrl,
      },
    });
  } catch (error) {
    console.error("Playlist link POST error:", error);
    const raw =
      error instanceof Error ? error.message : "Impossible de lier cette playlist.";
    return NextResponse.json(
      { error: formatSpotifyApiError(raw) },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    await prisma.groupSettings.upsert({
      where: { id: "default" },
      create: { id: "default" },
      update: {
        linkedPlaylistId: null,
        linkedPlaylistName: null,
        linkedPlaylistUrl: null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Playlist link DELETE error:", error);
    return NextResponse.json(
      { error: "Impossible de délier la playlist." },
      { status: 500 },
    );
  }
}
