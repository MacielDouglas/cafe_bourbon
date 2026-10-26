"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { BrewMethod, ProductType } from "@/modules/catalog/domain/value-objects";
import { brewMethodLabel } from "@/modules/catalog/presentation/labels";
import type { AdminProduct } from "@/modules/admin/presentation/data";

const typeOptions: { value: ProductType; label: string }[] = [
  { value: "COFFEE", label: "Café" },
  { value: "CHEESE", label: "Queijo" },
  { value: "WINE", label: "Vinho" },
];

const brewMethodOptions = Object.entries(brewMethodLabel).map(
  ([value, label]) => ({ value: value as BrewMethod, label }),
);

function centsToPriceText(cents: number | null): string {
  if (cents === null) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

function parsePriceToCents(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const normalized = trimmed.includes(",")
    ? trimmed.replace(/\./g, "").replace(",", ".")
    : trimmed;
  const number = Number(normalized.replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(number) || number < 0) return null;
  return Math.round(number * 100);
}

function parseList(value: string, lowerCase = true): string[] {
  return [
    ...new Set(
      value
        .split(/[,;\n]/)
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => (lowerCase ? item.toLowerCase() : item)),
    ),
  ];
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function numberOrNull(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function scale(value: number): 1 | 2 | 3 | 4 | 5 {
  const clamped = Math.min(5, Math.max(1, Math.trunc(value)));
  return clamped as 1 | 2 | 3 | 4 | 5;
}

interface ProductFormProps {
  mode: "create" | "edit";
  product?: AdminProduct;
}

export function ProductForm({ mode, product }: ProductFormProps) {
  const router = useRouter();
  const initialProfile = product?.profile;

  const [type, setType] = useState<ProductType>(product?.type ?? "COFFEE");
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(centsToPriceText(product?.priceCents ?? null));
  const [stock, setStock] = useState(String(product?.stock ?? 0));
  const [available, setAvailable] = useState(product?.available ?? true);
  const [notes, setNotes] = useState(
    initialProfile ? initialProfile.notes.join(", ") : "",
  );
  const [brewMethods, setBrewMethods] = useState<BrewMethod[]>(
    initialProfile?.kind === "COFFEE" ? initialProfile.brewMethods : ["COADO"],
  );

  const [coffee, setCoffee] = useState({
    origin: initialProfile?.kind === "COFFEE" ? initialProfile.origin : "",
    variety: initialProfile?.kind === "COFFEE" ? (initialProfile.variety ?? "") : "",
    process: initialProfile?.kind === "COFFEE" ? (initialProfile.process ?? "") : "",
    roastLevel: initialProfile?.kind === "COFFEE" ? Number(initialProfile.roastLevel) : 3,
    intensity: initialProfile?.kind === "COFFEE" ? Number(initialProfile.intensity) : 3,
    acidity: initialProfile?.kind === "COFFEE" ? Number(initialProfile.acidity) : 3,
    body: initialProfile?.kind === "COFFEE" ? Number(initialProfile.body) : 3,
  });

  const [cheese, setCheese] = useState({
    milkType: initialProfile?.kind === "CHEESE" ? initialProfile.milkType : "",
    style: initialProfile?.kind === "CHEESE" ? initialProfile.style : "",
    agingDays:
      initialProfile?.kind === "CHEESE" && initialProfile.agingDays !== null
        ? String(initialProfile.agingDays)
        : "",
    texture: initialProfile?.kind === "CHEESE" ? initialProfile.texture : "",
    intensity: initialProfile?.kind === "CHEESE" ? Number(initialProfile.intensity) : 3,
    acidity:
      initialProfile?.kind === "CHEESE" && initialProfile.acidity !== null
        ? String(initialProfile.acidity)
        : "",
    origin: initialProfile?.kind === "CHEESE" ? (initialProfile.origin ?? "") : "",
  });

  const [wine, setWine] = useState({
    grapes: initialProfile?.kind === "WINE" ? initialProfile.grapes.join(", ") : "",
    region: initialProfile?.kind === "WINE" ? (initialProfile.region ?? "") : "",
    style: initialProfile?.kind === "WINE" ? initialProfile.style : "",
    vintage:
      initialProfile?.kind === "WINE" && initialProfile.vintage !== null
        ? String(initialProfile.vintage)
        : "",
    body: initialProfile?.kind === "WINE" ? Number(initialProfile.body) : 3,
    acidity: initialProfile?.kind === "WINE" ? Number(initialProfile.acidity) : 3,
    tannins:
      initialProfile?.kind === "WINE" && initialProfile.tannins !== null
        ? String(initialProfile.tannins)
        : "",
    alcoholPct:
      initialProfile?.kind === "WINE" && initialProfile.alcoholPct !== null
        ? String(initialProfile.alcoholPct)
        : "",
  });

  const [loading, setLoading] = useState(false);

  function changeType(next: ProductType) {
    setType(next);
    setNotes("");
    if (next === "COFFEE") setBrewMethods(["COADO"]);
  }

  function buildProfile() {
    if (type === "COFFEE") {
      return {
        kind: "COFFEE" as const,
        origin: coffee.origin.trim(),
        variety: emptyToNull(coffee.variety),
        process: emptyToNull(coffee.process),
        roastLevel: scale(coffee.roastLevel),
        intensity: scale(coffee.intensity),
        acidity: scale(coffee.acidity),
        body: scale(coffee.body),
        notes: parseList(notes),
        brewMethods: brewMethods.length > 0 ? brewMethods : (["COADO"] as BrewMethod[]),
      };
    }
    if (type === "CHEESE") {
      return {
        kind: "CHEESE" as const,
        milkType: cheese.milkType.trim(),
        style: cheese.style.trim(),
        agingDays: numberOrNull(cheese.agingDays),
        texture: cheese.texture.trim(),
        intensity: scale(cheese.intensity),
        acidity: cheese.acidity.trim() === "" ? null : scale(Number(cheese.acidity)),
        notes: parseList(notes),
        origin: emptyToNull(cheese.origin),
      };
    }
    return {
      kind: "WINE" as const,
      grapes: parseList(wine.grapes, false),
      region: emptyToNull(wine.region),
      style: wine.style.trim(),
      vintage: numberOrNull(wine.vintage),
      body: scale(wine.body),
      acidity: scale(wine.acidity),
      tannins: wine.tannins.trim() === "" ? null : scale(Number(wine.tannins)),
      notes: parseList(notes),
      alcoholPct: numberOrNull(wine.alcoholPct),
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        type,
        priceCents: parsePriceToCents(price),
        stock: Number(stock),
        available,
        profile: buildProfile(),
      };

      const response = await fetch(
        mode === "create"
          ? "/api/admin/products"
          : `/api/admin/products/${product?.id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        toast.error(data?.error ?? "Não foi possível salvar o produto.");
        return;
      }

      toast.success(
        mode === "create" ? "Produto criado." : "Produto atualizado.",
      );

      if (mode === "create") {
        const data = (await response.json()) as { id: string };
        router.push(`/admin/produtos/${data.id}`);
      } else {
        router.refresh();
      }
    } catch {
      toast.error("Não foi possível salvar o produto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            minLength={2}
            maxLength={120}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            required
            minLength={3}
            maxLength={80}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            placeholder="cafe-do-brasil"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Tipo</Label>
          <Select
            value={type}
            onValueChange={(value) => changeType(value as ProductType)}
            items={typeOptions}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="price">Preço (R$)</Label>
          <Input
            id="price"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="20,00"
            inputMode="decimal"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="stock">Estoque</Label>
          <Input
            id="stock"
            type="number"
            min={0}
            value={stock}
            onChange={(event) => setStock(event.target.value)}
            required
          />
        </div>

        <label className="flex items-center gap-2 self-end pb-1 text-sm">
          <input
            type="checkbox"
            checked={available}
            onChange={(event) => setAvailable(event.target.checked)}
            className="size-4"
          />
          Disponível para venda
        </label>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
            minLength={10}
            maxLength={2000}
          />
        </div>

        <div className="flex flex-col gap-2 sm:col-span-2">
          <Label htmlFor="notes">Notas sensoriais (separadas por vírgula)</Label>
          <Input
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="melado, caramelo, nozes"
            required
          />
        </div>
      </section>

      {type === "COFFEE" && (
        <section className="grid gap-4 sm:grid-cols-2">
          <h2 className="text-lg font-medium sm:col-span-2">Perfil do café</h2>
          <div className="flex flex-col gap-2">
            <Label htmlFor="origin">Origem</Label>
            <Input
              id="origin"
              value={coffee.origin}
              onChange={(event) =>
                setCoffee({ ...coffee, origin: event.target.value })
              }
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="variety">Variedade (opcional)</Label>
            <Input
              id="variety"
              value={coffee.variety}
              onChange={(event) =>
                setCoffee({ ...coffee, variety: event.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="process">Processo (opcional)</Label>
            <Input
              id="process"
              value={coffee.process}
              onChange={(event) =>
                setCoffee({ ...coffee, process: event.target.value })
              }
            />
          </div>
          <ScaleField
            label="Torra (1-5)"
            value={coffee.roastLevel}
            onChange={(value) => setCoffee({ ...coffee, roastLevel: value })}
          />
          <ScaleField
            label="Intensidade (1-5)"
            value={coffee.intensity}
            onChange={(value) => setCoffee({ ...coffee, intensity: value })}
          />
          <ScaleField
            label="Acidez (1-5)"
            value={coffee.acidity}
            onChange={(value) => setCoffee({ ...coffee, acidity: value })}
          />
          <ScaleField
            label="Corpo (1-5)"
            value={coffee.body}
            onChange={(value) => setCoffee({ ...coffee, body: value })}
          />
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label>Métodos de preparo</Label>
            <div className="flex flex-wrap gap-3">
              {brewMethodOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-1.5 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={brewMethods.includes(option.value)}
                    onChange={(event) =>
                      setBrewMethods((current) =>
                        event.target.checked
                          ? [...current, option.value]
                          : current.filter((method) => method !== option.value),
                      )
                    }
                    className="size-4"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
        </section>
      )}

      {type === "CHEESE" && (
        <section className="grid gap-4 sm:grid-cols-2">
          <h2 className="text-lg font-medium sm:col-span-2">Perfil do queijo</h2>
          <div className="flex flex-col gap-2">
            <Label htmlFor="milkType">Tipo de leite</Label>
            <Input
              id="milkType"
              value={cheese.milkType}
              onChange={(event) =>
                setCheese({ ...cheese, milkType: event.target.value })
              }
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cheeseStyle">Estilo</Label>
            <Input
              id="cheeseStyle"
              value={cheese.style}
              onChange={(event) =>
                setCheese({ ...cheese, style: event.target.value })
              }
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="texture">Textura</Label>
            <Input
              id="texture"
              value={cheese.texture}
              onChange={(event) =>
                setCheese({ ...cheese, texture: event.target.value })
              }
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="agingDays">Maturação (dias, opcional)</Label>
            <Input
              id="agingDays"
              type="number"
              min={0}
              value={cheese.agingDays}
              onChange={(event) =>
                setCheese({ ...cheese, agingDays: event.target.value })
              }
            />
          </div>
          <ScaleField
            label="Intensidade (1-5)"
            value={cheese.intensity}
            onChange={(value) => setCheese({ ...cheese, intensity: value })}
          />
          <div className="flex flex-col gap-2">
            <Label htmlFor="cheeseAcidity">Acidez (1-5, opcional)</Label>
            <Input
              id="cheeseAcidity"
              type="number"
              min={1}
              max={5}
              value={cheese.acidity}
              onChange={(event) =>
                setCheese({ ...cheese, acidity: event.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="cheeseOrigin">Origem (opcional)</Label>
            <Input
              id="cheeseOrigin"
              value={cheese.origin}
              onChange={(event) =>
                setCheese({ ...cheese, origin: event.target.value })
              }
            />
          </div>
        </section>
      )}

      {type === "WINE" && (
        <section className="grid gap-4 sm:grid-cols-2">
          <h2 className="text-lg font-medium sm:col-span-2">Perfil do vinho</h2>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="grapes">Uvas (separadas por vírgula)</Label>
            <Input
              id="grapes"
              value={wine.grapes}
              onChange={(event) =>
                setWine({ ...wine, grapes: event.target.value })
              }
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="wineStyle">Estilo</Label>
            <Input
              id="wineStyle"
              value={wine.style}
              onChange={(event) =>
                setWine({ ...wine, style: event.target.value })
              }
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="wineRegion">Região (opcional)</Label>
            <Input
              id="wineRegion"
              value={wine.region}
              onChange={(event) =>
                setWine({ ...wine, region: event.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="vintage">Safra (opcional)</Label>
            <Input
              id="vintage"
              type="number"
              min={1900}
              max={2100}
              value={wine.vintage}
              onChange={(event) =>
                setWine({ ...wine, vintage: event.target.value })
              }
            />
          </div>
          <ScaleField
            label="Corpo (1-5)"
            value={wine.body}
            onChange={(value) => setWine({ ...wine, body: value })}
          />
          <ScaleField
            label="Acidez (1-5)"
            value={wine.acidity}
            onChange={(value) => setWine({ ...wine, acidity: value })}
          />
          <div className="flex flex-col gap-2">
            <Label htmlFor="tannins">Taninos (1-5, opcional)</Label>
            <Input
              id="tannins"
              type="number"
              min={1}
              max={5}
              value={wine.tannins}
              onChange={(event) =>
                setWine({ ...wine, tannins: event.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="alcoholPct">Teor alcoólico (%)</Label>
            <Input
              id="alcoholPct"
              type="number"
              min={0}
              max={100}
              step="0.1"
              value={wine.alcoholPct}
              onChange={(event) =>
                setWine({ ...wine, alcoholPct: event.target.value })
              }
            />
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={loading}>
          {loading
            ? "Salvando..."
            : mode === "create"
              ? "Criar produto"
              : "Salvar alterações"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          nativeButton={false}
          render={<Link href="/admin/produtos" />}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function ScaleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <Input
        type="number"
        min={1}
        max={5}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        required
      />
    </div>
  );
}
