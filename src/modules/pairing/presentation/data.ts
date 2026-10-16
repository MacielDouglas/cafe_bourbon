import { connection } from "next/server";
import type { CalculatedPairing } from "@/modules/pairing/application/get-calculated-pairings";
import type { Product } from "@/modules/catalog/domain/product";
import { catalogUseCases } from "@/modules/catalog/presentation/composition";
import type { Pairing } from "@/modules/pairing/domain/pairing";
import { pairingUseCases } from "@/modules/pairing/presentation/composition";

function describe(error: unknown): string {
  return error instanceof Error ? error.name : "erro desconhecido";
}

export interface EditorialPairingView {
  pairing: Pairing;
  products: Product[];
}

export interface EditorialPairingsResult {
  pairings: EditorialPairingView[];
  failed: boolean;
}

/** Lista as harmonizações editoriais publicadas, resolvendo os produtos de cada uma. */
export async function loadEditorialPairings(
  limit = 12,
): Promise<EditorialPairingsResult> {
  await connection();
  try {
    const { getPairingRecommendations } = pairingUseCases();
    const { getProductsByIds } = catalogUseCases();
    const found = await getPairingRecommendations.execute({ limit });

    const pairings: EditorialPairingView[] = [];
    for (const pairing of found) {
      const resolved = await getProductsByIds.execute(pairing.productIds);
      const byId = new Map(resolved.map((product) => [product.id.value, product]));
      const products = pairing.productIds
        .map((id) => byId.get(id))
        .filter((product): product is Product => product !== undefined);
      if (products.length === pairing.productIds.length) {
        pairings.push({ pairing, products });
      }
    }

    return { pairings, failed: false };
  } catch (error) {
    console.error(
      "[pairing] falha ao carregar harmonizações editoriais:",
      describe(error),
    );
    return { pairings: [], failed: true };
  }
}

export interface CoffeeOption {
  slug: string;
  name: string;
}

export interface HarmonizerResult {
  coffees: CoffeeOption[];
  base: Product | null;
  results: CalculatedPairing[];
  failed: boolean;
}

/** Carrega os cafés disponíveis e, se houver café selecionado, suas harmonizações calculadas. */
export async function loadHarmonizer(
  coffeeSlug: string | undefined,
): Promise<HarmonizerResult> {
  await connection();
  try {
    const { listProducts, getProductDetails } = catalogUseCases();
    const page = await listProducts.execute({
      type: "COFFEE",
      availableOnly: true,
      pageSize: 50,
    });
    const coffees: CoffeeOption[] = page.items.map((product) => ({
      slug: product.slug,
      name: product.name,
    }));

    if (!coffeeSlug) {
      return { coffees, base: null, results: [], failed: false };
    }

    const base = await getProductDetails.execute(coffeeSlug);
    if (!base || base.type !== "COFFEE") {
      return { coffees, base: null, results: [], failed: false };
    }

    const { getCalculatedPairings } = pairingUseCases();
    const results = await getCalculatedPairings.execute({
      productId: base.id.value,
      limit: 12,
    });
    return { coffees, base, results, failed: false };
  } catch (error) {
    console.error("[pairing] falha ao calcular harmonizações:", describe(error));
    return { coffees: [], base: null, results: [], failed: true };
  }
}
