import type { Product } from "@/modules/catalog/domain/product";
import type { ProductType } from "@/modules/catalog/domain/value-objects";
import { loadEditorialPairings } from "@/modules/pairing/presentation/data";
import {
  HomePairing,
  type HomePairingItem,
} from "@/modules/pairing/presentation/home-pairing";

const fallbackImage: Record<ProductType, string> = {
  COFFEE: "/images/cafes/cafe-do-brasil.jpg",
  CHEESE: "/images/queijos.jpg",
  WINE: "/images/vinhos.jpg",
};

function imageFor(products: Product[]): string {
  const photo =
    products.find((product) => product.type === "COFFEE" && product.imageUrl) ??
    products.find((product) => product.imageUrl);
  if (photo?.imageUrl) return photo.imageUrl;
  const first = products[0];
  return first ? fallbackImage[first.type] : fallbackImage.COFFEE;
}

export async function HomePairingSection() {
  const { pairings, failed } = await loadEditorialPairings(4);
  if (failed || pairings.length === 0) return null;

  const items: HomePairingItem[] = pairings.map(({ pairing, products }) => ({
    id: pairing.id,
    score: pairing.score.value,
    explanation: pairing.explanation,
    imageUrl: imageFor(products),
    products: products.map((product) => ({
      name: product.name,
      slug: product.slug,
      type: product.type,
      isDemoData: product.isDemoData,
    })),
  }));

  return <HomePairing items={items} />;
}
