type WeightedEntry = {
  label: string;
  score: number;
  votes: number;
};

type AggregateInput = {
  participantCount: number;
  genres: WeightedEntry[];
  decades: WeightedEntry[];
  moods: WeightedEntry[];
  contexts: WeightedEntry[];
  languages: WeightedEntry[];
  artists: WeightedEntry[];
  avgDiscovery: number;
  avgEnergy: number;
  avgLyricFocus: number;
  avgMainstream: number;
  mustHaveArtists: string[];
  avoidArtists: string[];
  anthems: string[];
  guiltyPleasures: string[];
};

export type PlaylistTrack = {
  query: string;
  reason: string;
  category: "artist" | "genre" | "mood" | "anthem" | "consensus";
};

export function buildGroupPlaylist(data: AggregateInput): PlaylistTrack[] {
  const tracks: PlaylistTrack[] = [];
  const avoid = new Set(data.avoidArtists.map((a) => a.toLowerCase()));

  for (const artist of data.artists.slice(0, 8)) {
    if (avoid.has(artist.label.toLowerCase())) continue;
    tracks.push({
      query: artist.label,
      reason: `${artist.votes} personne(s) · score ${artist.score.toFixed(1)}`,
      category: "artist",
    });
  }

  for (const genre of data.genres.slice(0, 4)) {
    tracks.push({
      query: `${genre.label} playlist`,
      reason: `Genre favori du groupe (${genre.votes} votes)`,
      category: "genre",
    });
  }

  for (const mood of data.moods.slice(0, 3)) {
    tracks.push({
      query: `${mood.label} music mix`,
      reason: `Ambiance partagée (${mood.votes} votes)`,
      category: "mood",
    });
  }

  for (const anthem of data.anthems.slice(0, 5)) {
    tracks.push({
      query: anthem,
      reason: "Hymne personnel d'un participant",
      category: "anthem",
    });
  }

  const energyLabel =
    data.avgEnergy >= 65 ? "upbeat" : data.avgEnergy <= 35 ? "chill" : "balanced";
  tracks.push({
    query: `${energyLabel} group playlist ${data.genres[0]?.label ?? "mix"}`,
    reason: `Profil énergétique moyen : ${Math.round(data.avgEnergy)}/100`,
    category: "consensus",
  });

  return tracks;
}

export function aggregateResponses(
  responses: Array<{
    discoveryScore: number;
    energyScore: number;
    lyricFocusScore: number;
    mainstreamScore: number;
    mustHaveArtists: string[];
    avoidArtists: string[];
    anthemSong: string | null;
    guiltyPleasure: string | null;
    genrePreferences: { genre: string; rating: number }[];
    decadePreferences: { decade: string; rating: number }[];
    moodPreferences: { mood: string; rating: number }[];
    contextPreferences: { context: string; rating: number }[];
    languagePreferences: { language: string; rating: number }[];
    artistPreferences: { artistName: string; importance: number }[];
  }>,
  labels: Record<string, string>,
) {
  function weighted(
    key: "genre" | "decade" | "mood" | "context" | "language" | "artistName",
    getItems: (r: (typeof responses)[number]) => { rating?: number; importance?: number; [k: string]: unknown }[],
  ): WeightedEntry[] {
    const map = new Map<string, { total: number; count: number }>();

    for (const response of responses) {
      for (const item of getItems(response)) {
        const id = String(item[key]);
        const value = item.rating ?? item.importance ?? 0;
        const current = map.get(id) ?? { total: 0, count: 0 };
        map.set(id, {
          total: current.total + value,
          count: current.count + 1,
        });
      }
    }

    return [...map.entries()]
      .map(([id, { total, count }]) => ({
        label: labels[id] ?? id,
        score: total / count,
        votes: count,
      }))
      .sort((a, b) => b.score - a.score || b.votes - a.votes);
  }

  const participantCount = responses.length;
  const avg = (field: keyof (typeof responses)[number]) =>
    participantCount === 0
      ? 0
      : responses.reduce((acc, r) => acc + Number(r[field]), 0) / participantCount;

  const allMustHave = responses.flatMap((r) => r.mustHaveArtists);
  const allAvoid = responses.flatMap((r) => r.avoidArtists);
  const anthems = responses.map((r) => r.anthemSong).filter(Boolean) as string[];
  const guiltyPleasures = responses
    .map((r) => r.guiltyPleasure)
    .filter(Boolean) as string[];

  return {
    participantCount,
    genres: weighted("genre", (r) => r.genrePreferences),
    decades: weighted("decade", (r) => r.decadePreferences),
    moods: weighted("mood", (r) => r.moodPreferences),
    contexts: weighted("context", (r) => r.contextPreferences),
    languages: weighted("language", (r) => r.languagePreferences),
    artists: weighted("artistName", (r) => r.artistPreferences),
    avgDiscovery: avg("discoveryScore"),
    avgEnergy: avg("energyScore"),
    avgLyricFocus: avg("lyricFocusScore"),
    avgMainstream: avg("mainstreamScore"),
    mustHaveArtists: [...new Set(allMustHave)],
    avoidArtists: [...new Set(allAvoid)],
    anthems,
    guiltyPleasures,
    totalGenreSelections: responses.reduce(
      (acc, r) => acc + r.genrePreferences.length,
      0,
    ),
    totalArtistSelections: responses.reduce(
      (acc, r) => acc + r.artistPreferences.length,
      0,
    ),
    avgGenresPerPerson:
      participantCount === 0
        ? 0
        : responses.reduce((acc, r) => acc + r.genrePreferences.length, 0) /
          participantCount,
  };
}

import {
  CONTEXTS,
  DECADES,
  GENRES,
  LANGUAGES,
  MOODS,
} from "./quiz-data";

export function buildLabelMap() {
  const map: Record<string, string> = {};
  for (const list of [GENRES, DECADES, MOODS, CONTEXTS, LANGUAGES]) {
    for (const item of list) {
      map[item.id] = item.label;
    }
  }
  return map;
}
