import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "cn";
import { DemoBadge } from "@/components/demo-badge";
import { StateLink, StateMessage } from "@/components/state-message";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryLinks } from "@/components/layout/navigation";
import { loadProducts } from "@/modules/catalog/presentation/data";
import { ProductCard } from "@/modules/catalog/presentation/product-card";
import { CatalogGridSkeleton } from "@/modules/catalog/presentation/catalog-skeleton";
import { HomePairingSection } from "@/modules/pairing/presentation/home-pairing-section";
import type { ProductType } from "@/modules/catalog/domain/value-objects";

const collectionImage: Partial<Record<ProductType, string>> = {
  COFFEE: "/images/cafes/cafe-do-brasil.jpg",
  CHEESE: "/images/queijos.jpg",
  WINE: "/images/vinhos.jpg",
};

const steps = [
  {
    number: "01",
    title: "Origem",
    description:
      "Selecionamos lotes de origem única — Brasil, Cuba, Papua Nova Guiné e Colômbia (Medellín).",
  },
  {
    number: "02",
    title: "Torra",
    description:
      "Torramos em pequenos lotes toda semana, calibrando perfil, corpo e acidez para cada origem.",
  },
  {
    number: "03",
    title: "Harmonização",
    description:
      "Combinamos café, queijo e vinho por perfis sensoriais — intensidade, corpo, acidez e notas.",
  },
] as const;

async function FeaturedCoffees() {
  const { products, failed } = await loadProducts({
    type: "COFFEE",
    pageSize: 4,
  });

  if (failed) {
    return (
      <StateMessage
        title="Não conseguimos carregar os cafés"
        description="O catálogo está indisponível agora. Tente novamente em instantes."
        action={<StateLink href="/produtos?tipo=COFFEE">Recarregar</StateLink>}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id.value} product={product} />
      ))}
    </div>
  );
}

