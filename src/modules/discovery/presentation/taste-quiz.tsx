"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "cn";
import { DemoBadge } from "@/components/demo-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  { key: "acidity", label: "Acidez", low: "Baixa", high: "Vibrante" },
  { key: "body", label: "Corpo", low: "Leve", high: "Encorpado" },
] as const;

type ScaleKey = (typeof scaleFields)[number]["key"];

const initialValues: Record<ScaleKey, number> = {
  intensity: 3,
  acidity: 3,
  body: 3,
};

function toggled(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
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
        className="flex flex-col gap-8 rounded-2xl border border-border bg-card p-6 shadow-soft"
      >
        {scaleFields.map((field) => (
          <div key={field.key} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{field.label}</span>
              <span className="text-sm tabular-nums text-muted-foreground">
                {values[field.key]}/5
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
          <span className="text-sm font-medium">Coleções de interesse</span>
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
          <span className="text-sm font-medium">Notas que você gosta</span>
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
          <span className="text-sm font-medium">Preço máximo por item (opcional)</span>
          <Input
            inputMode="decimal"
            placeholder="Ex.: 30,00"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </label>

        <Button type="submit" disabled={loading} className="w-full sm:w-fit">
          {loading ? "Buscando..." : "Ver recomendações"}
        </Button>
      </form>

      <div className="flex flex-col gap-5" aria-live="polite">
        {error && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {!result && !error && (
          <p className="rounded-2xl border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground shadow-soft">
            Ajuste os controles e toque em “Ver recomendações” para receber uma
            seleção feita sob medida.
          </p>
        )}

        {result && (
          <>
            {result.reason && (
              <p className="text-sm text-muted-foreground">{result.reason}</p>
            )}

            {submitted && (
              <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-secondary/40 px-4 py-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground/80">
                  Como lemos seu perfil
                </p>
                <p>
                  {scaleFields
                    .map(
                      (field) =>
                        `${field.label} ${submitted.values[field.key]}/5`,
                    )
                    .join(" · ")}
                </p>
                <p>
                  Coleções:{" "}
                  {submitted.categories.length > 0
                    ? submitted.categories
                        .map(
                          (value) =>
                            discoveryCategoryOptions.find(
                              (option) => option.value === value,
                            )?.label ?? value,
                        )
                        .join(", ")
                    : "todas"}
                </p>
                <p>
                  Notas:{" "}
                  {submitted.notes.length > 0
                    ? submitted.notes.join(", ")
                    : "sem preferência"}
                  {submitted.price.trim() ? ` · até R$ ${submitted.price}` : ""}
                </p>
              </div>
            )}
            {result.recommendations.length === 0 ? (
              <p className="rounded-2xl border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground shadow-soft">
                Não encontramos produtos para esse perfil. Tente ampliar as
                coleções ou o preço máximo.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {result.recommendations.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/produtos/${item.slug}`}
                      className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-4 shadow-soft outline-none transition-shadow hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate font-medium">{item.name}</span>
                        <span className="truncate text-sm text-muted-foreground">
                          {item.subtitle}
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                          <span className="text-brand">
                            {discoveryScoreTierLabel[item.tier]} · {item.score}/100
                          </span>
                          <span className="text-muted-foreground">
                            {item.typeLabel}
                          </span>
                          {item.isDemoData && <DemoBadge />}
                        </span>
                        <span className="mt-1 text-xs leading-relaxed text-foreground/70">
                          {item.reason}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm tabular-nums">
                        {item.priceCents !== null ? formatCents(item.priceCents) : "—"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
