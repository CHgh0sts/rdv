"use client";

import { useState } from "react";
import { Button } from "./Button";

type Props = {
  placeholder?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
};

export function TagInput({
  placeholder = "Ajouter…",
  tags,
  onChange,
}: Props) {
  const [input, setInput] = useState("");

  function addTag() {
    const value = input.trim();
    if (!value || tags.includes(value)) return;
    onChange([...tags, value]);
    setInput("");
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-brand"
        />
        <Button type="button" variant="secondary" onClick={addTag}>
          Ajouter
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="rounded-full border border-brand/20 bg-brand-muted px-3 py-1 text-xs text-brand transition hover:bg-brand hover:text-white"
            >
              {tag} ×
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
