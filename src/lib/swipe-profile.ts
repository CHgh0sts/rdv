import type { SwipeDecision, SwipeTrack } from "./swipe-tracks";

type Rated = { id: string; rating: number };

function clamp(n: number, min = 0, max = 100) {
  return Math.round(Math.max(min, Math.min(max, n)));
}

function decadeFromYear(year?: number): string | null {
  if (!year) return null;
  if (year < 1960) return "50s";
  if (year < 1970) return "60s";
  if (year < 1980) return "70s";
  if (year < 1990) return "80s";
  if (year < 2000) return "90s";
  if (year < 2010) return "2000s";
  if (year < 2020) return "2010s";
  return "2020s";
}

function topCounts(
  items: string[],
  minRating = 1,
): Rated[] {
  const map = new Map<string, number>();
  for (const id of items) {
    map.set(id, (map.get(id) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([id, count]) => ({ id, rating: Math.min(5, count + minRating) }))
    .sort((a, b) => b.rating - a.rating);
}

function avg(nums: number[]) {
  if (!nums.length) return 0.5;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function buildProfileFromSwipes(swipes: SwipeDecision[]) {
  const likes = swipes.filter((s) => s.direction === "like");
  const dislikes = swipes.filter((s) => s.direction === "dislike");

  const likedGenres = likes.flatMap((s) => s.track.genres);
  const dislikedGenres = dislikes.flatMap((s) => s.track.genres);
  const genreCounts = new Map<string, number>();

  for (const g of likedGenres) genreCounts.set(g, (genreCounts.get(g) ?? 0) + 2);
  for (const g of dislikedGenres) genreCounts.set(g, (genreCounts.get(g) ?? 0) - 1);

  const genres: Rated[] = [...genreCounts.entries()]
    .filter(([, score]) => score > 0)
    .map(([id, score]) => ({ id, rating: Math.min(5, score) }))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8);

  const artistLikes = topCounts(likes.map((s) => s.track.artist), 2).slice(0, 8);
  const artists = artistLikes.map((a) => ({
    artistName: a.id,
    importance: a.rating,
  }));

  const decades = topCounts(
    likes.map((s) => decadeFromYear(s.track.releaseYear)).filter(Boolean) as string[],
    1,
  ).slice(0, 5);

  const avgEnergy = avg(likes.map((s) => s.track.energy ?? 0.5));
  const avgValence = avg(likes.map((s) => s.track.valence ?? 0.5));
  const avgPopularity = avg(likes.map((s) => (s.track.popularity ?? 50) / 100));

  const moods: Rated[] = [];
  if (avgEnergy >= 0.65) moods.push({ id: "energetic", rating: 5 });
  if (avgEnergy <= 0.45) moods.push({ id: "chill", rating: 4 });
  if (avgValence >= 0.6) moods.push({ id: "happy", rating: 4 });
  if (avgValence <= 0.35) moods.push({ id: "melancholic", rating: 4 });
  if (avgEnergy >= 0.7 && avgValence >= 0.6) moods.push({ id: "groovy", rating: 4 });
  if (avgValence <= 0.4 && avgEnergy >= 0.5) moods.push({ id: "dark", rating: 3 });
  if (moods.length < 3) moods.push({ id: "nostalgic", rating: 3 });

  const contexts: Rated[] = [];
  if (avgEnergy >= 0.65) contexts.push({ id: "party", rating: 5 }, { id: "workout", rating: 4 });
  if (avgEnergy <= 0.45) contexts.push({ id: "relax", rating: 5 }, { id: "sleep", rating: 3 });
  contexts.push({ id: "commute", rating: 3 }, { id: "social", rating: 3 });

  const frenchScore = likes.filter((s) =>
    s.track.genres.includes("french-chanson"),
  ).length;
  const languages: Rated[] = [
    { id: "english", rating: 4 },
    ...(frenchScore >= 2 ? [{ id: "french", rating: 5 }] : [{ id: "french", rating: 3 }]),
  ];

  const avoidArtists = [...new Set(dislikes.map((s) => s.track.artist))].slice(0, 5);
  const topArtist = artists[0]?.artistName;
  const topTrack = likes[0]?.track;

  const guiltyTrack = likes.find((s) => (s.track.popularity ?? 50) < 40)?.track;

  return {
    genres: genres.length >= 3 ? genres : [
      { id: "pop", rating: 4 },
      { id: "rock", rating: 3 },
      { id: "electronic", rating: 3 },
      ...genres,
    ].slice(0, 5),
    artists: artists.length >= 2 ? artists : [
      { artistName: topArtist ?? "Artiste inconnu", importance: 4 },
      { artistName: likes[1]?.track.artist ?? "Various Artists", importance: 3 },
    ],
    decades: decades.length >= 2 ? decades : [
      { id: "2000s", rating: 4 },
      { id: "2010s", rating: 4 },
    ],
    moods: moods.slice(0, 5),
    contexts: contexts.slice(0, 4),
    languages,
    discoveryScore: clamp((1 - avgPopularity) * 100),
    energyScore: clamp(avgEnergy * 100),
    lyricFocusScore: 50,
    mainstreamScore: clamp(avgPopularity * 100),
    vocalPreference: "mixed",
    mustHaveArtists: topArtist ? [topArtist] : [],
    avoidArtists,
    dreamConcert: topArtist ?? null,
    anthemSong: topTrack ? `${topTrack.name} — ${topTrack.artist}` : null,
    guiltyPleasure: guiltyTrack
      ? `${guiltyTrack.name} — ${guiltyTrack.artist}`
      : null,
  };
}
