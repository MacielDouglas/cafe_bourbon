import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { DemoBadge } from "@/components/demo-badge";
import { StateLink, StateMessage } from "@/components/state-message";
import { categoryLinks } from "@/components/layout/navigation";
import { loadProducts } from "@/modules/catalog/presentation/data";
import { ProductCard } from "@/modules/catalog/presentation/product-card";
import { CatalogGridSkeleton } from "@/modules/catalog/presentation/catalog-skeleton";
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

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative isolate flex min-h-[82vh] items-end overflow-hidden bg-espresso">
        <Image
          src="/images/cafe-preparo.jpg"
          alt="Preparo de café especial"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-linear-to-t from-espresso via-espresso/25 to-transparent" />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-16 text-creme sm:px-6 lg:px-8">
          <h1 className="max-w-3xl text-4xl font-medium tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Do grão à mesa: cafés, queijos e vinhos para harmonizar.
          </h1>
          <p className="max-w-xl text-lg opacity-85">
            Perfis sensoriais de origem única, pensados para dividir a mesa e
            descobrir novas combinações.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <Link
              href="/produtos"
              className="inline-flex min-h-11 items-center rounded-full bg-creme px-6 text-sm font-medium text-foreground shadow-soft outline-none transition-colors hover:bg-creme/85 focus-visible:ring-2 focus-visible:ring-creme focus-visible:ring-offset-4 focus-visible:ring-offset-espresso"
            >
              Explorar catálogo
            </Link>
            <Link
              href="/produtos?tipo=COFFEE"
              className="inline-flex min-h-11 items-center rounded-full border border-creme/40 px-6 text-sm font-medium text-creme outline-none transition-colors hover:bg-creme/10 focus-visible:ring-2 focus-visible:ring-creme focus-visible:ring-offset-4 focus-visible:ring-offset-espresso"
            >
              Ver cafés
            </Link>
          </div>
          <p className="text-sm text-creme/70">
            Torra artesanal · Franca, São Paulo
          </p>
        </div>
      </section>

      {/* Manifesto */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:py-28">
        <p className="text-2xl leading-snug font-medium tracking-tight text-balance sm:text-3xl">
          Nascida de uma longa ambição de unir forma e função. Escolhemos cada
          lote para durar e para reunir memórias à mesa.
        </p>
      </section>

      {/* Cafés em destaque */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 pb-8">
          <h2 className="text-3xl font-medium tracking-tight">Nossos cafés</h2>
          <Link
            href="/produtos?tipo=COFFEE"
            className="rounded-sm text-sm font-medium text-brand underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            Ver todos os cafés
          </Link>
        </div>
        <Suspense fallback={<CatalogGridSkeleton count={4} />}>
          <FeaturedCoffees />
        </Suspense>
      </section>

      {/* Coleções */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {categoryLinks.map((category) => {
            const image = collectionImage[category.type];
            return (
              <Link
                key={category.type}
                href={category.href}
                className="group relative isolate flex min-h-72 flex-col justify-end overflow-hidden rounded-2xl p-7 shadow-soft outline-none ring-1 ring-foreground/5 transition-shadow hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-4 focus-visible:ring-offset-background"
              >
                {image ? (
                  <>
                    <Image
                      src={image}
                      alt={category.label}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-espresso/90 via-espresso/30 to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-secondary" />
                )}
                <div
                  className={
                    image
                      ? "relative text-creme"
                      : "relative text-foreground"
                  }
                >
                  <h3 className="text-2xl font-medium">{category.label}</h3>
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
              </Link>
            );
          })}
        </div>
      </section>

      {/* História */}
      <section
        id="historia"
        className="border-y border-border bg-secondary/40 scroll-mt-28"
      >
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
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col gap-3">
              <div className="flex items-baseline gap-3">
                <span className="text-sm font-medium text-brand tabular-nums">
                  {step.number}
                </span>
                <h3 className="text-xl font-medium">{step.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-espresso text-creme">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center lg:px-8">
          <h2 className="max-w-xl text-2xl font-medium tracking-tight sm:text-3xl">
            Monte sua mesa com cafés, queijos e vinhos que conversam entre si.
          </h2>
          <Link
            href="/produtos"
            className="inline-flex min-h-11 items-center rounded-full bg-creme px-6 text-sm font-medium text-foreground shadow-soft outline-none transition-colors hover:bg-creme/85 focus-visible:ring-2 focus-visible:ring-creme focus-visible:ring-offset-4 focus-visible:ring-offset-espresso"
          >
            Ir ao catálogo
          </Link>
        </div>
      </section>
    </div>
  );
}
