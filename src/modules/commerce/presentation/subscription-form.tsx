"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCents } from "@/modules/catalog/presentation/format";
import { brewMethodLabel } from "@/modules/catalog/presentation/labels";
import type { BrewMethod } from "@/modules/catalog/domain/value-objects";
import type {
  GrindOption,
  SubscriptionPlanDetails,
} from "@/modules/commerce/domain/subscription";

const brewMethods: BrewMethod[] = [
  "EXPRESSO",
  "COADO",
  "MOKA",
  "FRENCH_PRESS",
  "AEROPRESS",
];

interface CoffeeOption {
  id: string;
  name: string;
}

const grindOptions: { value: GrindOption; label: string }[] = [
  { value: "GRAOS", label: "Em grãos" },
  { value: "MOIDO", label: "Moído" },
];

const DRAFT_KEY = "cb_subscription_draft";

interface SubscriptionDraft {
  plan?: string;
  coffeeId?: string;
  grind?: GrindOption;
  brewMethod?: BrewMethod | "";
}

export function SubscriptionForm({
  plans,
  coffees,
  isAuthenticated,
}: {
  plans: readonly SubscriptionPlanDetails[];
  coffees: CoffeeOption[];
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [plan, setPlan] = useState(plans[0]?.id ?? "MENSAL");
  const [coffeeId, setCoffeeId] = useState(coffees[0]?.id ?? "");
  const [grind, setGrind] = useState<GrindOption>("GRAOS");
  const [brewMethod, setBrewMethod] = useState<BrewMethod | "">("");
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      let cancelled = false;
      queueMicrotask(() => {
        if (cancelled) return;
        try {
          const raw = sessionStorage.getItem(DRAFT_KEY);
          if (!raw) return;
          const draft = JSON.parse(raw) as SubscriptionDraft;
          const matchingPlan = plans.find((item) => item.id === draft.plan);
          if (matchingPlan) {
            setPlan(matchingPlan.id);
          }
          if (draft.coffeeId && coffees.some((item) => item.id === draft.coffeeId)) {
            setCoffeeId(draft.coffeeId);
          }
          if (draft.grind && grindOptions.some((item) => item.value === draft.grind)) {
            setGrind(draft.grind);
          }
          if (
            draft.brewMethod === "" ||
            (draft.brewMethod && brewMethods.includes(draft.brewMethod))
          ) {
            setBrewMethod(draft.brewMethod);
          }
        } catch {
          sessionStorage.removeItem(DRAFT_KEY);
        }
      });
      return () => {
        cancelled = true;
      };
    }

    sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ plan, coffeeId, grind, brewMethod }),
    );
  }, [plan, coffeeId, grind, brewMethod, plans, coffees]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAuthenticated) {
      toast.info("Entre na sua conta para assinar. Suas escolhas ficam salvas.");
      router.push("/entrar?redirect=/assinatura");
      return;
    }
    if (!coffeeId) {
      toast.error("Escolha um café para a assinatura.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          grind,
          brewMethod: brewMethod || null,
          coffeeId,
        }),
      });

      if (response.status === 401) {
        toast.info("Entre na sua conta para assinar. Suas escolhas ficam salvas.");
        router.push("/entrar?redirect=/assinatura");
        return;
      }
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        toast.error(data?.error ?? "Não foi possível concluir a assinatura.");
        return;
      }

      const data = (await response.json()) as {
        subscription: { planName: string };
      };
      setConfirmed(data.subscription.planName);
      sessionStorage.removeItem(DRAFT_KEY);
      toast.success("Assinatura confirmada", {
        description: `Plano ${data.subscription.planName} ativado.`,
      });
    } catch {
      toast.error("Não foi possível concluir a assinatura. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (confirmed) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-card px-8 py-12 shadow-soft">
        <span className="flex size-10 items-center justify-center rounded-full bg-brand text-brand-foreground">
          <CheckIcon />
        </span>
        <h2 className="text-xl font-medium">Assinatura confirmada</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Plano <strong>{confirmed}</strong> ativado. Esta é uma assinatura
          demonstrativa — nenhuma cobrança é realizada nesta versão.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button nativeButton={false} render={<Link href="/produtos" />}>
            Continuar comprando
          </Button>
          <Button
            variant="outline"
            onClick={() => setConfirmed(null)}
          >
            Fazer outra assinatura
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <fieldset className="flex flex-col gap-4">
        <legend className="text-sm font-medium">Escolha o plano</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          {plans.map((item) => {
            const active = plan === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPlan(item.id)}
                aria-pressed={active}
                className={cn(
                  "flex flex-col gap-3 rounded-2xl border p-5 text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active
                    ? "border-brand/40 bg-card shadow-lift ring-1 ring-brand/20"
                    : "border-border bg-card shadow-soft hover:border-foreground/30 hover:shadow-lift",
                )}
              >
                <span className="flex items-center justify-between">
                  <span className="font-medium">{item.name}</span>
                  {active && <CheckIcon className="size-4 text-brand" />}
                </span>
                <span className="text-2xl font-medium tabular-nums">
                  {formatCents(item.priceCents)}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    {item.cadence}
                  </span>
                </span>
                <span className="text-sm text-muted-foreground">
                  {item.description}
                </span>
                <span className="flex flex-col gap-1 text-xs text-muted-foreground">
                  {item.perks.map((perk) => (
                    <span key={perk} className="flex items-center gap-1.5">
                      <CheckIcon className="size-3 text-brand" />
                      {perk}
                    </span>
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Café do mês</span>
          <Select
            value={coffeeId}
            onValueChange={(value) => setCoffeeId(String(value))}
            items={coffees.map((coffee) => ({
              value: coffee.id,
              label: coffee.name,
            }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Escolha um café" />
            </SelectTrigger>
            <SelectContent>
              {coffees.map((coffee) => (
                <SelectItem key={coffee.id} value={coffee.id}>
                  {coffee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">Moagem</legend>
          <RadioGroup
            value={grind}
            onValueChange={(value) => setGrind(value as GrindOption)}
            className="grid-cols-2"
          >
            {grindOptions.map((option) => (
              <label
                key={option.value}
                className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm transition-colors has-data-[checked]:border-brand/40 has-data-[checked]:bg-brand/5 focus-within:ring-2 focus-within:ring-ring/60"
              >
                <RadioGroupItem value={option.value} />
                {option.label}
              </label>
            ))}
          </RadioGroup>
        </fieldset>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">
            Método de preparo (opcional)
          </span>
          <Select
            value={brewMethod}
            onValueChange={(value) => setBrewMethod(value as BrewMethod | "")}
            items={brewMethods.map((method) => ({
              value: method,
              label: brewMethodLabel[method],
            }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Qualquer método" />
            </SelectTrigger>
            <SelectContent>
              {brewMethods.map((method) => (
                <SelectItem key={method} value={method}>
                  {brewMethodLabel[method]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={loading || !coffeeId}>
          {loading ? "Confirmando..." : "Assinar plano"}
        </Button>
        {!isAuthenticated && (
          <p className="text-sm text-muted-foreground">
            Você será direcionado para entrar.{" "}
            <Link
              href="/entrar?redirect=/assinatura"
              className="rounded-sm font-medium text-brand underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              Entrar agora
            </Link>
          </p>
        )}
      </div>
    </form>
  );
}
