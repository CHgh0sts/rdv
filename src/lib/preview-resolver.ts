import { lookupDeezerPreview, searchDeezerPreviewTracks } from "./deezer";
import {
  lookupSpotifyTrackById,
  lookupSwipeTrack,
  searchSpotifyPreviewTracks,
} from "./spotify";
import type { SwipeTrack } from "./swipe-tracks";

const PREVIEW_MARKETS = ["FR", "US", "GB", "DE"] as const;

export function hasPlayablePreview(track: SwipeTrack) {
  return Boolean(track.previewUrl);
}

export async function resolveTrackPreview(
  track: SwipeTrack,
): Promise<SwipeTrack | null> {
  if (track.previewUrl && track.albumArt) return track;

  for (const market of PREVIEW_MARKETS) {
    try {
      const spotify = await lookupSwipeTrack(
        track.name,
        track.artist,
        track.genres,
        market,
      );
      if (spotify?.previewUrl) {
        return mergeTrack(track, spotify);
      }
    } catch {
      // try next market
    }
  }

  if (!track.id.startsWith("fb")) {
    for (const market of PREVIEW_MARKETS) {
      try {
        const byId = await lookupSpotifyTrackById(track.id, track.genres, market);
        if (byId?.previewUrl) return mergeTrack(track, byId);
      } catch {
        // try next market
      }
    }
  }

  try {
    const deezer = await lookupDeezerPreview(track.name, track.artist);
    if (deezer?.previewUrl) {
      return {
        ...track,
        previewUrl: deezer.previewUrl,
        albumArt: deezer.albumArt ?? track.albumArt,
        name: deezer.title ?? track.name,
        artist: deezer.artist ?? track.artist,
      };
    }
  } catch {
    // ignore deezer failures
  }

  return null;
}

function mergeTrack(base: SwipeTrack, resolved: SwipeTrack): SwipeTrack {
  return {
    ...base,
    ...resolved,
    genres: base.genres.length ? base.genres : resolved.genres,
    energy: base.energy ?? resolved.energy,
    valence: base.valence ?? resolved.valence,
    releaseYear: base.releaseYear ?? resolved.releaseYear,
    popularity: base.popularity ?? resolved.popularity,
  };
}

export async function enrichSwipeTracksWithPreviews(
  tracks: SwipeTrack[],
): Promise<SwipeTrack[]> {
  const playable: SwipeTrack[] = [];

  for (const track of tracks) {
    const resolved = await resolveTrackPreview(track);
    if (resolved?.previewUrl) playable.push(resolved);
  }

  return playable;
}

const DISCOVERY_SEARCH_QUERIES = [
  "year:2024 genre:pop",
  "year:2023 genre:pop",
  "genre:rock",
  "genre:hip-hop",
  "genre:electronic",
  "genre:indie",
  "genre:latino",
  "genre:r-n-b",
  "genre:dance",
  "artist:Stromae",
  "artist:Daft Punk",
  "artist:Angèle",
];

const DEEZER_DISCOVERY_QUERIES = [
  "pop hits",
  "rock classics",
  "hip hop",
  "electro",
  "chanson francaise",
  "latino",
  "indie",
  "rnb",
];

export async function fetchPreviewDiscoveryTracks(options: {
  count: number;
  seenIds: Set<string>;
  seenKeys: Set<string>;
  genres?: string[];
}): Promise<SwipeTrack[]> {
  const { count, seenIds, seenKeys } = options;
  const genres = options.genres?.length ? options.genres : ["pop"];
  const found: SwipeTrack[] = [];

  for (const query of DISCOVERY_SEARCH_QUERIES) {
    if (found.length >= count) break;

    for (const market of PREVIEW_MARKETS) {
      try {
        const batch = await searchSpotifyPreviewTracks({
          query,
          limit: 20,
          market,
          excludeIds: seenIds,
        });

        for (const track of batch) {
          const key = trackKey(track);
          if (seenKeys.has(key) || seenIds.has(track.id)) continue;
          if (!track.previewUrl) continue;

          seenKeys.add(key);
          seenIds.add(track.id);
          found.push({ ...track, genres: track.genres.length ? track.genres : genres });
          if (found.length >= count) return found;
        }
      } catch {
        // try next market/query
      }
    }
  }

  for (const query of DEEZER_DISCOVERY_QUERIES) {
    if (found.length >= count) break;

    const deezerTracks = await searchDeezerPreviewTracks(query, 15, seenKeys);
    for (const preview of deezerTracks) {
      const key = trackKey({
        name: preview.title ?? "",
        artist: preview.artist ?? "",
      });
      if (seenKeys.has(key)) continue;

      seenKeys.add(key);
      const id = `dz-${seenKeys.size}-${normalizeKey(preview.title ?? query)}`;
      if (seenIds.has(id)) continue;
      seenIds.add(id);

      found.push({
        id,
        name: preview.title ?? "Morceau",
        artist: preview.artist ?? "Artiste",
        albumArt: preview.albumArt,
        previewUrl: preview.previewUrl,
        genres,
      });

      if (found.length >= count) return found;
    }
  }

  return found;
}

function trackKey(track: { name: string; artist: string }) {
  return `${normalizeKey(track.name)}::${normalizeKey(track.artist)}`;
}

function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