function MesaSkeleton() {
  return (
    <section className="border-y border-border bg-secondary/45">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16 lg:px-8 lg:py-28">
        <Skeleton className="aspect-4/3 w-full rounded-2xl" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-10 w-48" />
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative isolate flex min-h-[82vh] items-end overflow-hidden bg-espresso lg:min-h-[88svh]">
        <Image
          src="/images/cafe-preparo.jpg"
          alt="Preparo de café especial"
          fill
          priority
          sizes="100vw"
          className="home-hero-media object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-espresso via-espresso/45 to-espresso/5" />
        <div className="absolute inset-0 bg-linear-to-r from-espresso/55 via-transparent to-transparent" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 pt-28 pb-10 text-creme sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end lg:gap-16 lg:px-8 lg:pb-14">
          <div className="flex flex-col gap-6">
            <h1 className="max-w-4xl text-5xl leading-[0.98] font-medium tracking-tight text-balance sm:text-6xl">
              <span className="home-hero-focus home-delay-1 block">
                Do grão
              </span>
              <span className="home-hero-focus home-delay-1 block">à mesa.</span>
              <span className="home-hero-focus home-delay-2 mt-4 block max-w-2xl text-xl leading-snug font-normal text-creme/85 sm:text-2xl">
                Cafés, queijos e vinhos para harmonizar.
              </span>
            </h1>
            <p className="home-hero-focus home-delay-3 max-w-xl text-lg text-creme/80">
              Perfis sensoriais de origem única, pensados para dividir a mesa e
              descobrir novas combinações.
            </p>
            <div className="home-hero-focus home-delay-4 flex flex-wrap gap-3">
              <Link
                href="/produtos"
                className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-creme px-6 text-sm font-medium text-foreground shadow-soft outline-none transition-colors hover:bg-creme/85 focus-visible:ring-2 focus-visible:ring-creme focus-visible:ring-offset-4 focus-visible:ring-offset-espresso"
              >
                Explorar catálogo
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/produtos?tipo=COFFEE"
                className="inline-flex min-h-11 items-center rounded-full border border-creme/40 px-6 text-sm font-medium text-creme outline-none transition-colors hover:bg-creme/10 focus-visible:ring-2 focus-visible:ring-creme focus-visible:ring-offset-4 focus-visible:ring-offset-espresso"
              >
                Ver cafés
              </Link>
            </div>
            <p className="home-hero-focus home-delay-5 flex items-center gap-3 text-sm text-creme/70">
              <span aria-hidden className="h-px w-8 bg-creme/40" />
              Torra artesanal · Franca, São Paulo
            </p>
          </div>

          <aside className="home-mesa-in home-delay-3 rounded-2xl bg-creme p-5 text-foreground shadow-lift">
            <h2 className="sr-only">Coleções da casa</h2>
            <p className="text-[0.6875rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              A mesa Bourbon
            </p>
            <ul className="mt-3 flex flex-col">
              {categoryLinks.map((category) => (
                <li
                  key={category.type}
                  className="border-t border-border first:border-t-0"
                >
                  <Link
                    href={category.href}
                    className="group flex min-h-14 items-center justify-between gap-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                  >
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="flex items-center gap-2 font-medium transition-colors group-hover:text-brand">
                        {category.label}
                        {category.type !== "COFFEE" && (
                          <DemoBadge className="font-normal" />
                        )}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {category.blurb}
                      </span>
                    </span>
                    <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {/* Manifesto */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:py-28">
        <span aria-hidden className="mx-auto block h-px w-12 bg-brand" />
        <p className="mt-8 text-3xl leading-tight font-medium tracking-tight text-balance sm:text-4xl">
          Nascida de uma longa ambição de unir{" "}
          <span className="text-brand">forma e função</span>. Escolhemos cada
          lote para durar e para reunir memórias à mesa.
        </p>
        <p className="mt-8 text-[0.6875rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Casa Bourbon · Franca, SP
        </p>
      </section>

      {/* Cafés em destaque */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-border pt-6 pb-8">
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
            Nossos cafés
          </h2>
          <Link
            href="/produtos?tipo=COFFEE"
            className="group inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-brand underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            Ver todos os cafés
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
        <Suspense fallback={<CatalogGridSkeleton count={4} />}>
          <FeaturedCoffees />
        </Suspense>
      </section>

      {/* Coleções */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5 lg:grid-rows-2">
          {categoryLinks.map((category) => {
            const image = collectionImage[category.type];
            const isCoffee = category.type === "COFFEE";
            return (
              <Link
                key={category.type}
                href={category.href}
                className={cn(
                  "group relative isolate flex flex-col justify-end overflow-hidden rounded-2xl p-7 shadow-soft outline-none ring-1 ring-foreground/5 transition-shadow hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-4 focus-visible:ring-offset-background",
                  isCoffee
                    ? "min-h-[22rem] md:col-span-2 lg:col-span-3 lg:row-span-2"
                    : "min-h-[16rem] lg:col-span-2",
                )}
              >
                {image ? (
                  <>
                    <Image
                      src={image}
                      alt={category.label}
                      fill
                      sizes={
                        isCoffee
                          ? "(min-width: 1024px) 60vw, 100vw"
                          : "(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw"
                      }
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-espresso/90 via-espresso/30 to-transparent transition-opacity duration-500 group-hover:opacity-95" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-secondary" />
                )}
                <div
                  className={cn(
                    "relative flex items-end justify-between gap-5",
                    image ? "text-creme" : "text-foreground",
                  )}
                >
                  <div>
                    <h3
                      className={cn(
                        "font-medium",
                        isCoffee ? "text-3xl sm:text-4xl" : "text-2xl",
                      )}
                    >
                      {category.label}
                    </h3>
                    <p className="mt-1 text-sm opacity-85">{category.blurb}</p>
                    {category.type !== "COFFEE" && (
                      <p className="mt-3">
                        <DemoBadge
                          className={
                            image
                              ? "border-creme/30 bg-espresso/40 text-creme"
                              : undefined
                          }
                        />
                      </p>
                    )}
                  </div>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-creme/35 transition-colors duration-300 group-hover:bg-creme group-hover:text-espresso">
                    <ArrowUpRight className="size-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* A mesa de hoje */}
      <Suspense fallback={<MesaSkeleton />}>
        <HomePairingSection />
      </Suspense>

      {/* História */}
      <section id="historia" className="scroll-mt-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted shadow-soft ring-1 ring-foreground/5">
            <Image
              src="/images/cafe-rosquinha.jpg"
              alt="Café servido com rosquinha"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-5">
            <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
              Feito por quem toma café todos os dias.
            </h2>
            <p className="leading-relaxed text-foreground/80">
              Há mais de uma década percebemos que faltava à mesa um café pensado
              por quem o prepara diariamente. Nossa abordagem é direta: escolher
              bem, torrar com cuidado e combinar com queijos e vinhos que
              valorizam cada gole.
            </p>
            <p className="leading-relaxed text-foreground/80">
              Cada peça, cada lote, cada combinação acumula memórias e conquista,
              sem alarde, seu lugar à mesa.
            </p>
          </div>
        </div>
      </section>

      {/* Processo */}
      <section
        id="processo"
        className="mx-auto w-full max-w-7xl scroll-mt-28 px-4 py-20 sm:px-6 lg:px-8"
      >
        <h2 className="max-w-2xl text-3xl font-medium tracking-tight sm:text-4xl">
          Do produtor à sua xícara, em três passos.
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex flex-col gap-3 border-t border-border pt-5"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-2xl font-medium tracking-tight">
                  {step.title}
                </h3>
                <span className="text-sm font-medium text-brand tabular-nums">
                  {step.number}
                </span>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-espresso text-creme">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 py-20 sm:px-6 md:flex-row md:items-end lg:px-8">
          <h2 className="max-w-2xl text-3xl leading-tight font-medium tracking-tight text-balance sm:text-4xl">
            Monte sua mesa com cafés, queijos e vinhos que conversam entre si.
          </h2>
          <Link
            href="/produtos"
            className="group inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-creme px-6 text-sm font-medium text-foreground shadow-soft outline-none transition-colors hover:bg-creme/85 focus-visible:ring-2 focus-visible:ring-creme focus-visible:ring-offset-4 focus-visible:ring-offset-espresso"
          >
            Ir ao catálogo
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
