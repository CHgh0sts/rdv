"use client";

import { StarRating } from "@/components/ui/StarRating";
import type { RatedItem } from "@/lib/quiz-data";

type Option = { id: string; label: string };

type Props = {
  title: string;
  description: string;
  options: readonly Option[];
  selected: RatedItem[];
  minSelection?: number;
  onChange: (items: RatedItem[]) => void;
};

export function RatedGrid({
  title,
  description,
  options,
  selected,
  minSelection = 1,
  onChange,
}: Props) {
  const selectedMap = new Map(selected.map((item) => [item.id, item.rating]));

  function toggle(id: string) {
    if (selectedMap.has(id)) {
      onChange(selected.filter((item) => item.id !== id));
      return;
    }
    onChange([...selected, { id, rating: 4 }]);
  }

  function setRating(id: string, rating: number) {
    onChange(
      selected.map((item) => (item.id === id ? { ...item, rating } : item)),
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-sm text-muted">{description}</p>
        <p className="mt-1 text-xs text-brand">
          Minimum {minSelection} sélection{minSelection > 1 ? "s" : ""} ·{" "}
          {selected.length} choisi{selected.length > 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = selectedMap.has(option.id);
          const rating = selectedMap.get(option.id) ?? 4;

          return (
            <div
              key={option.id}
              className={`rounded-2xl border p-4 transition ${
                isSelected
                  ? "border-brand bg-brand-muted"
                  : "border-border bg-surface hover:border-brand/30"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(option.id)}
                className="w-full text-left"
              >
                <span className="text-sm font-medium">{option.label}</span>
              </button>
              {isSelected && (
                <div className="mt-3 border-t border-brand/10 pt-3">
                  <StarRating
                    value={rating}
                    onChange={(value) => setRating(option.id, value)}
                    label="Note"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
