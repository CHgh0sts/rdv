"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

type ResultData = {
  id: string;
  participant: { name: string };
  completedAt: string;
  profile: Record<string, string | number>;
  genres: { label: string; rating: number }[];
  artists: { name: string; importance: number }[];
  moods: { label: string; rating: number }[];
  extras: {
    anthemSong: string | null;
    guiltyPleasure: string | null;
    dreamConcert: string | null;
  };
};

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [data, setData] = useState<ResultData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/responses/${id}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setData(json);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Erreur de chargement."),
      );
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-brand">{error}</p>
        <Link href="/quiz" className="mt-6 inline-block text-sm underline">
          Refaire le quiz
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center text-muted">
        Chargement de votre profil musical…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 animate-fade-in">
      <p className="text-sm text-brand">Profil enregistré</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Merci, {data.participant.name} !
      </h1>
      <p className="mt-3 text-muted">
        Votre profil musical rejoint la base du groupe. Consultez le tableau de
        bord pour voir la synthèse collective.
      </p>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <Card title="Top genres">
          {data.genres.slice(0, 5).map((g) => (
            <Row key={g.label} label={g.label} value={`${g.rating}/5`} />
          ))}
        </Card>
        <Card title="Artistes clés">
          {data.artists.slice(0, 5).map((a) => (
            <Row key={a.name} label={a.name} value={`${a.importance}/5`} />
          ))}
        </Card>
        <Card title="Ambiances">
          {data.moods.slice(0, 4).map((m) => (
            <Row key={m.label} label={m.label} value={`${m.rating}/5`} />
          ))}
        </Card>
        <Card title="Bonus">
          {data.extras.anthemSong && (
            <Row label="Hymne" value={data.extras.anthemSong} />
          )}
          {data.extras.guiltyPleasure && (
            <Row label="Guilty pleasure" value={data.extras.guiltyPleasure} />
          )}
          {data.extras.dreamConcert && (
            <Row label="Concert de rêve" value={data.extras.dreamConcert} />
          )}
          {!data.extras.anthemSong &&
            !data.extras.guiltyPleasure &&
            !data.extras.dreamConcert && (
              <p className="text-sm text-muted">Aucun détail bonus renseigné.</p>
            )}
        </Card>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/admin">
          <Button>Admin · Créer la playlist →</Button>
        </Link>
        <Link href="/quiz">
          <Button variant="secondary">Nouveau participant</Button>
        </Link>
      </div>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="mb-4 text-sm font-semibold text-brand">{title}</h2>
      <div className="space-y-2">{children}</div>
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span>{label}</span>
      <span className="text-muted">{value}</span>
    </div>
  );
}
