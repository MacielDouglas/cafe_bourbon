import {
  type ProductInput,
  type ProductProfile,
} from "@/modules/catalog/domain/schemas";
import { Product } from "@/modules/catalog/domain/product";

let counter = 0;

const defaultProfiles: Record<ProductInput["type"], ProductProfile> = {
  COFFEE: {
    kind: "COFFEE",
    origin: "Brasil",
    variety: null,
    process: null,
    roastLevel: 3,
    intensity: 3,
    acidity: 3,
    body: 3,
    notes: ["melado", "caramelo"],
    brewMethods: ["COADO"],
  },
  CHEESE: {
    kind: "CHEESE",
    milkType: "Vaca",
    style: "Meia-cura",
    agingDays: 21,
    texture: "Semidura",
    intensity: 3,
    acidity: 3,
    notes: ["manteiga", "nozes"],
    origin: null,
  },
  WINE: {
    kind: "WINE",
    grapes: ["Merlot"],
    region: null,
    style: "Tinto frutado",
    vintage: null,
    body: 3,
    acidity: 3,
    tannins: 3,
    notes: ["ameixa", "cereja"],
    alcoholPct: 13,
  },
};

export function createProduct(overrides: Partial<ProductInput> = {}): Product {
  counter += 1;
  const profile = overrides.profile ?? defaultProfiles[overrides.type ?? "COFFEE"];
  const type = overrides.type ?? profile.kind;
  const input: ProductInput = {
    id: overrides.id ?? `test-product-${counter}`,
    name: overrides.name ?? `Produto Teste ${counter}`,
    slug: overrides.slug ?? `produto-teste-${counter}`,
    description:
      overrides.description ?? "Descrição de teste usada pelos cenários unitários.",
    type,
    priceCents: overrides.priceCents ?? 2000,
    imageUrl: overrides.imageUrl ?? null,
    available: overrides.available ?? true,
    isDemoData: overrides.isDemoData ?? false,
    profile,
  };
  return Product.create(input);
}
