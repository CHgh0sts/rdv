import { NextResponse } from "next/server";
import { getAdaptiveSwipeTracks } from "@/lib/swipe-service";
import type { SwipeTrack } from "@/lib/swipe-tracks";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const seenIds = Array.isArray(body.seenIds) ? (body.seenIds as string[]) : [];
    const likes = Array.isArray(body.likes) ? (body.likes as SwipeTrack[]) : [];
    const dislikes = Array.isArray(body.dislikes)
      ? (body.dislikes as SwipeTrack[])
      : [];
    const count = typeof body.count === "number" ? body.count : 8;

    const tracks = await getAdaptiveSwipeTracks({
      seenIds,
      likes,
      dislikes,
      count: Math.min(Math.max(count, 1), 15),
    });

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error("Swipe tracks error:", error);
    return NextResponse.json(
      { error: "Impossible de charger les morceaux." },
      { status: 500 },
    );
  }
}
