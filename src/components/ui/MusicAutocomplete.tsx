"use client";

import { useEffect, useId, useRef, useState } from "react";

type Suggestion = {
  id: string;
  label: string;
  subtitle?: string;
  type: "artist" | "track";
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchType?: "artist" | "track" | "both";
  onSelect?: (suggestion: Suggestion) => void;
  className?: string;
};

export function MusicAutocomplete({
  value,
  onChange,
  placeholder,
  searchType = "both",
  onSelect,
  className = "",
}: Props) {
  const listId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (value.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: value.trim(),
          type: searchType,
        });
        const res = await fetch(`/api/spotify/search?${params}`, {
          signal: controller.signal,
        });
        const json = await res.json();
        setSuggestions(json.suggestions ?? []);
        setOpen((json.suggestions ?? []).length > 0);
        setActiveIndex(-1);
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
          setOpen(false);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value, searchType]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function pick(suggestion: Suggestion) {
    onChange(suggestion.label);
    onSelect?.(suggestion);
    setOpen(false);
    setSuggestions([]);
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onKeyDown={(e) => {
          if (!open || suggestions.length === 0) return;

          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => (i + 1) % suggestions.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) =>
              i <= 0 ? suggestions.length - 1 : i - 1,
            );
          } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            pick(suggestions[activeIndex]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-brand"
      />

      {loading && (
        <p className="absolute right-3 top-3 text-xs text-muted">…</p>
      )}

      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-border bg-surface shadow-lg"
        >
          {suggestions.map((item, index) => (
            <li key={`${item.type}-${item.id}`} role="option">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(item)}
                className={`flex w-full flex-col px-4 py-3 text-left text-sm transition hover:bg-brand-muted ${
                  index === activeIndex ? "bg-brand-muted" : ""
                }`}
              >
                <span className="font-medium">{item.label}</span>
                {item.subtitle && (
                  <span className="text-xs text-muted">{item.subtitle}</span>
                )}
                <span className="mt-1 text-[10px] uppercase tracking-wide text-brand">
                  {item.type === "artist" ? "Artiste" : "Titre"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
