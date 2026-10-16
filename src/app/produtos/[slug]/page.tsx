import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StateLink, StateMessage } from "@/components/state-message";
import { loadProduct } from "@/modules/catalog/presentation/data";
import { formatProductPrice } from "@/modules/catalog/presentation/format";
import {
  brewMethodLabel,
  productSpecs,
  productSubtitle,
  productTypeLabel,
  productTypePluralLabel,
} from "@/modules/catalog/presentation/labels";
import { ProductActions } from "@/modules/catalog/presentation/product-actions";
import {
  SensoryNotes,
  SensoryProfile,
} from "@/modules/catalog/presentation/sensory-profile";

export const instant = false;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const { product } = await loadProduct(slug);
  if (!product) return { title: "Produto não encontrado" };
  return {
    title: product.name,
    description: product.description.slice(0, 150),
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const { product, failed } = await loadProduct(slug);

  if (failed) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6 lg:px-8">
        <StateMessage
          eyebrow="Produto"
          title="Não conseguimos carregar este produto"
          description="O banco de dados está indisponível no momento. Tente novamente em instantes."
          action={<StateLink href="/produtos">Voltar ao catálogo</StateLink>}
        />
      </div>
    );
  }

  if (!product) notFound();

  const price = formatProductPrice(product);
  const specs = productSpecs(product);
  const brewMethods =
    product.profile.kind === "COFFEE" ? product.profile.brewMethods : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Link href="/produtos" className="transition-colors hover:text-foreground">
          Catálogo
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={`/produtos?tipo=${product.type}`}
          className="transition-colors hover:text-foreground"
        >
          {productTypePluralLabel[product.type]}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/5">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-secondary">
              <span className="text-sm font-medium tracking-[0.18em] text-muted-foreground uppercase">
                {productTypeLabel[product.type]}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-[0.6875rem] font-medium tracking-[0.18em] text-brand uppercase">
              {productTypeLabel[product.type]}
            </span>
            <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
              {product.name}
            </h1>
            <p className="text-muted-foreground">{productSubtitle(product)}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl">{price ?? "Indisponível"}</span>
            {product.isDemoData && (
              <Badge variant="outline" className="text-muted-foreground">
                Dados demonstrativos
              </Badge>
            )}
          </div>

          <ProductActions
            productId={product.id.value}
            productName={product.name}
            purchasable={product.purchasable}
          />

          {product.type === "COFFEE" && (
            <Link
              href={`/harmonizacoes?cafe=${product.slug}`}
              className="inline-flex w-fit items-center text-sm font-medium text-brand underline-offset-4 hover:underline"
            >
              Ver harmonizações sugeridas
            </Link>
          )}

          <p className="max-w-prose leading-relaxed text-foreground/80">
            {product.description}
          </p>

          <Separator />

          <div className="flex flex-col gap-4">
            <p className="text-[0.6875rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Perfil sensorial
            </p>
            <SensoryProfile sensory={product.sensory} />
            <SensoryNotes notes={product.sensory.notes} />
          </div>

          <Separator />

          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            {specs.map((spec) => (
              <div key={spec.label} className="flex flex-col gap-0.5">
                <dt className="text-[0.6875rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                  {spec.label}
                </dt>
                <dd className="text-sm">{spec.value}</dd>
              </div>
            ))}
          </dl>

          {brewMethods.length > 0 && (
            <>
              <Separator />
              <div className="flex flex-col gap-3">
                <p className="text-[0.6875rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                  Métodos de preparo
                </p>
                <SensoryNotes notes={brewMethods.map((method) => brewMethodLabel[method])} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
