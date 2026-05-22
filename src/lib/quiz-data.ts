export const GENRES = [
  { id: "pop", label: "Pop" },
  { id: "rock", label: "Rock" },
  { id: "indie", label: "Indie" },
  { id: "hip-hop", label: "Hip-Hop / Rap" },
  { id: "rnb", label: "R&B / Soul" },
  { id: "electronic", label: "Électro / House / Techno" },
  { id: "jazz", label: "Jazz" },
  { id: "blues", label: "Blues" },
  { id: "classical", label: "Classique" },
  { id: "metal", label: "Metal" },
  { id: "punk", label: "Punk" },
  { id: "reggae", label: "Reggae / Dub" },
  { id: "latin", label: "Latino" },
  { id: "afrobeat", label: "Afrobeat" },
  { id: "country", label: "Country" },
  { id: "folk", label: "Folk / Acoustique" },
  { id: "french-chanson", label: "Chanson française" },
  { id: "soundtrack", label: "Bandes originales" },
  { id: "k-pop", label: "K-Pop" },
  { id: "world", label: "Musiques du monde" },
] as const;

export const DECADES = [
  { id: "50s", label: "Années 50" },
  { id: "60s", label: "Années 60" },
  { id: "70s", label: "Années 70" },
  { id: "80s", label: "Années 80" },
  { id: "90s", label: "Années 90" },
  { id: "2000s", label: "Années 2000" },
  { id: "2010s", label: "Années 2010" },
  { id: "2020s", label: "Années 2020" },
  { id: "current", label: "Sorties récentes" },
] as const;

export const MOODS = [
  { id: "energetic", label: "Énergique" },
  { id: "chill", label: "Détente" },
  { id: "melancholic", label: "Mélancolique" },
  { id: "happy", label: "Joyeux" },
  { id: "dark", label: "Sombre / Intense" },
  { id: "romantic", label: "Romantique" },
  { id: "nostalgic", label: "Nostalgique" },
  { id: "epic", label: "Épique / Cinématique" },
  { id: "groovy", label: "Groovy / Dansant" },
  { id: "focus", label: "Concentration" },
] as const;

export const CONTEXTS = [
  { id: "party", label: "Soirée / Fête" },
  { id: "workout", label: "Sport" },
  { id: "commute", label: "Trajet / Transport" },
  { id: "work", label: "Travail / Focus" },
  { id: "relax", label: "Repos / Dimanche" },
  { id: "cooking", label: "Cuisine" },
  { id: "roadtrip", label: "Road trip" },
  { id: "sleep", label: "Endormissement" },
  { id: "social", label: "Apéro entre amis" },
  { id: "solo", label: "Écoute solo introspective" },
] as const;

export const LANGUAGES = [
  { id: "french", label: "Français" },
  { id: "english", label: "Anglais" },
  { id: "spanish", label: "Espagnol" },
  { id: "portuguese", label: "Portugais" },
  { id: "italian", label: "Italien" },
  { id: "german", label: "Allemand" },
  { id: "korean", label: "Coréen" },
  { id: "japanese", label: "Japonais" },
  { id: "arabic", label: "Arabe" },
  { id: "instrumental", label: "Instrumental (sans paroles)" },
] as const;

export const VOCAL_PREFERENCES = [
  { id: "mixed", label: "Mixte — peu importe" },
  { id: "female", label: "Voix féminines" },
  { id: "male", label: "Voix masculines" },
  { id: "instrumental", label: "Instrumental uniquement" },
] as const;

export const SLIDER_TRAITS = [
  {
    id: "discoveryScore" as const,
    label: "Découverte vs Nostalgie",
    low: "Classiques & hits connus",
    high: "Nouveautés & artistes émergents",
  },
  {
    id: "energyScore" as const,
    label: "Calme vs Énergique",
    low: "Ambiance douce & apaisante",
    high: "Rythmes intenses & entraînants",
  },
  {
    id: "lyricFocusScore" as const,
    label: "Instrumental vs Paroles",
    low: "Musique avant tout",
    high: "Textes & storytelling",
  },
  {
    id: "mainstreamScore" as const,
    label: "Underground vs Mainstream",
    low: "Pépites cachées & niches",
    high: "Hits du moment & grands classiques",
  },
];

export const QUIZ_STEPS = [
  { id: "profile", title: "Profil", description: "Qui êtes-vous ?" },
  { id: "genres", title: "Genres", description: "Vos styles préférés" },
  { id: "artists", title: "Artistes", description: "Vos incontournables" },
  { id: "decades", title: "Époques", description: "Vos décennies favorites" },
  { id: "moods", title: "Ambiances", description: "Vos humeurs musicales" },
  { id: "contexts", title: "Contextes", description: "Quand écoutez-vous ?" },
  { id: "languages", title: "Langues", description: "Vos langues préférées" },
  { id: "traits", title: "Profil sonore", description: "Votre personnalité musicale" },
  { id: "extras", title: "Bonus", description: "Détails personnels" },
  { id: "review", title: "Récapitulatif", description: "Vérification finale" },
] as const;

export type QuizStepId = (typeof QUIZ_STEPS)[number]["id"];

export type RatedItem = { id: string; rating: number };

export type ArtistItem = { name: string; importance: number };

export type QuizFormData = {
  name: string;
  email: string;
  genres: RatedItem[];
  artists: ArtistItem[];
  decades: RatedItem[];
  moods: RatedItem[];
  contexts: RatedItem[];
  languages: RatedItem[];
  discoveryScore: number;
  energyScore: number;
  lyricFocusScore: number;
  mainstreamScore: number;
  vocalPreference: string;
  mustHaveArtists: string[];
  avoidArtists: string[];
  dreamConcert: string;
  anthemSong: string;
  guiltyPleasure: string;
};

export const EMPTY_QUIZ: QuizFormData = {
  name: "",
  email: "",
  genres: [],
  artists: [],
  decades: [],
  moods: [],
  contexts: [],
  languages: [],
  discoveryScore: 50,
  energyScore: 50,
  lyricFocusScore: 50,
  mainstreamScore: 50,
  vocalPreference: "mixed",
  mustHaveArtists: [],
  avoidArtists: [],
  dreamConcert: "",
  anthemSong: "",
  guiltyPleasure: "",
};
