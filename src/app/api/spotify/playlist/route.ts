import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  aggregateResponses,
  buildGroupPlaylist,
  buildLabelMap,
} from "@/lib/playlist";
import {
  createSpotifyPlaylist,
  getSpotifyAccessToken,
  resolveTracksForPlaylist,
} from "@/lib/spotify";

export async function POST() {
  try {
    const token = await getSpotifyAccessToken();
    if (!token) {
      return NextResponse.json(
        { error: "Connectez votre compte Spotify d'abord." },
        { status: 401 },
      );
    }

    const responses = await prisma.quizResponse.findMany({
      include: {
        participant: true,
        genrePreferences: true,
        decadePreferences: true,
        moodPreferences: true,
        contextPreferences: true,
        languagePreferences: true,
        artistPreferences: true,
      },
    });

    if (responses.length === 0) {
      return NextResponse.json(
        { error: "Aucune réponse au quiz pour générer une playlist." },
        { status: 400 },
      );
    }

    const labels = buildLabelMap();
    const aggregate = aggregateResponses(responses, labels);
    const playlistQueries = buildGroupPlaylist(aggregate);

    const tracks = await resolveTracksForPlaylist(
      token,
      playlistQueries,
      aggregate.avoidArtists,
      aggregate.mustHaveArtists,
    );

    if (tracks.length === 0) {
      return NextResponse.json(
        { error: "Aucun morceau trouvé sur Spotify avec ces critères." },
        { status: 404 },
      );
    }

    const topGenres = aggregate.genres
      .slice(0, 3)
      .map((g) => g.label)
      .join(", ");

    const playlist = await createSpotifyPlaylist(
      token,
      `SoundMatch · ${aggregate.participantCount} participants`,
      `Playlist collective générée depuis le quiz SoundMatch. Genres dominants : ${topGenres || "mixte"}.`,
      tracks.map((t) => t.uri),
    );

    return NextResponse.json({
      url: playlist.url,
      trackCount: playlist.trackCount,
      tracks: tracks.map((t) => ({
        name: t.name,
        artist: t.artist,
        reason: t.reason,
      })),
    });
  } catch (error) {
    console.error("Spotify playlist error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Impossible de créer la playlist Spotify.",
      },
      { status: 500 },
    );
  }
}
