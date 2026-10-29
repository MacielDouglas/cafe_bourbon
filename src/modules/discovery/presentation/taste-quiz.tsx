"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { cn } from "cn";
import { DemoBadge } from "@/components/demo-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { formatCents } from "@/modules/catalog/presentation/format";
import type { PairingTier } from "@/modules/pairing/presentation/labels";
import {
  discoveryCategoryOptions,
  discoveryNoteSuggestions,
  discoveryScoreTierLabel,
} from "@/modules/discovery/presentation/labels";

interface RecommendationDTO {
  slug: string;
  name: string;
  type: string;
  typeLabel: string;
  subtitle: string;
  priceCents: number | null;
  isDemoData: boolean;
  score: number;
  tier: PairingTier;
  reason: string;
}

interface ApiResponse {
  fallback: boolean;
  reason: string | null;
  recommendations: RecommendationDTO[];
}

const scaleFields = [
  { key: "intensity", label: "Intensidade", low: "Suave", high: "Marcante" },
  { key: "body", label: "Corpo", low: "Leve", high: "Encorpado" },
  { key: "acidity", label: "Acidez", low: "Baixa", high: "Vibrante" },
] as const;

type ScaleKey = (typeof scaleFields)[number]["key"];

const initialValues: Record<ScaleKey, number> = {
  intensity: 3,
  acidity: 3,
  body: 3,
};

const resultDelay = [
  "catalog-delay-1",
  "catalog-delay-2",
  "catalog-delay-3",
  "catalog-delay-4",
  "catalog-delay-5",
  "catalog-delay-6",
  "catalog-delay-7",
  "catalog-delay-8",
] as const;

