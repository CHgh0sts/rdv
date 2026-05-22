export const SWIPE_TARGET = 36;

export type SwipeTrack = {
  id: string;
  name: string;
  artist: string;
  artistId?: string;
  albumArt?: string;
  previewUrl?: string | null;
  genres: string[];
  popularity?: number;
  releaseYear?: number;
  energy?: number;
  valence?: number;
};

export type SwipeDecision = {
  track: SwipeTrack;
  direction: "like" | "dislike";
};

export const DISCOVERY_GENRE_SEEDS = [
  ["pop", "rock", "hip-hop", "electronic"],
  ["indie", "rnb", "jazz", "latin", "french-chanson"],
  ["metal", "punk", "reggae", "blues"],
  ["pop", "soul", "folk", "country", "afrobeat"],
] as const;

export const FALLBACK_TRACKS: SwipeTrack[] = [
  { id: "fb1", name: "One More Time", artist: "Daft Punk", genres: ["electronic", "pop"], popularity: 85, releaseYear: 2000, energy: 0.8, valence: 0.7 },
  { id: "fb2", name: "Billie Jean", artist: "Michael Jackson", genres: ["pop", "rnb"], popularity: 90, releaseYear: 1982, energy: 0.7, valence: 0.6 },
  { id: "fb3", name: "Smells Like Teen Spirit", artist: "Nirvana", genres: ["rock", "indie"], popularity: 88, releaseYear: 1991, energy: 0.9, valence: 0.4 },
  { id: "fb4", name: "Alors on danse", artist: "Stromae", genres: ["french-chanson", "electronic"], popularity: 82, releaseYear: 2009, energy: 0.75, valence: 0.5 },
  { id: "fb5", name: "Bohemian Rhapsody", artist: "Queen", genres: ["rock", "pop"], popularity: 92, releaseYear: 1975, energy: 0.6, valence: 0.5 },
  { id: "fb6", name: "Lose Yourself", artist: "Eminem", genres: ["hip-hop"], popularity: 87, releaseYear: 2002, energy: 0.85, valence: 0.4 },
  { id: "fb7", name: "Blinding Lights", artist: "The Weeknd", genres: ["pop", "electronic"], popularity: 95, releaseYear: 2019, energy: 0.8, valence: 0.6 },
  { id: "fb8", name: "Numb", artist: "Linkin Park", genres: ["rock", "metal"], popularity: 86, releaseYear: 2003, energy: 0.85, valence: 0.3 },
  { id: "fb9", name: "La Vie En Rose", artist: "Édith Piaf", genres: ["french-chanson", "jazz"], popularity: 75, releaseYear: 1947, energy: 0.3, valence: 0.5 },
  { id: "fb10", name: "Levitating", artist: "Dua Lipa", genres: ["pop", "dance"], popularity: 91, releaseYear: 2020, energy: 0.85, valence: 0.8 },
  { id: "fb11", name: "Redbone", artist: "Childish Gambino", genres: ["rnb", "hip-hop"], popularity: 84, releaseYear: 2016, energy: 0.5, valence: 0.6 },
  { id: "fb12", name: "Take Five", artist: "Dave Brubeck", genres: ["jazz"], popularity: 70, releaseYear: 1959, energy: 0.4, valence: 0.6 },
  { id: "fb13", name: "Despacito", artist: "Luis Fonsi", genres: ["latin", "pop"], popularity: 93, releaseYear: 2017, energy: 0.8, valence: 0.9 },
  { id: "fb14", name: "Wonderwall", artist: "Oasis", genres: ["rock", "indie"], popularity: 89, releaseYear: 1995, energy: 0.6, valence: 0.5 },
  { id: "fb15", name: "Toxic", artist: "Britney Spears", genres: ["pop"], popularity: 83, releaseYear: 2003, energy: 0.9, valence: 0.7 },
  { id: "fb16", name: "Shape of You", artist: "Ed Sheeran", genres: ["pop"], popularity: 94, releaseYear: 2017, energy: 0.7, valence: 0.8 },
  { id: "fb17", name: "Starboy", artist: "The Weeknd", genres: ["pop", "rnb"], popularity: 88, releaseYear: 2016, energy: 0.7, valence: 0.5 },
  { id: "fb18", name: "Piano Man", artist: "Billy Joel", genres: ["pop", "rock"], popularity: 80, releaseYear: 1973, energy: 0.5, valence: 0.5 },
  { id: "fb19", name: "Bad Guy", artist: "Billie Eilish", genres: ["pop", "electronic"], popularity: 90, releaseYear: 2019, energy: 0.5, valence: 0.3 },
  { id: "fb20", name: "Happy", artist: "Pharrell Williams", genres: ["pop", "rnb"], popularity: 87, releaseYear: 2013, energy: 0.8, valence: 0.95 },
  { id: "fb21", name: "Uptown Funk", artist: "Mark Ronson", genres: ["pop", "funk"], popularity: 92, releaseYear: 2014, energy: 0.9, valence: 0.9 },
  { id: "fb22", name: "HUMBLE.", artist: "Kendrick Lamar", genres: ["hip-hop"], popularity: 86, releaseYear: 2017, energy: 0.7, valence: 0.4 },
  { id: "fb23", name: "Je veux", artist: "Zaz", genres: ["french-chanson", "jazz"], popularity: 72, releaseYear: 2010, energy: 0.7, valence: 0.8 },
  { id: "fb24", name: "Relax", artist: "Frankie Goes To Hollywood", genres: ["pop", "electronic"], popularity: 78, releaseYear: 1984, energy: 0.75, valence: 0.7 },
  { id: "fb25", name: "Seven Nation Army", artist: "The White Stripes", genres: ["rock", "indie"], popularity: 85, releaseYear: 2003, energy: 0.8, valence: 0.4 },
  { id: "fb26", name: "Get Lucky", artist: "Daft Punk", genres: ["electronic", "pop"], popularity: 88, releaseYear: 2013, energy: 0.75, valence: 0.85 },
  { id: "fb27", name: "Rolling in the Deep", artist: "Adele", genres: ["pop", "soul"], popularity: 89, releaseYear: 2010, energy: 0.7, valence: 0.4 },
  { id: "fb28", name: "SICKO MODE", artist: "Travis Scott", genres: ["hip-hop"], popularity: 84, releaseYear: 2018, energy: 0.8, valence: 0.5 },
  { id: "fb29", name: "Mr. Brightside", artist: "The Killers", genres: ["rock", "indie"], popularity: 90, releaseYear: 2003, energy: 0.85, valence: 0.5 },
  { id: "fb30", name: "Titanium", artist: "David Guetta", genres: ["electronic", "pop"], popularity: 86, releaseYear: 2011, energy: 0.85, valence: 0.6 },
  { id: "fb31", name: "Flowers", artist: "Miley Cyrus", genres: ["pop"], popularity: 88, releaseYear: 2023, energy: 0.7, valence: 0.7 },
  { id: "fb32", name: "Roxanne", artist: "The Police", genres: ["rock", "reggae"], popularity: 82, releaseYear: 1978, energy: 0.7, valence: 0.6 },
  { id: "fb33", name: "Midnight City", artist: "M83", genres: ["electronic", "indie"], popularity: 80, releaseYear: 2011, energy: 0.75, valence: 0.6 },
  { id: "fb34", name: "Papaoutai", artist: "Stromae", genres: ["french-chanson", "electronic"], popularity: 81, releaseYear: 2013, energy: 0.7, valence: 0.4 },
  { id: "fb35", name: "Creep", artist: "Radiohead", genres: ["rock", "indie"], popularity: 85, releaseYear: 1992, energy: 0.5, valence: 0.2 },
  { id: "fb36", name: "Don't Start Now", artist: "Dua Lipa", genres: ["pop", "dance"], popularity: 87, releaseYear: 2019, energy: 0.85, valence: 0.75 },
  { id: "fb37", name: "Lose Control", artist: "Teddy Swims", genres: ["pop", "soul"], popularity: 90, releaseYear: 2023, energy: 0.6, valence: 0.5 },
  { id: "fb38", name: "Feeling Good", artist: "Nina Simone", genres: ["jazz", "soul"], popularity: 76, releaseYear: 1965, energy: 0.4, valence: 0.5 },
  { id: "fb39", name: "Sandstorm", artist: "Darude", genres: ["electronic"], popularity: 79, releaseYear: 1999, energy: 0.95, valence: 0.6 },
  { id: "fb40", name: "Waka Waka", artist: "Shakira", genres: ["latin", "pop"], popularity: 85, releaseYear: 2010, energy: 0.9, valence: 0.9 },
];

