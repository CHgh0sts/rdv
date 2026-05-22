import {
  DISCOVERY_GENRE_SEEDS,
  FALLBACK_TRACKS,
  mapSpotifyGenres,
  type SwipeTrack,
} from "./swipe-tracks";
import {
  enrichSwipeTracks,
  fetchArtistGenres,
  fetchSpotifyRecommendations,
  prioritizePlayableTracks,
} from "./spotify";

const SPOTIFY_GENRE_MAP: Record<string, string> = {
  pop: "pop",
  rock: "rock",
  indie: "indie",
  "hip-hop": "hip-hop",
  rnb: "r-n-b",
  electronic: "electronic",
  jazz: "jazz",
  blues: "blues",
  classical: "classical",
  metal: "metal",
  punk: "punk",
  reggae: "reggae",
  latin: "latin",
  afrobeat: "afrobeat",
  country: "country",
  folk: "folk",
  "french-chanson": "french",
  "k-pop": "k-pop",
  world: "world-music",
};

function toSpotifyGenre(id: string) {
  return SPOTIFY_GENRE_MAP[id] ?? "pop";
}

function genreAffinity(track: SwipeTrack, likes: SwipeTrack[], dislikes: SwipeTrack[]) {
  const likedGenres = new Set(likes.flatMap((t) => t.genres));
  const dislikedGenres = new Set(dislikes.flatMap((t) => t.genres));
  let score = Math.random() * 0.3;

  for (const g of track.genres) {
    if (likedGenres.has(g)) score += 3;
    if (dislikedGenres.has(g)) score -= 2;
  }

  const likedArtists = new Set(likes.map((t) => t.artist.toLowerCase()));
  const dislikedArtists = new Set(dislikes.map((t) => t.artist.toLowerCase()));
  if (likedArtists.has(track.artist.toLowerCase())) score += 5;
  if (dislikedArtists.has(track.artist.toLowerCase())) score -= 8;

  return score;
}

function pickFallbackTracks(
  seenIds: Set<string>,
  likes: SwipeTrack[],
  dislikes: SwipeTrack[],
  count: number,
  phase: number,
) {
  const seeds = DISCOVERY_GENRE_SEEDS[Math.min(phase, DISCOVERY_GENRE_SEEDS.length - 1)];
  const pool = FALLBACK_TRACKS.filter((t) => !seenIds.has(t.id));

  const ranked = pool
    .map((track) => ({
      track,
      score:
        likes.length === 0
          ? seeds.some((s) => track.genres.includes(s))
            ? 2 + Math.random()
            : 1 + Math.random()
          : genreAffinity(track, likes, dislikes),
    }))
    .sort((a, b) => b.score - a.score);

  return ranked.slice(0, count).map((r) => r.track);
}

function filterCandidates(
  tracks: SwipeTrack[],
  seen: Set<string>,
  dislikes: SwipeTrack[],
) {
  return tracks.filter(
    (track) =>
      !seen.has(track.id) &&
      !dislikes.some(
        (d) => d.artist.toLowerCase() === track.artist.toLowerCase(),
      ),
  );
}

async function loadSpotifyBatch(options: {
  seen: Set<string>;
  likes: SwipeTrack[];
  dislikes: SwipeTrack[];
  count: number;
  phase: number;
}) {
  const { seen, likes, dislikes, count, phase } = options;

  if (likes.length >= 2) {
    const genreCounts = new Map<string, number>();
    for (const track of likes) {
      for (const g of track.genres) {
        genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1);
      }
    }

    const topGenres = [...genreCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([g]) => toSpotifyGenre(g));

    const artistSeeds = likes
      .map((t) => t.artistId)
      .filter(Boolean)
      .slice(0, 2) as string[];

    const trackSeeds = likes
      .filter((t) => !t.id.startsWith("fb"))
      .map((t) => t.id)
      .slice(0, 2);

    for (const artistId of artistSeeds) {
      try {
        const genres = await fetchArtistGenres(artistId);
        for (const g of mapSpotifyGenres(genres)) {
          genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1);
        }
      } catch {
        // ignore artist genre lookup failures
      }
    }

    const avgEnergy =
      likes.reduce((sum, t) => sum + (t.energy ?? 0.5), 0) / likes.length;
    const avgValence =
      likes.reduce((sum, t) => sum + (t.valence ?? 0.5), 0) / likes.length;

    const spotifyTracks = await fetchSpotifyRecommendations({
      genreSeeds: topGenres,
      artistSeeds,
      trackSeeds,
      targetEnergy: avgEnergy,
      targetValence: avgValence,
      limit: count + seen.size + 6,
    });

    return filterCandidates(spotifyTracks, seen, dislikes);
  }

  const seeds = DISCOVERY_GENRE_SEEDS[Math.min(phase, DISCOVERY_GENRE_SEEDS.length - 1)];
  const spotifyTracks = await fetchSpotifyRecommendations({
    genreSeeds: seeds.slice(0, 3).map(toSpotifyGenre),
    limit: count + seen.size + 6,
  });

  return filterCandidates(spotifyTracks, seen, dislikes);
}

export async function getAdaptiveSwipeTracks(options: {
  seenIds: string[];
  likes: SwipeTrack[];
  dislikes: SwipeTrack[];
  count?: number;
}): Promise<SwipeTrack[]> {
  const count = options.count ?? 8;
  const seen = new Set(options.seenIds);
  const { likes, dislikes } = options;
  const phase = Math.floor(seen.size / 9);

  try {
    const spotifyCandidates = await loadSpotifyBatch({
      seen,
      likes,
      dislikes,
      count,
      phase,
    });

    const playableFirst = prioritizePlayableTracks(spotifyCandidates);
    if (playableFirst.length >= Math.min(3, count)) {
      const picked = playableFirst.slice(0, count);
      return enrichSwipeTracks(picked);
    }
  } catch (error) {
    console.warn("Spotify recommendations fallback:", error);
  }

  const fallback = pickFallbackTracks(seen, likes, dislikes, count, phase);
  return enrichSwipeTracks(fallback);
}
