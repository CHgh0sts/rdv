"use client";

import { TagInput } from "@/components/ui/TagInput";
import { MusicAutocomplete } from "@/components/ui/MusicAutocomplete";
import type { QuizFormData } from "@/lib/quiz-data";

type Props = {
  data: QuizFormData;
  onChange: (patch: Partial<QuizFormData>) => void;
};

export function ExtrasStep({ data, onChange }: Props) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Quelques détails en plus
        </h2>
        <p className="mt-2 text-sm text-muted">
          Ces champs sont optionnels. Les suggestions viennent de Spotify.
        </p>
      </div>

      <Field
        label="Votre hymne personnel"
        hint="La chanson qui vous représente le mieux"
        value={data.anthemSong}
        onChange={(anthemSong) => onChange({ anthemSong })}
        searchType="track"
      />
      <Field
        label="Guilty pleasure"
        hint="Ce titre que vous assumez à moitié…"
        value={data.guiltyPleasure}
        onChange={(guiltyPleasure) => onChange({ guiltyPleasure })}
        searchType="track"
      />
      <Field
        label="Concert de rêve"
        hint="Artiste ou groupe que vous rêveriez de voir live"
        value={data.dreamConcert}
        onChange={(dreamConcert) => onChange({ dreamConcert })}
        searchType="artist"
      />

      <div>
        <p className="mb-2 text-sm font-medium">Artistes indispensables</p>
        <p className="mb-3 text-xs text-muted">
          Ceux qui doivent absolument figurer dans une playlist commune
        </p>
        <TagInput
          tags={data.mustHaveArtists}
          onChange={(mustHaveArtists) => onChange({ mustHaveArtists })}
          placeholder="Ex : Stromae"
          searchType="artist"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Artistes à éviter</p>
        <p className="mb-3 text-xs text-muted">
          Ceux que vous ne voulez pas entendre dans la playlist du groupe
        </p>
        <TagInput
          tags={data.avoidArtists}
          onChange={(avoidArtists) => onChange({ avoidArtists })}
          placeholder="Ex : …"
          searchType="artist"
        />
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  searchType = "both",
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  searchType?: "artist" | "track" | "both";
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <p className="mb-2 text-xs text-muted">{hint}</p>
      <MusicAutocomplete
        value={value}
        onChange={onChange}
        searchType={searchType}
      />
    </div>
  );
}