export function mapSpotifyGenres(spotifyGenres: string[]): string[] {
  const mapped = new Set<string>();
  for (const g of spotifyGenres) {
    const lower = g.toLowerCase();
    if (lower.includes("hip hop") || lower.includes("rap")) mapped.add("hip-hop");
    else if (lower.includes("r&b") || lower.includes("soul")) mapped.add("rnb");
    else if (lower.includes("electro") || lower.includes("house") || lower.includes("techno") || lower.includes("dance")) mapped.add("electronic");
    else if (lower.includes("chanson") || lower.includes("french")) mapped.add("french-chanson");
    else if (lower.includes("k-pop")) mapped.add("k-pop");
    else if (lower.includes("metal")) mapped.add("metal");
    else if (lower.includes("punk")) mapped.add("punk");
    else if (lower.includes("jazz")) mapped.add("jazz");
    else if (lower.includes("blues")) mapped.add("blues");
    else if (lower.includes("classical")) mapped.add("classical");
    else if (lower.includes("reggae")) mapped.add("reggae");
    else if (lower.includes("latin")) mapped.add("latin");
    else if (lower.includes("country")) mapped.add("country");
    else if (lower.includes("folk")) mapped.add("folk");
    else if (lower.includes("indie")) mapped.add("indie");
    else if (lower.includes("rock")) mapped.add("rock");
    else if (lower.includes("pop")) mapped.add("pop");
    else if (lower.includes("afro")) mapped.add("afrobeat");
    else mapped.add("world");
  }
  return [...mapped];
}
