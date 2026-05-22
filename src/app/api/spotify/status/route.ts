import { NextResponse } from "next/server";
import { getSpotifySessionStatus } from "@/lib/spotify";

export async function GET() {
  try {
    const status = await getSpotifySessionStatus();
    return NextResponse.json(status);
  } catch {
    return NextResponse.json({ connected: false });
  }
}