function toggled(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function LiveProfile({
  values,
  categories,
  notes,
}: {
  values: Record<ScaleKey, number>;
  categories: string[];
  notes: string[];
}) {
  const categoryLabels = discoveryCategoryOptions
    .filter((option) => categories.includes(option.value))
    .map((option) => option.label);

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-medium tracking-tight">Seu perfil</h2>
        <p className="text-sm text-muted-foreground">
          Atualiza conforme você ajusta os controles.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-5">
        {scaleFields.map((field) => (
          <div key={field.key} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm">{field.label}</span>
              <span className="text-xl font-medium tabular-nums">
                {values[field.key]}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  /5
                </span>
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5" aria-hidden>
              {Array.from({ length: 5 }).map((_, index) => (
                <span
                  key={index}
                  className={cn(
                    "h-1.5 rounded-full transition-colors duration-300",
                    index < values[field.key] ? "bg-brand" : "bg-border",
                  )}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{field.low}</span>
              <span>{field.high}</span>
            </div>
          </div>
        ))}
      </div>

      <dl className="mt-6 flex flex-col gap-3 border-t border-border pt-5 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted-foreground">Coleções</dt>
          <dd className="text-right">
            {categoryLabels.length > 0
              ? categoryLabels.join(", ")
              : "Todas"}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-muted-foreground">Notas</dt>
          <dd className="text-right">
            {notes.length > 0 ? notes.join(" · ") : "Sem preferência"}
          </dd>
        </div>
      </dl>

      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        Quando estiver pronto, peça uma seleção sob medida. O resultado mostra o
        motivo de cada escolha.
      </p>
    </div>
  );
}

export function TasteQuiz() {
  const [values, setValues] = useState<Record<ScaleKey, number>>(initialValues);
  const [categories, setCategories] = useState<string[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{
    values: Record<ScaleKey, number>;
    categories: string[];
    notes: string[];
    price: string;
  } | null>(null);

  function setScale(key: ScaleKey, raw: number | readonly number[]) {
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (typeof value === "number") {
      setValues((current) => ({ ...current, [key]: value }));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setSubmitted({ values, categories, notes, price });

    const parsedPrice = price.trim() ? Number(price.replace(",", ".")) : null;
    const maxPriceCents =
      parsedPrice !== null && Number.isFinite(parsedPrice)
        ? Math.round(parsedPrice * 100)
        : null;

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          categories,
          notes,
          maxPriceCents,
        }),
      });
      if (!response.ok) throw new Error("request failed");
      setResult((await response.json()) as ApiResponse);
    } catch {
      setError("Não conseguimos gerar recomendações agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-8 rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8"
      >
        {scaleFields.map((field) => (
          <div key={field.key} className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-base font-medium">{field.label}</span>
              <span className="text-2xl leading-none font-medium tabular-nums">
                {values[field.key]}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  /5
                </span>
              </span>
            </div>
            <Slider
              min={1}
              max={5}
              step={1}
              value={values[field.key]}
              aria-label={field.label}
              onValueChange={(value) => setScale(field.key, value)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{field.low}</span>
              <span>{field.high}</span>
            </div>
          </div>
        ))}

        <div className="flex flex-col gap-3">
          <span className="text-base font-medium">Coleções de interesse</span>
          <div className="flex flex-wrap gap-2">
            {discoveryCategoryOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setCategories((current) => toggled(current, option.value))}
                className={cn(
                  "inline-flex min-h-10 items-center rounded-full border px-5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                  categories.includes(option.value)
                    ? "border-primary bg-primary text-primary-foreground shadow-soft"
                    : "border-border text-foreground/70 hover:border-foreground/40 hover:bg-secondary",
                )}
                aria-pressed={categories.includes(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            Sem escolha = buscamos em todas as coleções.
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-base font-medium">Notas que você gosta</span>
          <div className="flex flex-wrap gap-2">
            {discoveryNoteSuggestions.map((note) => (
              <button
                key={note}
                type="button"
                onClick={() => setNotes((current) => toggled(current, note))}
                className={cn(
                  "inline-flex min-h-9 items-center rounded-full border px-4 text-xs capitalize outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                  notes.includes(note)
                    ? "border-brand/40 bg-brand/10 text-brand"
                    : "border-border text-foreground/70 hover:border-foreground/40 hover:bg-secondary",
                )}
                aria-pressed={notes.includes(note)}
              >
                {note}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-base font-medium">
            Preço máximo por item (opcional)
          </span>
          <Input
            inputMode="decimal"
            placeholder="Ex.: 30,00"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </label>

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="w-full sm:w-fit"
        >
          {loading ? "Buscando..." : "Ver recomendações"}
        </Button>
      </form>

      <div className="flex flex-col gap-5">
        {error && (
          <p
            role="alert"
            className="rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        {loading ? (
          <div
            role="status"
            className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8"
          >
            <div className="flex items-center gap-3">
              <span
                className="size-2.5 animate-pulse rounded-full bg-brand"
                aria-hidden
              />
              <p className="text-base font-medium">Lendo seu perfil...</p>
            </div>
            <div className="flex flex-col gap-3" aria-hidden>
              {[0, 1, 2].map((row) => (
                <div
                  key={row}
                  className="flex flex-col gap-2 rounded-2xl border border-border px-4 py-4"
                >
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Cruzando intensidade, acidez, corpo e notas com o catálogo da
              casa.
            </p>
          </div>
        ) : result ? (
          <div aria-live="polite" className="flex flex-col gap-5">
            {result.reason && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {result.reason}
              </p>
            )}

            {submitted && (
              <div className="rounded-2xl border border-border bg-secondary/40 px-5 py-4">
                <p className="text-sm font-medium">Como lemos seu perfil</p>
                <dl className="mt-3 grid gap-3 text-xs sm:grid-cols-3">
                  <div className="flex flex-col gap-1">
                    <dt className="text-muted-foreground">Eixos</dt>
                    <dd className="leading-relaxed text-foreground/80">
                      {scaleFields
                        .map(
                          (field) =>
                            `${field.label} ${submitted.values[field.key]}/5`,
                        )
                        .join(" · ")}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="text-muted-foreground">Coleções</dt>
                    <dd className="leading-relaxed text-foreground/80">
                      {submitted.categories.length > 0
                        ? submitted.categories
                            .map(
                              (value) =>
                                discoveryCategoryOptions.find(
                                  (option) => option.value === value,
                                )?.label ?? value,
                            )
                            .join(", ")
                        : "Todas"}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="text-muted-foreground">Notas</dt>
                    <dd className="leading-relaxed text-foreground/80">
                      {submitted.notes.length > 0
                        ? submitted.notes.join(" · ")
                        : "Sem preferência"}
                      {submitted.price.trim()
                        ? ` · até R$ ${submitted.price}`
                        : ""}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            {result.recommendations.length === 0 ? (
              <p className="rounded-3xl border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground shadow-soft">
                Não encontramos produtos para esse perfil. Tente ampliar as
                coleções ou o preço máximo.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-baseline justify-between gap-2 border-b border-border pb-3">
                  <p className="text-sm font-medium">Seleção para você</p>
                  <p className="text-xs text-muted-foreground">
                    {result.recommendations.length === 1
                      ? "1 item"
                      : `${result.recommendations.length} itens`}
                  </p>
                </div>
                <ul className="flex flex-col gap-3">
                  {result.recommendations.map((item, index) => (
                    <li
                      key={item.slug}
                      className={cn("catalog-in", resultDelay[index])}
                    >
                      <Link
                        href={`/produtos/${item.slug}`}
                        className="group flex items-start justify-between gap-4 rounded-2xl border border-border bg-card px-5 py-4 shadow-soft outline-none transition-shadow hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        <span className="flex min-w-0 flex-col gap-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-lg font-medium">
                              {item.name}
                            </span>
                            {item.isDemoData && <DemoBadge />}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {item.subtitle}
                          </span>
                          <span className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                            <span className="rounded-full bg-brand/10 px-2.5 py-0.5 font-medium text-brand">
                              {discoveryScoreTierLabel[item.tier]}
                            </span>
                            <span className="text-muted-foreground">
                              {item.typeLabel}
                            </span>
                          </span>
                          <span className="mt-1 text-xs leading-relaxed text-foreground/70">
                            {item.reason}
                          </span>
                        </span>
                        <span className="flex shrink-0 flex-col items-end gap-1 text-right">
                          <span className="text-2xl font-medium tabular-nums">
                            {item.score}
                          </span>
                          <span className="text-[0.6875rem] text-muted-foreground">
                            de 100
                          </span>
                          <span className="mt-2 text-sm font-medium tabular-nums">
                            {item.priceCents !== null
                              ? formatCents(item.priceCents)
                              : "—"}
                          </span>
                          <ArrowUpRightIcon
                            className="mt-1 size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            aria-hidden
                          />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <LiveProfile values={values} categories={categories} notes={notes} />
        )}
      </div>
    </div>
  );
}
