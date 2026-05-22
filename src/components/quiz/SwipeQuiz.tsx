"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  SWIPE_TARGET,
  type SwipeDecision,
  type SwipeTrack,
} from "@/lib/swipe-tracks";

type Phase = "intro" | "swipe" | "submitting";

export function SwipeQuiz() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [queue, setQueue] = useState<SwipeTrack[]>([]);
  const [decisions, setDecisions] = useState<SwipeDecision[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragX, setDragX] = useState(0);
  const [exitDirection, setExitDirection] = useState<"like" | "dislike" | null>(
    null,
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadingRef = useRef(false);

  const current = queue[0];
  const swipeCount = decisions.length;
  const done = swipeCount >= SWIPE_TARGET;

  const likes = decisions
    .filter((d) => d.direction === "like")
    .map((d) => d.track);
  const dislikes = decisions
    .filter((d) => d.direction === "dislike")
    .map((d) => d.track);
  const seenIds = decisions.map((d) => d.track.id);

  const loadMoreTracks = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoadingTracks(true);
    setError(null);

    try {
      const response = await fetch("/api/quiz/tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seenIds,
          likes,
          dislikes,
          count: 10,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Erreur de chargement.");

      setQueue((prev) => {
        const existing = new Set([...prev.map((t) => t.id), ...seenIds]);
        const fresh = (result.tracks as SwipeTrack[]).filter(
          (t) => !existing.has(t.id),
        );
        return [...prev, ...fresh];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setLoadingTracks(false);
      loadingRef.current = false;
    }
  }, [dislikes, likes, seenIds]);

  useEffect(() => {
    if (phase !== "swipe") return;
    if (queue.length <= 3 && !done && !loadingTracks) {
      loadMoreTracks();
    }
  }, [phase, queue.length, done, loadingTracks, loadMoreTracks]);

  useEffect(() => {
    if (!current?.previewUrl) {
      audioRef.current?.pause();
      return;
    }

    const audio = new Audio(current.previewUrl);
    audio.volume = 0.6;
    audio.play().catch(() => undefined);
    audioRef.current = audio;

    return () => {
      audio.pause();
    };
  }, [current?.id, current?.previewUrl]);

  function startQuiz() {
    if (!name.trim()) {
      setError("Indiquez votre prénom ou pseudo.");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Adresse e-mail invalide.");
      return;
    }
    setError(null);
    setPhase("swipe");
    setQueue([]);
    setDecisions([]);
    loadMoreTracks();
  }

  function commitSwipe(direction: "like" | "dislike") {
    if (!current || exitDirection) return;

    setExitDirection(direction);
    setDragX(direction === "like" ? 420 : -420);

    window.setTimeout(() => {
      setDecisions((prev) => [...prev, { track: current, direction }]);
      setQueue((prev) => prev.slice(1));
      setDragX(0);
      setExitDirection(null);
    }, 220);
  }

  async function submitProfile() {
    setPhase("submitting");
    setError(null);

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email, swipes: decisions }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Erreur lors de l'envoi.");

      router.push(`/results/${result.id}`);
    } catch (err) {
      setPhase("swipe");
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    }
  }

  useEffect(() => {
    if (done && phase === "swipe") {
      submitProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, phase]);

  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-lg px-6 py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand/15 bg-brand-muted px-4 py-3">
          <p className="text-sm text-muted">Swipe gauche = pas mon truc · droite = j&apos;aime</p>
          <Link
            href="/admin"
            className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-light"
          >
            Admin →
          </Link>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight">
          Votre profil musical en {SWIPE_TARGET} swipes
        </h1>
        <p className="mt-3 text-muted">
          Écoutez, swipez, on affine les morceaux au fil de vos choix pour
          déduire vos goûts — comme sur une app de rencontres, mais pour la musique.
        </p>

        <div className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Prénom ou pseudo *</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-brand"
              placeholder="Alex"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">E-mail (optionnel)</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-brand"
              placeholder="alex@exemple.fr"
            />
          </label>
        </div>

        {error && <p className="mt-4 text-sm text-brand">{error}</p>}

        <Button className="mt-8 w-full" onClick={startQuiz}>
          C&apos;est parti →
        </Button>
      </div>
    );
  }

  if (phase === "submitting") {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <p className="text-lg font-medium">Analyse de vos swipes…</p>
        <p className="mt-2 text-sm text-muted">
          On construit votre profil musical à partir de vos {swipeCount} choix.
        </p>
      </div>
    );
  }

  const rotation = dragX * 0.04;
  const likeOpacity = Math.min(Math.max(dragX / 120, 0), 1);
  const dislikeOpacity = Math.min(Math.max(-dragX / 120, 0), 1);

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <ProgressBar
        current={Math.min(swipeCount + 1, SWIPE_TARGET)}
        total={SWIPE_TARGET}
        label={`Morceau ${Math.min(swipeCount + 1, SWIPE_TARGET)} sur ${SWIPE_TARGET}`}
      />

      <p className="mt-3 text-center text-xs text-muted">
        {swipeCount < 8
          ? "On explore des styles variés…"
          : swipeCount < 24
            ? "On affine selon vos likes…"
            : "Dernières cartes pour peaufiner votre profil"}
      </p>

      <div className="relative mx-auto mt-8 aspect-[3/4] max-h-[520px] w-full">
        {current ? (
          <article
            className={`swipe-card absolute inset-0 overflow-hidden rounded-3xl border border-border bg-surface shadow-xl ${
              exitDirection ? "swipe-card-exit" : ""
            }`}
            style={{
              transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
            }}
            onPointerDown={(e) => {
              const startX = e.clientX;
              const onMove = (ev: PointerEvent) => setDragX(ev.clientX - startX);
              const onUp = (ev: PointerEvent) => {
                window.removeEventListener("pointermove", onMove);
                window.removeEventListener("pointerup", onUp);
                const delta = ev.clientX - startX;
                if (delta > 90) commitSwipe("like");
                else if (delta < -90) commitSwipe("dislike");
                else setDragX(0);
              };
              window.addEventListener("pointermove", onMove);
              window.addEventListener("pointerup", onUp);
            }}
          >
            <div
              className="absolute inset-0 bg-gradient-to-b from-brand/20 to-brand/80"
              style={
                current.albumArt
                  ? {
                      backgroundImage: `url(${current.albumArt})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div
              className="absolute left-6 top-6 rounded-lg border-4 border-green-400 px-3 py-1 text-lg font-bold uppercase text-green-400"
              style={{ opacity: likeOpacity, transform: "rotate(-12deg)" }}
            >
              J&apos;aime
            </div>
            <div
              className="absolute right-6 top-6 rounded-lg border-4 border-red-400 px-3 py-1 text-lg font-bold uppercase text-red-400"
              style={{ opacity: dislikeOpacity, transform: "rotate(12deg)" }}
            >
              Nope
            </div>

            <div className="absolute bottom-0 p-6 text-white">
              <p className="text-sm uppercase tracking-wide text-white/70">
                {current.genres.slice(0, 2).join(" · ")}
              </p>
              <h2 className="mt-1 text-2xl font-semibold leading-tight">
                {current.name}
              </h2>
              <p className="mt-1 text-lg text-white/85">{current.artist}</p>
            </div>
          </article>
        ) : (
          <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-border bg-surface text-sm text-muted">
            {loadingTracks ? "Chargement des morceaux…" : "Plus de morceaux disponibles"}
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-center gap-6">
        <button
          type="button"
          aria-label="Je n'aime pas"
          disabled={!current || !!exitDirection}
          onClick={() => commitSwipe("dislike")}
          className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-300 bg-surface text-2xl text-red-500 shadow-sm transition hover:scale-105 hover:bg-red-50 disabled:opacity-40"
        >
          ✕
        </button>
        <button
          type="button"
          aria-label="J'aime"
          disabled={!current || !!exitDirection}
          onClick={() => commitSwipe("like")}
          className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-green-300 bg-surface text-2xl text-green-600 shadow-sm transition hover:scale-105 hover:bg-green-50 disabled:opacity-40"
        >
          ♥
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-muted">
        Glissez la carte ou utilisez les boutons · {likes.length} likes ·{" "}
        {dislikes.length} pass
      </p>

      {error && <p className="mt-4 text-center text-sm text-brand">{error}</p>}
    </div>
  );
}
