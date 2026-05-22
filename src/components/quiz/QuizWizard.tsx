"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArtistStep } from "@/components/quiz/ArtistStep";
import { ExtrasStep } from "@/components/quiz/ExtrasStep";
import { RatedGrid } from "@/components/quiz/RatedGrid";
import { ReviewStep } from "@/components/quiz/ReviewStep";
import { TraitsStep } from "@/components/quiz/TraitsStep";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  CONTEXTS,
  DECADES,
  EMPTY_QUIZ,
  GENRES,
  LANGUAGES,
  MOODS,
  QUIZ_STEPS,
  type QuizFormData,
} from "@/lib/quiz-data";
import { validateQuizStep } from "@/lib/quiz-validation";

export function QuizWizard() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<QuizFormData>(EMPTY_QUIZ);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const currentStep = QUIZ_STEPS[stepIndex];

  const stepLabels = useMemo(
    () => QUIZ_STEPS.map((step) => step.title),
    [],
  );

  function update(patch: Partial<QuizFormData>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  function goNext() {
    const validationError = validateQuizStep(currentStep.id, data);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStepIndex((index) => Math.min(index + 1, QUIZ_STEPS.length - 1));
  }

  function goBack() {
    setError(null);
    setStepIndex((index) => Math.max(index - 1, 0));
  }

  async function submit() {
    const validationError = validateQuizStep("genres", data);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error ?? "Erreur lors de l'envoi.");
      }

      router.push(`/results/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand/15 bg-brand-muted px-4 py-3">
        <p className="text-sm text-muted">
          Vous organisez l&apos;événement ?
        </p>
        <Link
          href="/admin"
          className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-light"
        >
          Admin · Playlist →
        </Link>
      </div>

      <ProgressBar
        current={stepIndex + 1}
        total={QUIZ_STEPS.length}
        label={`${currentStep.title} — ${currentStep.description}`}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {stepLabels.map((label, index) => (
          <span
            key={label}
            className={`rounded-full px-2.5 py-1 text-[11px] ${
              index === stepIndex
                ? "bg-brand text-white"
                : index < stepIndex
                  ? "bg-brand-muted text-brand"
                  : "bg-border/40 text-muted"
            }`}
          >
            {label}
          </span>
        ))}
      </div>

      <div className="mt-10 rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        {currentStep.id === "profile" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Commençons par vous
              </h2>
              <p className="mt-2 text-sm text-muted">
                Vos réponses alimentent la playlist collective du groupe.
              </p>
            </div>
            <Field
              label="Prénom ou pseudo"
              required
              value={data.name}
              onChange={(name) => update({ name })}
            />
            <Field
              label="E-mail (optionnel)"
              value={data.email}
              onChange={(email) => update({ email })}
              type="email"
            />
          </div>
        )}

        {currentStep.id === "genres" && (
          <RatedGrid
            title="Genres musicaux"
            description="Sélectionnez vos genres préférés et notez-les."
            options={GENRES}
            selected={data.genres}
            minSelection={3}
            onChange={(genres) => update({ genres })}
          />
        )}

        {currentStep.id === "artists" && (
          <ArtistStep
            artists={data.artists}
            onChange={(artists) => update({ artists })}
          />
        )}

        {currentStep.id === "decades" && (
          <RatedGrid
            title="Époques favorites"
            description="Quelles décennies ou périodes vous parlent le plus ?"
            options={DECADES}
            selected={data.decades}
            minSelection={2}
            onChange={(decades) => update({ decades })}
          />
        )}

        {currentStep.id === "moods" && (
          <RatedGrid
            title="Ambiances"
            description="Quelles humeurs recherchez-vous dans votre musique ?"
            options={MOODS}
            selected={data.moods}
            minSelection={3}
            onChange={(moods) => update({ moods })}
          />
        )}

        {currentStep.id === "contexts" && (
          <RatedGrid
            title="Contextes d'écoute"
            description="Dans quelles situations écoutez-vous le plus ?"
            options={CONTEXTS}
            selected={data.contexts}
            minSelection={2}
            onChange={(contexts) => update({ contexts })}
          />
        )}

        {currentStep.id === "languages" && (
          <RatedGrid
            title="Langues"
            description="Quelles langues ou types de voix préférez-vous ?"
            options={LANGUAGES}
            selected={data.languages}
            minSelection={1}
            onChange={(languages) => update({ languages })}
          />
        )}

        {currentStep.id === "traits" && (
          <TraitsStep data={data} onChange={update} />
        )}

        {currentStep.id === "extras" && (
          <ExtrasStep data={data} onChange={update} />
        )}

        {currentStep.id === "review" && <ReviewStep data={data} />}

        {error && (
          <p className="mt-6 rounded-xl bg-brand-muted px-4 py-3 text-sm text-brand">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={goBack}
            disabled={stepIndex === 0 || submitting}
          >
            Retour
          </Button>

          {currentStep.id !== "review" ? (
            <Button type="button" onClick={goNext}>
              Continuer
            </Button>
          ) : (
            <Button type="button" onClick={submit} disabled={submitting}>
              {submitting ? "Envoi en cours…" : "Envoyer mes réponses"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
        {required && <span className="text-brand"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand"
      />
    </div>
  );
}
