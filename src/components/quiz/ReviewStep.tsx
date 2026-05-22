"use client";

import {
  CONTEXTS,
  DECADES,
  GENRES,
  LANGUAGES,
  MOODS,
  VOCAL_PREFERENCES,
  type QuizFormData,
} from "@/lib/quiz-data";

type Props = {
  data: QuizFormData;
};

function labelFor(
  list: readonly { id: string; label: string }[],
  id: string,
) {
  return list.find((item) => item.id === id)?.label ?? id;
}

export function ReviewStep({ data }: Props) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Récapitulatif</h2>
        <p className="mt-2 text-sm text-muted">
          Vérifiez vos réponses avant de les envoyer.
        </p>
      </div>

      <ReviewBlock title="Profil">
        <p>{data.name}</p>
        {data.email && <p className="text-muted">{data.email}</p>}
      </ReviewBlock>

      <ReviewBlock title="Genres">
        {data.genres.map((g) => (
          <Tag key={g.id} text={`${labelFor(GENRES, g.id)} (${g.rating}/5)`} />
        ))}
      </ReviewBlock>

      <ReviewBlock title="Artistes">
        {data.artists.map((a) => (
          <Tag key={a.name} text={`${a.name} (${a.importance}/5)`} />
        ))}
      </ReviewBlock>

      <ReviewBlock title="Époques">
        {data.decades.map((d) => (
          <Tag key={d.id} text={`${labelFor(DECADES, d.id)} (${d.rating}/5)`} />
        ))}
      </ReviewBlock>

      <ReviewBlock title="Ambiances">
        {data.moods.map((m) => (
          <Tag key={m.id} text={`${labelFor(MOODS, m.id)} (${m.rating}/5)`} />
        ))}
      </ReviewBlock>

      <ReviewBlock title="Contextes">
        {data.contexts.map((c) => (
          <Tag key={c.id} text={`${labelFor(CONTEXTS, c.id)} (${c.rating}/5)`} />
        ))}
      </ReviewBlock>

      <ReviewBlock title="Langues">
        {data.languages.map((l) => (
          <Tag key={l.id} text={`${labelFor(LANGUAGES, l.id)} (${l.rating}/5)`} />
        ))}
      </ReviewBlock>

      <ReviewBlock title="Profil sonore">
        <Tag text={`Découverte ${data.discoveryScore}/100`} />
        <Tag text={`Énergie ${data.energyScore}/100`} />
        <Tag text={`Paroles ${data.lyricFocusScore}/100`} />
        <Tag text={`Mainstream ${data.mainstreamScore}/100`} />
        <Tag
          text={labelFor(VOCAL_PREFERENCES, data.vocalPreference)}
        />
      </ReviewBlock>

      {(data.anthemSong ||
        data.guiltyPleasure ||
        data.dreamConcert ||
        data.mustHaveArtists.length > 0 ||
        data.avoidArtists.length > 0) && (
        <ReviewBlock title="Bonus">
          {data.anthemSong && <p>Hymne : {data.anthemSong}</p>}
          {data.guiltyPleasure && <p>Guilty pleasure : {data.guiltyPleasure}</p>}
          {data.dreamConcert && <p>Concert de rêve : {data.dreamConcert}</p>}
          {data.mustHaveArtists.length > 0 && (
            <p>Indispensables : {data.mustHaveArtists.join(", ")}</p>
          )}
          {data.avoidArtists.length > 0 && (
            <p>À éviter : {data.avoidArtists.join(", ")}</p>
          )}
        </ReviewBlock>
      )}
    </div>
  );
}

function ReviewBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="mb-3 text-sm font-semibold text-brand">{title}</h3>
      <div className="space-y-2 text-sm">{children}</div>
    </section>
  );
}

function Tag({ text }: { text: string }) {
  return (
    <span className="mr-2 inline-flex rounded-full bg-brand-muted px-3 py-1 text-xs text-brand">
      {text}
    </span>
  );
}
