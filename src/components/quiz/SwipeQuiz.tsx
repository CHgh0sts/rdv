"use client";

import Link from "next/link";
import Image from "next/image";
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

const PREFETCH_TARGET = 14;

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
  const [audioReady, setAudioReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [prefetchReady, setPrefetchReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadingRef = useRef(false);
  const audioUnlockedRef = useRef(false);

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
    if (phase === "intro") setError(null);

    try {
      const response = await fetch("/api/quiz/tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seenIds,
          likes,
          dislikes,
          count: phase === "intro" ? 12 : 10,
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
      if (phase !== "intro") {
        setError(err instanceof Error ? err.message : "Erreur inconnue.");
      }
    } finally {
      setLoadingTracks(false);
      loadingRef.current = false;
    }
  }, [dislikes, likes, phase, seenIds]);

  useEffect(() => {
    if (phase === "submitting") return;

    const shouldLoad =
      phase === "intro"
        ? queue.length < PREFETCH_TARGET
        : !done && queue.length <= 3;

    if (shouldLoad && !loadingTracks) {
      loadMoreTracks();
    }
  }, [phase, queue.length, done, loadingTracks, loadMoreTracks]);

  useEffect(() => {
    setPrefetchReady(queue.length >= 6);
  }, [queue.length]);

  useEffect(() => {
    for (const track of queue.slice(0, 5)) {
      if (track.albumArt) {
        const img = new window.Image();
        img.src = track.albumArt;
      }
      if (track.previewUrl) {
        const audio = document.createElement("audio");
        audio.preload = "auto";
        audio.src = track.previewUrl;
      }
    }
  }, [queue]);

  const stopPreview = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audioRef.current = null;
    setIsPlaying(false);
  }, []);

  const playPreview = useCallback(async () => {
    stopPreview();

    if (!current?.previewUrl || !audioUnlockedRef.current) {
      setAudioBlocked(!audioUnlockedRef.current && !!current?.previewUrl);
      setIsPlaying(false);
      return;
    }

    const audio = new Audio(current.previewUrl);
    audio.volume = 0.85;
    audio.loop = true;
    audioRef.current = audio;

    audio.addEventListener("playing", () => {
      setIsPlaying(true);
      setAudioBlocked(false);
    });
    audio.addEventListener("pause", () => setIsPlaying(false));

    try {
      await audio.play();
      setAudioReady(true);
      setAudioBlocked(false);
    } catch {
      setAudioBlocked(true);
      setIsPlaying(false);
    }
  }, [current?.previewUrl, stopPreview]);

  useEffect(() => {
    if (phase !== "swipe" || !current) return;
    playPreview();
    return () => stopPreview();
  }, [phase, current?.id, current?.previewUrl, playPreview, stopPreview]);

  async function unlockAudio() {
    audioUnlockedRef.current = true;
    setAudioReady(true);
    setAudioBlocked(false);

    try {
      const silent = new Audio(
        "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRwmHAAAAAAD/+1DEAAAHAAGf9AAAIAAANIAAAAQAAA0gAAAAAA==",
      );
      silent.volume = 0.01;
      await silent.play();
      silent.pause();
    } catch {
      // ignore — la lecture du morceau tentera quand même
    }
  }

  async function startQuiz() {
    if (!name.trim()) {
      setError("Indiquez votre prénom ou pseudo.");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Adresse e-mail invalide.");
      return;
    }
    setError(null);
    await unlockAudio();
    setDecisions([]);
    setPhase("swipe");
    if (queue.length <= 3) {
      loadMoreTracks();
    }
  }

  function commitSwipe(direction: "like" | "dislike") {
    if (!current || exitDirection) return;

    stopPreview();
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
          Écoutez l&apos;extrait automatiquement, regardez la pochette, puis swipez
          pour affiner vos goûts — comme une app de rencontres, mais pour la musique.
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

        <div className="mt-6 rounded-xl border border-border bg-surface px-4 py-3 text-sm">
          {loadingTracks && queue.length === 0 ? (
            <p className="text-muted">Préparation des morceaux en arrière-plan…</p>
          ) : prefetchReady ? (
            <p className="text-brand">
              {queue.length} morceaux prêts — vous pourrez swiper dès le départ
            </p>
          ) : (
            <p className="text-muted">
              Chargement en cours… {queue.length > 0 ? `${queue.length} morceau(x) prêt(s)` : ""}
            </p>
          )}
        </div>

        <Button className="mt-8 w-full" onClick={startQuiz} disabled={queue.length === 0}>
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
            className={`swipe-card absolute inset-0 flex flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-xl ${
              exitDirection ? "swipe-card-exit" : ""
            }`}
            style={{
              transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
            }}
            onPointerDown={(e) => {
              if (audioBlocked) {
                void playPreview();
              }
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
            <div className="relative flex-1 bg-brand-muted">
              {current.albumArt ? (
                <Image
                  src={current.albumArt}
                  alt={`Pochette de ${current.name}`}
                  fill
                  priority
                  sizes="(max-width: 448px) 100vw, 448px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand/30 to-brand/70 text-white/80">
                  <span className="text-6xl">♪</span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />

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

              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                {current.previewUrl ? (
                  <>
                    <span
                      className={`inline-flex h-2 w-2 rounded-full ${
                        isPlaying ? "bg-green-400 animate-pulse" : "bg-yellow-300"
                      }`}
                    />
                    {isPlaying
                      ? "Extrait en cours"
                      : audioBlocked
                        ? "Touchez pour lancer l'extrait"
                        : "Chargement de l'extrait…"}
                  </>
                ) : (
                  <>
                    <span className="inline-flex h-2 w-2 rounded-full bg-white/50" />
                    Extrait indisponible
                  </>
                )}
              </div>
            </div>

            <div className="bg-black px-6 py-5 text-white">
              <p className="text-xs uppercase tracking-wide text-white/60">
                {current.genres.slice(0, 2).join(" · ")}
              </p>
              <h2 className="mt-1 text-2xl font-semibold leading-tight">
                {current.name}
              </h2>
              <p className="mt-1 text-base text-white/85">{current.artist}</p>
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
        {audioReady && current?.previewUrl ? " · extrait auto activé" : ""}
      </p>

      {error && <p className="mt-4 text-center text-sm text-brand">{error}</p>}
    </div>
  );
}
