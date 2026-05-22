"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

type WeightedEntry = {
  label: string;
  score: number;
  votes: number;
};

type AggregateData = {
  participantCount: number;
  genres: WeightedEntry[];
  decades: WeightedEntry[];
  moods: WeightedEntry[];
  contexts: WeightedEntry[];
  languages: WeightedEntry[];
  artists: WeightedEntry[];
  avgDiscovery: number;
  avgEnergy: number;
  avgLyricFocus: number;
  avgMainstream: number;
  mustHaveArtists: string[];
  avoidArtists: string[];
  anthems: string[];
  guiltyPleasures: string[];
};

type PlaylistTrack = {
  query: string;
  reason: string;
  category: string;
};

type SpotifyTrackResult = {
  name: string;
  artist: string;
  reason: string;
};

type LinkedPlaylist = {
  id: string;
  name: string | null;
  url: string | null;
};

type UserPlaylist = {
  id: string;
  name: string;
  url: string;
  trackCount: number;
  imageUrl?: string;
};

export default function AdminPage() {
  const searchParams = useSearchParams();
  const [aggregate, setAggregate] = useState<AggregateData | null>(null);
  const [playlist, setPlaylist] = useState<PlaylistTrack[]>([]);
  const [participants, setParticipants] = useState<
    { id: string; name: string; completedAt: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [spotifyConnected, setSpotifyConnected] = useState(false);
  const [spotifyName, setSpotifyName] = useState<string | null>(null);
  const [spotifyLoading, setSpotifyLoading] = useState(true);
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [spotifyPlaylistUrl, setSpotifyPlaylistUrl] = useState<string | null>(null);
  const [spotifyTracks, setSpotifyTracks] = useState<SpotifyTrackResult[]>([]);
  const [spotifyMessage, setSpotifyMessage] = useState<string | null>(null);
  const [linkedPlaylist, setLinkedPlaylist] = useState<LinkedPlaylist | null>(null);
  const [userPlaylists, setUserPlaylists] = useState<UserPlaylist[]>([]);
  const [playlistInput, setPlaylistInput] = useState("");
  const [linkingPlaylist, setLinkingPlaylist] = useState(false);

  const loadAggregate = useCallback(() => {
    fetch("/api/aggregate")
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setAggregate(json.aggregate);
        setPlaylist(json.playlist);
        setParticipants(json.participants);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Erreur de chargement."),
      );
  }, []);

  const loadSpotifyStatus = useCallback(() => {
    return fetch("/api/spotify/status", { credentials: "same-origin" })
      .then(async (res) => res.json())
      .then((json) => {
        setSpotifyConnected(Boolean(json.connected));
        setSpotifyName(json.displayName ?? null);
        return Boolean(json.connected);
      })
      .finally(() => setSpotifyLoading(false));
  }, []);

  const loadPlaylistLink = useCallback(() => {
    return fetch("/api/spotify/playlist-link", { credentials: "same-origin" })
      .then(async (res) => res.json())
      .then((json) => {
        setLinkedPlaylist(json.linked ?? null);
        setUserPlaylists(json.userPlaylists ?? []);
        if (json.linked?.url) {
          setSpotifyPlaylistUrl(json.linked.url);
        }
      })
      .catch(() => {
        setLinkedPlaylist(null);
        setUserPlaylists([]);
      });
  }, []);

  useEffect(() => {
    loadAggregate();
    loadSpotifyStatus();
    loadPlaylistLink();
  }, [loadAggregate, loadSpotifyStatus, loadPlaylistLink]);

  useEffect(() => {
    const connected = searchParams.get("spotify");
    const spotifyError = searchParams.get("spotify_error");
    if (connected === "connected") {
      setSpotifyMessage("Compte Spotify connecté avec succès.");
      const retry = async () => {
        for (let i = 0; i < 3; i += 1) {
          const ok = await loadSpotifyStatus();
          await loadPlaylistLink();
          if (ok) break;
          await new Promise((r) => setTimeout(r, 400));
        }
      };
      retry();
    }
    if (spotifyError) {
      setSpotifyMessage(decodeURIComponent(spotifyError));
    }
  }, [searchParams, loadSpotifyStatus, loadPlaylistLink]);

  async function copyLinkedPlaylistUrl() {
    const url = linkedPlaylist?.url ?? spotifyPlaylistUrl;
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  async function linkPlaylist(playlistIdOrUrl: string) {
    setLinkingPlaylist(true);
    setSpotifyMessage(null);
    try {
      const res = await fetch("/api/spotify/playlist-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistUrl: playlistIdOrUrl }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setLinkedPlaylist(json.linked);
      setPlaylistInput("");
      setSpotifyMessage(`Playlist liée : ${json.linked.name}`);
      loadPlaylistLink();
    } catch (err) {
      setSpotifyMessage(
        err instanceof Error ? err.message : "Impossible de lier la playlist.",
      );
    } finally {
      setLinkingPlaylist(false);
    }
  }

  async function unlinkPlaylist() {
    await fetch("/api/spotify/playlist-link", { method: "DELETE" });
    setLinkedPlaylist(null);
    setSpotifyMessage("Playlist déliée. Les morceaux créeront une nouvelle playlist.");
  }

  async function copyPlaylist() {
    if (!playlist.length) return;
    const text = playlist.map((t, i) => `${i + 1}. ${t.query} — ${t.reason}`).join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function disconnectSpotify() {
    await fetch("/api/spotify/logout", { method: "POST" });
    setSpotifyConnected(false);
    setSpotifyName(null);
    setSpotifyPlaylistUrl(null);
    setSpotifyTracks([]);
    setSpotifyMessage("Compte Spotify déconnecté.");
  }

  async function createSpotifyPlaylist() {
    setCreatingPlaylist(true);
    setSpotifyMessage(null);
    setSpotifyPlaylistUrl(null);
    setSpotifyTracks([]);

    try {
      const res = await fetch("/api/spotify/playlist", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setSpotifyPlaylistUrl(json.url);
      setSpotifyTracks(json.tracks ?? []);
      if (json.linked && json.url) {
        setLinkedPlaylist((prev) =>
          prev
            ? { ...prev, url: json.url }
            : { id: "", name: "Playlist liée", url: json.url },
        );
      }
      const skipped = json.skippedCount ?? 0;
      const added = json.trackCount ?? 0;
      if (json.linked) {
        setSpotifyMessage(
          skipped > 0
            ? `${added} morceau(x) ajouté(s) à la playlist liée (${skipped} déjà présents).`
            : `${added} morceau(x) ajouté(s) à la playlist liée.`,
        );
      } else {
        setSpotifyMessage(`${added} morceaux ajoutés à une nouvelle playlist Spotify.`);
      }
    } catch (err) {
      setSpotifyMessage(
        err instanceof Error ? err.message : "Erreur lors de la création.",
      );
    } finally {
      setCreatingPlaylist(false);
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="rounded-2xl bg-brand-muted px-4 py-3 text-sm text-brand">
          {error}
        </p>
        <p className="mt-4 text-sm text-muted">
          Vérifiez que PostgreSQL est démarré et que{" "}
          <code className="rounded bg-border px-1">DATABASE_URL</code> est configuré
          dans votre fichier <code className="rounded bg-border px-1">.env</code>.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm underline">
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  if (!aggregate) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 text-center text-muted">
        Chargement du tableau de bord…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-brand">Tableau de bord collectif</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Synthèse des goûts musicaux
          </h1>
          <p className="mt-2 text-sm text-muted">
            {aggregate.participantCount} participant
            {aggregate.participantCount > 1 ? "s" : ""} · base pour votre playlist
          </p>
        </div>
        <Link href="/quiz">
          <Button variant="secondary">Ajouter un participant</Button>
        </Link>
      </div>

      <section className="mt-10 rounded-3xl border-2 border-brand/25 bg-brand-muted p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">
              Étape 1 · Spotify
            </p>
            <h2 className="text-xl font-semibold">Connecter votre compte</h2>
            {!spotifyLoading && spotifyConnected ? (
              <p className="text-sm text-brand">
                Connecté{spotifyName ? ` en tant que ${spotifyName}` : ""}.
              </p>
            ) : (
              <p className="text-sm text-muted">
                Connectez-vous pour lier une playlist et y ajouter des morceaux.
              </p>
            )}
            {spotifyMessage && (
              <p className="rounded-xl bg-surface px-4 py-2 text-sm text-foreground">
                {spotifyMessage}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {!spotifyConnected ? (
              <a href="/api/spotify/login">
                <Button>Connecter Spotify</Button>
              </a>
            ) : (
              <>
                <Button
                  onClick={createSpotifyPlaylist}
                  disabled={creatingPlaylist || aggregate.participantCount === 0}
                >
                  {creatingPlaylist
                    ? "Ajout en cours…"
                    : linkedPlaylist
                      ? "Ajouter les morceaux du quiz"
                      : "Créer une playlist"}
                </Button>
                <Button variant="secondary" onClick={disconnectSpotify}>
                  Déconnecter
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-5 space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">
              Étape 2 · Lier une playlist
            </p>
            <p className="mt-1 text-sm text-muted">
              Collez l&apos;URL ou choisissez une playlist ci-dessous. Les nouveaux
              morceaux s&apos;y ajoutent automatiquement.
            </p>
          </div>

          {linkedPlaylist ? (
            <div className="rounded-xl border border-brand/20 bg-brand-muted p-4">
              <p className="text-sm font-medium">Playlist liée</p>
              <p className="mt-1 text-sm">{linkedPlaylist.name ?? "Sans titre"}</p>
              {linkedPlaylist.url && (
                <p className="mt-1 break-all text-xs text-muted">{linkedPlaylist.url}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {linkedPlaylist.url && (
                  <>
                    <a href={linkedPlaylist.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary">Ouvrir sur Spotify</Button>
                    </a>
                    <Button variant="secondary" onClick={copyLinkedPlaylistUrl}>
                      {copiedLink ? "Lien copié !" : "Copier le lien"}
                    </Button>
                  </>
                )}
                <Button variant="secondary" onClick={unlinkPlaylist}>
                  Délier
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">
              Aucune playlist liée pour le moment.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <input
              value={playlistInput}
              onChange={(e) => setPlaylistInput(e.target.value)}
              placeholder="https://open.spotify.com/playlist/…"
              disabled={!spotifyConnected || linkingPlaylist}
              className="min-w-[260px] flex-1 rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-brand disabled:opacity-50"
            />
            <Button
              variant="secondary"
              disabled={!spotifyConnected || !playlistInput.trim() || linkingPlaylist}
              onClick={() => linkPlaylist(playlistInput)}
            >
              {linkingPlaylist ? "Liaison…" : "Lier cette playlist"}
            </Button>
          </div>

          {!spotifyConnected && (
            <p className="text-sm text-brand">
              Connectez Spotify (étape 1) pour lier ou sélectionner une playlist.
            </p>
          )}

          {spotifyConnected && userPlaylists.length === 0 && (
            <p className="text-sm text-muted">
              Aucune playlist trouvée sur votre compte — collez l&apos;URL manuellement.
            </p>
          )}

          {userPlaylists.length > 0 && (
            <div>
              <p className="mb-3 text-sm font-medium">Vos playlists Spotify</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {userPlaylists.map((pl) => (
                  <button
                    key={pl.id}
                    type="button"
                    onClick={() => linkPlaylist(pl.id)}
                    disabled={linkingPlaylist || !spotifyConnected}
                    className={`rounded-xl border px-4 py-3 text-left text-sm transition hover:border-brand disabled:opacity-50 ${
                      linkedPlaylist?.id === pl.id
                        ? "border-brand bg-brand-muted"
                        : "border-border"
                    }`}
                  >
                    <span className="font-medium">{pl.name}</span>
                    <span className="mt-1 block text-xs text-muted">
                      {pl.trackCount} morceaux · Cliquer pour lier
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {aggregate.participantCount === 0 && (
          <p className="mt-4 text-sm text-brand">
            Au moins 1 réponse au quiz est nécessaire pour ajouter des morceaux.
          </p>
        )}

        {spotifyPlaylistUrl && !linkedPlaylist && (
          <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
            <p className="text-sm font-medium">Dernière playlist créée</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <a
                href={spotifyPlaylistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm text-brand hover:border-brand"
              >
                Ouvrir sur Spotify →
              </a>
              <Button variant="secondary" onClick={copyLinkedPlaylistUrl}>
                {copiedLink ? "Lien copié !" : "Copier le lien"}
              </Button>
            </div>
            {spotifyTracks.length > 0 && (
              <ol className="mt-4 space-y-2">
                {spotifyTracks.map((track, index) => (
                  <li
                    key={`${track.name}-${index}`}
                    className="flex flex-wrap justify-between gap-2 text-sm"
                  >
                    <span>
                      {track.name} — {track.artist}
                    </span>
                    <span className="text-xs text-muted">{track.reason}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </section>

      {aggregate.participantCount === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-muted">Aucune réponse pour le moment.</p>
          <Link href="/quiz" className="mt-4 inline-block">
            <Button>Lancer le premier quiz</Button>
          </Link>
        </div>
      ) : (
        <>
          <section className="mt-10 grid gap-4 sm:grid-cols-4">
            <Stat label="Découverte moy." value={`${Math.round(aggregate.avgDiscovery)}/100`} />
            <Stat label="Énergie moy." value={`${Math.round(aggregate.avgEnergy)}/100`} />
            <Stat label="Focus paroles" value={`${Math.round(aggregate.avgLyricFocus)}/100`} />
            <Stat label="Mainstream" value={`${Math.round(aggregate.avgMainstream)}/100`} />
          </section>

          <section className="mt-10 grid gap-6 lg:grid-cols-2">
            <Ranking title="Genres dominants" items={aggregate.genres} />
            <Ranking title="Artistes populaires" items={aggregate.artists} />
            <Ranking title="Ambiances" items={aggregate.moods} />
            <Ranking title="Contextes" items={aggregate.contexts} />
            <Ranking title="Époques" items={aggregate.decades} />
            <Ranking title="Langues" items={aggregate.languages} />
          </section>

          {(aggregate.mustHaveArtists.length > 0 ||
            aggregate.avoidArtists.length > 0) && (
            <section className="mt-10 grid gap-6 sm:grid-cols-2">
              <TagBlock
                title="Indispensables (tous confondus)"
                tags={aggregate.mustHaveArtists}
              />
              <TagBlock title="À éviter" tags={aggregate.avoidArtists} />
            </section>
          )}

          <section className="mt-12 rounded-3xl border border-brand/15 bg-brand-muted p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Playlist suggérée</h2>
                <p className="mt-2 text-sm text-muted">
                  Pistes de recherche pour construire votre playlist manuellement.
                </p>
              </div>
              <Button variant="secondary" onClick={copyPlaylist}>
                {copied ? "Copié !" : "Copier la liste"}
              </Button>
            </div>

            <ol className="mt-6 space-y-3">
              {playlist.map((track, index) => (
                <li
                  key={`${track.query}-${index}`}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{track.query}</p>
                    <p className="text-xs text-muted">{track.reason}</p>
                  </div>
                  <span className="rounded-full bg-brand-muted px-2.5 py-1 text-[11px] text-brand">
                    {track.category}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-12">
            <h2 className="text-lg font-semibold">Participants</h2>
            <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface">
              {participants.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm"
                >
                  <span className="font-medium">{p.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-muted">
                      {new Date(p.completedAt).toLocaleDateString("fr-FR")}
                    </span>
                    <Link
                      href={`/results/${p.id}`}
                      className="text-brand hover:underline"
                    >
                      Voir le profil
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-brand">{value}</p>
    </div>
  );
}

function Ranking({
  title,
  items,
}: {
  title: string;
  items: WeightedEntry[];
}) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="mb-4 text-sm font-semibold text-brand">{title}</h3>
      <ul className="space-y-3">
        {items.slice(0, 6).map((item) => (
          <li key={item.label} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{item.label}</span>
              <span className="text-muted">
                {item.score.toFixed(1)} · {item.votes} vote{item.votes > 1 ? "s" : ""}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-brand-muted">
              <div
                className="h-full rounded-full bg-brand"
                style={{ width: `${Math.min(100, (item.score / 5) * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

function TagBlock({ title, tags }: { title: string; tags: string[] }) {
  return (
    <article className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="mb-4 text-sm font-semibold text-brand">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-brand-muted px-3 py-1 text-xs text-brand"
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
