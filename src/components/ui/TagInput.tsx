"use client";

import { useState } from "react";
import { Button } from "./Button";
import { MusicAutocomplete } from "./MusicAutocomplete";

type Props = {
  placeholder?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  searchType?: "artist" | "track" | "both";
};

export function TagInput({
  placeholder = "Ajouter…",
  tags,
  onChange,
  searchType = "artist",
}: Props) {
  const [input, setInput] = useState("");

  function addTag(value = input) {
    const trimmed = value.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
    setInput("");
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <MusicAutocomplete
          value={input}
          onChange={setInput}
          searchType={searchType}
          placeholder={placeholder}
          onSelect={(suggestion) => addTag(suggestion.label)}
          className="flex-1"
        />
        <Button type="button" variant="secondary" onClick={() => addTag()}>
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
