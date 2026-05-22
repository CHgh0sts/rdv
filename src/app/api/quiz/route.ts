import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildProfileFromSwipes } from "@/lib/swipe-profile";
import { SWIPE_TARGET, type SwipeDecision } from "@/lib/swipe-tracks";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string" && body.email.trim()
        ? body.email.trim()
        : null;
    const swipes = Array.isArray(body.swipes) ? (body.swipes as SwipeDecision[]) : [];

    if (!name) {
      return NextResponse.json({ error: "Le nom est requis." }, { status: 400 });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Adresse e-mail invalide." },
        { status: 400 },
      );
    }

    if (swipes.length < Math.floor(SWIPE_TARGET * 0.6)) {
      return NextResponse.json(
        { error: `Swipez au moins ${Math.floor(SWIPE_TARGET * 0.6)} morceaux.` },
        { status: 400 },
      );
    }

    const profile = buildProfileFromSwipes(swipes);

    const result = await prisma.$transaction(async (tx) => {
      const participant = await tx.participant.create({
        data: { name, email },
      });

      const response = await tx.quizResponse.create({
        data: {
          participantId: participant.id,
          discoveryScore: profile.discoveryScore,
          energyScore: profile.energyScore,
          lyricFocusScore: profile.lyricFocusScore,
          mainstreamScore: profile.mainstreamScore,
          vocalPreference: profile.vocalPreference,
          mustHaveArtists: profile.mustHaveArtists,
          avoidArtists: profile.avoidArtists,
          dreamConcert: profile.dreamConcert,
          anthemSong: profile.anthemSong,
          guiltyPleasure: profile.guiltyPleasure,
          genrePreferences: {
            create: profile.genres.map((g) => ({ genre: g.id, rating: g.rating })),
          },
          decadePreferences: {
            create: profile.decades.map((d) => ({ decade: d.id, rating: d.rating })),
          },
          moodPreferences: {
            create: profile.moods.map((m) => ({ mood: m.id, rating: m.rating })),
          },
          contextPreferences: {
            create: profile.contexts.map((c) => ({ context: c.id, rating: c.rating })),
          },
          languagePreferences: {
            create: profile.languages.map((l) => ({
              language: l.id,
              rating: l.rating,
            })),
          },
          artistPreferences: {
            create: profile.artists.map((a) => ({
              artistName: a.artistName,
              importance: a.importance,
            })),
          },
          trackSwipes: {
            create: swipes.map((swipe, index) => ({
              spotifyTrackId: swipe.track.id,
              trackName: swipe.track.name,
              artistName: swipe.track.artist,
              artistId: swipe.track.artistId ?? null,
              albumArt: swipe.track.albumArt ?? null,
              direction: swipe.direction,
              genres: swipe.track.genres,
              popularity: swipe.track.popularity ?? null,
              energy: swipe.track.energy ?? null,
              valence: swipe.track.valence ?? null,
              releaseYear: swipe.track.releaseYear ?? null,
              orderIndex: index,
            })),
          },
        },
        include: {
          participant: true,
        },
      });

      return response;
    });

    return NextResponse.json({ id: result.id, participant: result.participant });
  } catch (error) {
    console.error("Quiz submission error:", error);
    return NextResponse.json(
      { error: "Impossible d'enregistrer votre réponse." },
      { status: 500 },
    );
  }
}
