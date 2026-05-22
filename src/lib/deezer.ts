type DeezerTrack = {
  id: number;
  title: string;
  preview: string;
  artist: { name: string; picture_medium?: string; picture_big?: string };
  album: { cover_medium?: string; cover_big?: string; cover_xl?: string };
};

type DeezerSearchResult = {
  data: DeezerTrack[];
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function scoreDeezerMatch(
  track: DeezerTrack,
  targetTitle: string,
  targetArtist: string,
) {
  const title = normalize(track.title);
  const artist = normalize(track.artist.name);
  let score = 0;

  if (!track.preview) return -1;

  if (title === targetTitle) score += 5;
  else if (title.includes(targetTitle) || targetTitle.includes(title)) score += 3;

  if (artist === targetArtist) score += 5;
  else if (artist.includes(targetArtist) || targetArtist.includes(artist)) {
    score += 3;
  }

  return score;
}

export type ResolvedPreview = {
  previewUrl: string;
  albumArt?: string;
  title?: string;
  artist?: string;
};

export async function lookupDeezerPreview(
  name: string,
  artist: string,
): Promise<ResolvedPreview | null> {
  const primaryArtist = artist.split(",")[0]?.trim() ?? artist;
  const query = encodeURIComponent(`${name} ${primaryArtist}`);
  const response = await fetch(
    `https://api.deezer.com/search/track?q=${query}&limit=10`,
    { next: { revalidate: 3600 } },
  );

  if (!response.ok) return null;

  const result = (await response.json()) as DeezerSearchResult;
  const targetTitle = normalize(name);
  const targetArtist = normalize(primaryArtist);

  const ranked = result.data
    .map((track) => ({
      track,
      score: scoreDeezerMatch(track, targetTitle, targetArtist),
    }))
    .filter((item) => item.score >= 4)
    .sort((a, b) => b.score - a.score);

  const match = ranked[0]?.track ?? result.data.find((t) => t.preview);
  if (!match?.preview) return null;

  return {
    previewUrl: match.preview,
    albumArt:
      match.album.cover_xl ??
      match.album.cover_big ??
      match.album.cover_medium ??
      match.artist.picture_big ??
      match.artist.picture_medium,
    title: match.title,
    artist: match.artist.name,
  };
}

export async function searchDeezerPreviewTracks(
  query: string,
  limit: number,
  excludeTitles: Set<string> = new Set(),
): Promise<ResolvedPreview[]> {
  const response = await fetch(
    `https://api.deezer.com/search/track?q=${encodeURIComponent(query)}&limit=50`,
    { next: { revalidate: 3600 } },
  );

  if (!response.ok) return [];

  const result = (await response.json()) as DeezerSearchResult;
  const previews: ResolvedPreview[] = [];

  for (const track of result.data) {
    if (!track.preview) continue;
    const key = `${normalize(track.title)}::${normalize(track.artist.name)}`;
    if (excludeTitles.has(key)) continue;

    excludeTitles.add(key);
    previews.push({
      previewUrl: track.preview,
      albumArt:
        track.album.cover_xl ??
        track.album.cover_big ??
        track.album.cover_medium,
      title: track.title,
      artist: track.artist.name,
    });

    if (previews.length >= limit) break;
  }

  return previews;
}
