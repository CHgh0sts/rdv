import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildLabelMap } from "@/lib/playlist";
import {
  CONTEXTS,
  DECADES,
  LANGUAGES,
  MOODS,
  VOCAL_PREFERENCES,
} from "@/lib/quiz-data";

type Params = { params: Promise<{ id: string }> };

function labelFor(
  list: readonly { id: string; label: string }[],
  id: string,
) {
  return list.find((item) => item.id === id)?.label ?? id;
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;

    const response = await prisma.quizResponse.findUnique({
      where: { id },
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

    if (!response) {
      return NextResponse.json({ error: "Réponse introuvable." }, { status: 404 });
    }

    const labels = buildLabelMap();

    return NextResponse.json({
      id: response.id,
      participant: response.participant,
      completedAt: response.completedAt,
      profile: {
        discoveryScore: response.discoveryScore,
        energyScore: response.energyScore,
        lyricFocusScore: response.lyricFocusScore,
        mainstreamScore: response.mainstreamScore,
        vocalPreference: labelFor(VOCAL_PREFERENCES, response.vocalPreference),
      },
      genres: response.genrePreferences.map((g) => ({
        label: labels[g.genre] ?? g.genre,
        rating: g.rating,
      })),
      decades: response.decadePreferences.map((d) => ({
        label: labelFor(DECADES, d.decade),
        rating: d.rating,
      })),
      moods: response.moodPreferences.map((m) => ({
        label: labelFor(MOODS, m.mood),
        rating: m.rating,
      })),
      contexts: response.contextPreferences.map((c) => ({
        label: labelFor(CONTEXTS, c.context),
        rating: c.rating,
      })),
      languages: response.languagePreferences.map((l) => ({
        label: labelFor(LANGUAGES, l.language),
        rating: l.rating,
      })),
      artists: response.artistPreferences.map((a) => ({
        name: a.artistName,
        importance: a.importance,
      })),
      extras: {
        mustHaveArtists: response.mustHaveArtists,
        avoidArtists: response.avoidArtists,
        dreamConcert: response.dreamConcert,
        anthemSong: response.anthemSong,
        guiltyPleasure: response.guiltyPleasure,
      },
    });
  } catch (error) {
    console.error("Response fetch error:", error);
    return NextResponse.json(
      { error: "Impossible de charger la réponse." },
      { status: 500 },
    );
  }
}
