import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { SITE_ICON } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SoundMatch — Quiz des goûts musicaux",
  description:
    "Découvrez les goûts musicaux de votre groupe et créez une playlist qui rassemble tout le monde.",
  icons: {
    icon: SITE_ICON,
    shortcut: SITE_ICON,
    apple: SITE_ICON,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="group flex items-center gap-3">
              <Image
                src={SITE_ICON}
                alt="SoundMatch"
                width={36}
                height={36}
                className="h-9 w-9"
                priority
              />
              <div>
                <p className="text-sm font-semibold tracking-tight group-hover:text-brand transition-colors">
                  SoundMatch
                </p>
                <p className="text-xs text-muted">Quiz musical collectif</p>
              </div>
            </Link>
            <nav className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/quiz"
                className="rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:border-brand hover:text-brand"
              >
                Quiz
              </Link>
              <Link
                href="/admin"
                className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-light"
              >
                Admin · Playlist
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border py-8 text-center text-xs text-muted">
          SoundMatch — Cartographier les goûts musicaux pour créer la playlist parfaite.
        </footer>
      </body>
    </html>
  );
}
