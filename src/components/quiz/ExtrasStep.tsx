"use client";

import { TagInput } from "@/components/ui/TagInput";
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
          Ces champs sont optionnels mais très utiles pour affiner la playlist du groupe.
        </p>
      </div>

      <Field
        label="Votre hymne personnel"
        hint="La chanson qui vous représente le mieux"
        value={data.anthemSong}
        onChange={(anthemSong) => onChange({ anthemSong })}
      />
      <Field
        label="Guilty pleasure"
        hint="Ce titre que vous assumez à moitié…"
        value={data.guiltyPleasure}
        onChange={(guiltyPleasure) => onChange({ guiltyPleasure })}
      />
      <Field
        label="Concert de rêve"
        hint="Artiste ou groupe que vous rêveriez de voir live"
        value={data.dreamConcert}
        onChange={(dreamConcert) => onChange({ dreamConcert })}
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
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <p className="mb-2 text-xs text-muted">{hint}</p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand"
      />
    </div>
  );
}
