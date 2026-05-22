import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <section className="animate-fade-in">
        <p className="mb-4 inline-flex rounded-full bg-brand-muted px-3 py-1 text-xs font-medium text-brand">
          Quiz musical · PostgreSQL · Next.js
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Découvrez les goûts musicaux de votre groupe
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Swipez des morceaux à gauche ou à droite — comme une app de rencontres,
          mais pour la musique. En ~36 choix, on déduit votre profil et alimente
          la playlist collective du groupe.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/quiz"
            className="inline-flex items-center rounded-full bg-brand px-6 py-3 text-sm font-medium text-white transition hover:bg-brand-light"
          >
            Commencer le quiz
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-full border-2 border-brand bg-surface px-6 py-3 text-sm font-medium text-brand transition hover:bg-brand hover:text-white"
          >
            Admin · Créer la playlist
          </Link>
        </div>
      </section>

      <section className="mt-12 rounded-2xl border-2 border-brand/20 bg-brand-muted p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">
              Espace organisateur
            </p>
            <h2 className="mt-1 text-lg font-semibold">
              Synthèse du groupe &amp; playlist Spotify
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Accédez au tableau de bord pour voir les goûts de tous les
              participants et générer la playlist collective en un clic.
            </p>
          </div>
          <Link
            href="/admin"
            className="inline-flex shrink-0 items-center rounded-full bg-brand px-6 py-3 text-sm font-medium text-white transition hover:bg-brand-light"
          >
            Ouvrir l&apos;admin →
          </Link>
        </div>
      </section>

      <section className="mt-20 grid gap-6 sm:grid-cols-3">
        {[
          {
            title: "Swipe musical",
            text: "36 morceaux à écouter — gauche « pas mon truc », droite « j'aime ».",
          },
          {
            title: "Affinage intelligent",
            text: "Les prochains titres s'adaptent à vos likes pour mieux cerner vos goûts.",
          },
          {
            title: "Playlist collective",
            text: "Le tableau de bord synthétise les profils et propose une playlist de groupe.",
          },
        ].map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
          >
            <h2 className="text-base font-semibold">{item.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="mt-20 rounded-2xl border border-brand/15 bg-brand-muted p-8">
        <h2 className="text-xl font-semibold">Comment ça marche ?</h2>
        <ol className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
          <li>
            <span className="mr-2 font-semibold text-brand">1.</span>
            Chaque participant swipe ~36 morceaux (~3 min).
          </li>
          <li>
            <span className="mr-2 font-semibold text-brand">2.</span>
            L&apos;app déduit genres, artistes et ambiances à partir des likes.
          </li>
          <li>
            <span className="mr-2 font-semibold text-brand">3.</span>
            Le tableau de bord agrège les tendances du groupe.
          </li>
          <li>
            <span className="mr-2 font-semibold text-brand">4.</span>
            Vous obtenez une base solide pour construire votre playlist sur Spotify, Apple Music, etc.
          </li>
        </ol>
      </section>
    </div>
  );
}
