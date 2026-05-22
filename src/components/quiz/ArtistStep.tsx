"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import type { ArtistItem } from "@/lib/quiz-data";

type Props = {
  artists: ArtistItem[];
  onChange: (artists: ArtistItem[]) => void;
};

export function ArtistStep({ artists, onChange }: Props) {
  const [name, setName] = useState("");
  const [importance, setImportance] = useState(4);

  function addArtist() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (artists.some((a) => a.name.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }
    onChange([...artists, { name: trimmed, importance }]);
    setName("");
    setImportance(4);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Vos artistes</h2>
        <p className="mt-2 text-sm text-muted">
          Ajoutez les artistes ou groupes que vous écoutez le plus. Minimum 2.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addArtist();
            }
          }}
          placeholder="Ex : Daft Punk, Angèle, Miles Davis…"
          className="w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-brand"
        />
        <StarRating
          value={importance}
          onChange={setImportance}
          label="Importance"
        />
        <Button type="button" onClick={addArtist}>
          Ajouter l&apos;artiste
        </Button>
      </div>

      {artists.length > 0 && (
        <ul className="space-y-3">
          {artists.map((artist) => (
            <li
              key={artist.name}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3"
            >
              <span className="font-medium">{artist.name}</span>
              <div className="flex items-center gap-3">
                <StarRating
                  value={artist.importance}
                  onChange={(value) =>
                    onChange(
                      artists.map((a) =>
                        a.name === artist.name ? { ...a, importance: value } : a,
                      ),
                    )
                  }
                  label=""
                />
                <button
                  type="button"
                  onClick={() =>
                    onChange(artists.filter((a) => a.name !== artist.name))
                  }
                  className="text-xs text-muted hover:text-brand"
                >
                  Retirer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
