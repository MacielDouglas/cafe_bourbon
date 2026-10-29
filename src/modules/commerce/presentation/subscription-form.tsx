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

const planDelay = [
  "catalog-delay-1",
  "catalog-delay-2",
  "catalog-delay-3",
] as const;

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

  const selectedPlan = plans.find((item) => item.id === plan);
  const selectedCoffee = coffees.find((coffee) => coffee.id === coffeeId);
  const selectedGrind =
    grindOptions.find((option) => option.value === grind)?.label ?? "Em grãos";
  const methodApplies = grind === "MOIDO";
  const selectedBrew = methodApplies
    ? brewMethod
      ? brewMethodLabel[brewMethod]
      : "Qualquer método"
    : "Não se aplica";

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
          let nextGrind: GrindOption = "GRAOS";
          if (
            draft.grind &&
            grindOptions.some((item) => item.value === draft.grind)
          ) {
            nextGrind = draft.grind;
            setGrind(nextGrind);
          }
          if (
            nextGrind === "MOIDO" &&
            (draft.brewMethod === "" ||
              (draft.brewMethod && brewMethods.includes(draft.brewMethod)))
          ) {
            setBrewMethod(draft.brewMethod);
          } else {
            setBrewMethod("");
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
          brewMethod: grind === "MOIDO" ? brewMethod || null : null,
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
      <div className="home-pairing-in flex flex-col items-start gap-4 rounded-3xl border border-border bg-card px-8 py-12 shadow-soft sm:px-10">
        <span className="flex size-14 items-center justify-center rounded-full bg-brand text-brand-foreground">
          <CheckIcon className="size-6" />
        </span>
        <h2 className="text-3xl font-medium tracking-tight text-balance">
          A mesa está garantida.
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Plano <strong>{confirmed}</strong> ativado. Esta é uma assinatura
          demonstrativa — nenhuma cobrança é realizada nesta versão.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button nativeButton={false} render={<Link href="/produtos" />}>
            Continuar comprando
          </Button>
          <Button variant="outline" onClick={() => setConfirmed(null)}>
            Fazer outra assinatura
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start"
    >
      <div className="flex flex-col gap-10">
        <fieldset className="flex flex-col gap-5">
          <legend className="text-2xl font-medium tracking-tight">
            Escolha o plano
          </legend>
          <div className="grid gap-4 sm:grid-cols-3">
            {plans.map((item, index) => {
              const active = plan === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPlan(item.id)}
                  aria-pressed={active}
                  className={cn(
                    "catalog-in flex h-full flex-col gap-3 rounded-2xl border p-5 text-left outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    planDelay[index],
                    active
                      ? "border-brand/40 bg-card shadow-lift ring-1 ring-brand/20"
                      : "border-border bg-card shadow-soft hover:border-foreground/30 hover:shadow-lift",
                  )}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-lg font-medium">{item.name}</span>
                    {active && <CheckIcon className="size-4 text-brand" />}
                  </span>
                  <span className="text-3xl font-medium tabular-nums">
                    {formatCents(item.priceCents)}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      {item.cadence}
                    </span>
                  </span>
                  <span className="text-sm leading-relaxed text-muted-foreground">
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

        <div className="flex flex-col gap-5">
          <h2 className="text-2xl font-medium tracking-tight">
            A próxima entrega
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <label htmlFor="coffee" className="flex flex-col gap-2">
              <span className="text-sm font-medium">Café do mês</span>
              <Select
                value={coffeeId}
                onValueChange={(value) => setCoffeeId(String(value))}
                items={coffees.map((coffee) => ({
                  value: coffee.id,
                  label: coffee.name,
                }))}
              >
                <SelectTrigger id="coffee" className="w-full">
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
                onValueChange={(value) => {
                  const next = value as GrindOption;
                  setGrind(next);
                  if (next === "GRAOS") setBrewMethod("");
                }}
                className="grid-cols-2"
              >
                {grindOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm transition-colors has-data-[checked]:border-brand/40 has-data-[checked]:bg-brand/5 focus-within:ring-2 focus-within:ring-ring/60"
                  >
                    <RadioGroupItem value={option.value} />
                    {option.label}
                  </label>
                ))}
              </RadioGroup>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {methodApplies
                  ? "Escolha o método para moer no ponto certo."
                  : "Em grãos preserva a escolha do método para depois."}
              </p>
            </fieldset>

            {methodApplies && (
              <label
                htmlFor="brew-method"
                className="flex flex-col gap-2 sm:col-span-2 sm:max-w-sm"
              >
                <span className="text-sm font-medium">
                  Método de preparo (opcional)
                </span>
                <Select
                  value={brewMethod}
                  onValueChange={(value) =>
                    setBrewMethod(value as BrewMethod | "")
                  }
                  items={brewMethods.map((method) => ({
                    value: method,
                    label: brewMethodLabel[method],
                  }))}
                >
                  <SelectTrigger id="brew-method" className="w-full">
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
            )}
          </div>
        </div>
      </div>

      <aside className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 shadow-soft lg:sticky lg:top-24">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Sua escolha</p>
          <p className="text-2xl font-medium tracking-tight">
            {selectedPlan?.name ?? "—"}
          </p>
          <p className="flex flex-wrap items-baseline gap-x-1.5">
            <span
              key={plan}
              className="home-pairing-in text-xl font-medium tabular-nums"
            >
              {selectedPlan ? formatCents(selectedPlan.priceCents) : "—"}
            </span>
            <span className="text-sm text-muted-foreground">
              {selectedPlan?.cadence}
            </span>
          </p>
        </div>

        <dl className="flex flex-col gap-3 border-y border-border py-5 text-sm">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted-foreground">Café</dt>
            <dd className="text-right">
              {selectedCoffee?.name ?? "Escolha um café"}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted-foreground">Moagem</dt>
            <dd className="text-right">{selectedGrind}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted-foreground">Preparo</dt>
            <dd className="text-right">{selectedBrew}</dd>
          </div>
        </dl>

        <Button
          type="submit"
          size="lg"
          disabled={loading || !coffeeId}
          className="w-full"
        >
          {loading ? "Confirmando..." : "Confirmar assinatura"}
        </Button>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Assinatura demonstrativa: nenhuma cobrança é realizada nesta versão.
        </p>

        {!isAuthenticated && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Você será direcionado para entrar.{" "}
            <Link
              href="/entrar?redirect=/assinatura"
              className="rounded-sm font-medium text-brand underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              Entrar agora
            </Link>
          </p>
        )}
      </aside>
    </form>
  );
}
