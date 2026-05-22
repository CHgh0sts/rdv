"use client";

import {
  SLIDER_TRAITS,
  VOCAL_PREFERENCES,
  type QuizFormData,
} from "@/lib/quiz-data";

type Props = {
  data: QuizFormData;
  onChange: (patch: Partial<QuizFormData>) => void;
};

export function TraitsStep({ data, onChange }: Props) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Votre profil sonore
        </h2>
        <p className="mt-2 text-sm text-muted">
          Ajustez ces curseurs pour affiner votre personnalité musicale.
        </p>
      </div>

      <div className="space-y-6">
        {SLIDER_TRAITS.map((trait) => (
          <div
            key={trait.id}
            className="rounded-2xl border border-border bg-surface p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium">{trait.label}</p>
              <span className="text-sm font-semibold text-brand">
                {data[trait.id]}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={data[trait.id]}
              onChange={(e) =>
                onChange({ [trait.id]: Number(e.target.value) } as Partial<QuizFormData>)
              }
              className="mt-4 w-full"
            />
            <div className="mt-2 flex justify-between text-xs text-muted">
              <span>{trait.low}</span>
              <span>{trait.high}</span>
            </div>
          </div>
        ))}
      </div>

      <div>
        <p className="mb-3 text-sm font-medium">Préférence vocale</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {VOCAL_PREFERENCES.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange({ vocalPreference: option.id })}
              className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                data.vocalPreference === option.id
                  ? "border-brand bg-brand-muted text-brand"
                  : "border-border bg-surface hover:border-brand/30"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
