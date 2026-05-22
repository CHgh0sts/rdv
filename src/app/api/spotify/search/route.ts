import { NextRequest, NextResponse } from "next/server";
import { searchMusicSuggestions } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q") ?? "";
    const typeParam = request.nextUrl.searchParams.get("type") ?? "both";
    const type =
      typeParam === "artist" || typeParam === "track" ? typeParam : "both";

    const suggestions = await searchMusicSuggestions(q, type);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Spotify search error:", error);
    return NextResponse.json({ suggestions: [] });
  }
}
