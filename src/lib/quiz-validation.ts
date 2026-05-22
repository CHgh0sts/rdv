import type { QuizFormData } from "./quiz-data";

export function validateQuizStep(
  stepId: string,
  data: QuizFormData,
): string | null {
  switch (stepId) {
    case "profile":
      if (!data.name.trim()) return "Indiquez votre prénom ou pseudo.";
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        return "Adresse e-mail invalide.";
      }
      return null;
    case "genres":
      if (data.genres.length < 3) return "Sélectionnez au moins 3 genres.";
      return null;
    case "artists":
      if (data.artists.length < 2) return "Ajoutez au moins 2 artistes.";
      return null;
    case "decades":
      if (data.decades.length < 2) return "Sélectionnez au moins 2 époques.";
      return null;
    case "moods":
      if (data.moods.length < 3) return "Sélectionnez au moins 3 ambiances.";
      return null;
    case "contexts":
      if (data.contexts.length < 2) return "Sélectionnez au moins 2 contextes.";
      return null;
    case "languages":
      if (data.languages.length < 1) return "Sélectionnez au moins 1 langue.";
      return null;
    case "traits":
      if (!data.vocalPreference) return "Choisissez une préférence vocale.";
      return null;
    default:
      return null;
  }
}

export function sanitizeQuizPayload(data: QuizFormData) {
  return {
    name: data.name.trim(),
    email: data.email.trim() || null,
    genres: data.genres.map((g) => ({ genre: g.id, rating: g.rating })),
    artists: data.artists.map((a) => ({
      artistName: a.name.trim(),
      importance: a.importance,
    })),
    decades: data.decades.map((d) => ({ decade: d.id, rating: d.rating })),
    moods: data.moods.map((m) => ({ mood: m.id, rating: m.rating })),
    contexts: data.contexts.map((c) => ({ context: c.id, rating: c.rating })),
    languages: data.languages.map((l) => ({
      language: l.id,
      rating: l.rating,
    })),
    discoveryScore: data.discoveryScore,
    energyScore: data.energyScore,
    lyricFocusScore: data.lyricFocusScore,
    mainstreamScore: data.mainstreamScore,
    vocalPreference: data.vocalPreference,
    mustHaveArtists: data.mustHaveArtists.map((a) => a.trim()).filter(Boolean),
    avoidArtists: data.avoidArtists.map((a) => a.trim()).filter(Boolean),
    dreamConcert: data.dreamConcert.trim() || null,
    anthemSong: data.anthemSong.trim() || null,
    guiltyPleasure: data.guiltyPleasure.trim() || null,
  };
}
