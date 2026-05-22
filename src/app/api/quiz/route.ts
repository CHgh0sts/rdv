import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeQuizPayload } from "@/lib/quiz-validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = sanitizeQuizPayload(body);

    if (!payload.name) {
      return NextResponse.json({ error: "Le nom est requis." }, { status: 400 });
    }

    if (payload.genres.length < 3 || payload.artists.length < 2) {
      return NextResponse.json(
        { error: "Réponses insuffisantes pour soumettre le quiz." },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const participant = await tx.participant.create({
        data: {
          name: payload.name,
          email: payload.email,
        },
      });

      const response = await tx.quizResponse.create({
        data: {
          participantId: participant.id,
          discoveryScore: payload.discoveryScore,
          energyScore: payload.energyScore,
          lyricFocusScore: payload.lyricFocusScore,
          mainstreamScore: payload.mainstreamScore,
          vocalPreference: payload.vocalPreference,
          mustHaveArtists: payload.mustHaveArtists,
          avoidArtists: payload.avoidArtists,
          dreamConcert: payload.dreamConcert,
          anthemSong: payload.anthemSong,
          guiltyPleasure: payload.guiltyPleasure,
          genrePreferences: {
            create: payload.genres,
          },
          decadePreferences: {
            create: payload.decades,
          },
          moodPreferences: {
            create: payload.moods,
          },
          contextPreferences: {
            create: payload.contexts,
          },
          languagePreferences: {
            create: payload.languages,
          },
          artistPreferences: {
            create: payload.artists,
          },
        },
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
