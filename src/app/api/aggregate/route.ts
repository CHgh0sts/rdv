import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  aggregateResponses,
  buildGroupPlaylist,
  buildLabelMap,
} from "@/lib/playlist";

export async function GET() {
  try {
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
      orderBy: { completedAt: "desc" },
    });

    const labels = buildLabelMap();
    const aggregate = aggregateResponses(responses, labels);
    const playlist = buildGroupPlaylist(aggregate);

    return NextResponse.json({
      aggregate,
      playlist,
      participants: responses.map((r) => ({
        id: r.id,
        name: r.participant.name,
        completedAt: r.completedAt,
      })),
    });
  } catch (error) {
    console.error("Aggregate error:", error);
    return NextResponse.json(
      { error: "Impossible de charger les statistiques." },
      { status: 500 },
    );
  }
}
