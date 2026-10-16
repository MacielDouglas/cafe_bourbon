import type {
  CheeseProfile as CheeseProfileRecord,
  CoffeeProfile as CoffeeProfileRecord,
  Product as ProductRecord,
  WineProfile as WineProfileRecord,
} from "@prisma/client";
import { type ProductProfile, productInputSchema } from "@/modules/catalog/domain/schemas";
import { Product } from "@/modules/catalog/domain/product";
import {
  toBrewMethods,
  toScale,
  toScaleOrNull,
} from "@/modules/catalog/domain/value-objects";
import { DomainError } from "@/modules/shared/domain/errors";

export type ProductRecordWithProfiles = ProductRecord & {
  coffeeProfile: CoffeeProfileRecord | null;
  cheeseProfile: CheeseProfileRecord | null;
  wineProfile: WineProfileRecord | null;
};

function toProfile(record: ProductRecordWithProfiles): ProductProfile {
  switch (record.type) {
    case "COFFEE": {
      const p = record.coffeeProfile;
      if (!p) {
        throw new DomainError(`Perfil de café ausente para "${record.slug}".`);
      }
      return {
        kind: "COFFEE",
        origin: p.origin,
        variety: p.variety,
        process: p.process,
        roastLevel: toScale(p.roastLevel),
        intensity: toScale(p.intensity),
        acidity: toScale(p.acidity),
        body: toScale(p.body),
        notes: p.notes,
        brewMethods: toBrewMethods(p.brewMethods),
      };
    }
    case "CHEESE": {
      const p = record.cheeseProfile;
      if (!p) {
        throw new DomainError(`Perfil de queijo ausente para "${record.slug}".`);
      }
      return {
        kind: "CHEESE",
        milkType: p.milkType,
        style: p.style,
        agingDays: p.agingDays,
        texture: p.texture,
        intensity: toScale(p.intensity),
        acidity: toScaleOrNull(p.acidity),
        notes: p.notes,
        origin: p.origin,
      };
    }
    case "WINE": {
      const p = record.wineProfile;
      if (!p) {
        throw new DomainError(`Perfil de vinho ausente para "${record.slug}".`);
      }
      return {
        kind: "WINE",
        grapes: p.grapes,
        region: p.region,
        style: p.style,
        vintage: p.vintage,
        body: toScale(p.body),
        acidity: toScale(p.acidity),
        tannins: toScaleOrNull(p.tannins),
        notes: p.notes,
        alcoholPct: p.alcoholPct,
      };
    }
  }
}

export function toDomainProduct(record: ProductRecordWithProfiles): Product {
  const input = productInputSchema.safeParse({
    id: record.id,
    name: record.name,
    slug: record.slug,
    description: record.description,
    type: record.type,
    priceCents: record.priceCents,
    imageUrl: record.imageUrl,
    available: record.available,
    isDemoData: record.isDemoData,
    profile: toProfile(record),
  });
  if (!input.success) {
    throw new DomainError(
      `Registro de produto inconsistente ("${record.slug}").`,
    );
  }
  return Product.create(input.data);
}
