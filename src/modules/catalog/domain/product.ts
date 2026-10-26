import { z } from "zod";
import { DomainError } from "@/modules/shared/domain/errors";
import {
  type ProductInput,
  productInputSchema,
} from "@/modules/catalog/domain/schemas";
import {
  type ProductType,
  type Scale,
  Money,
  ProductId,
} from "@/modules/catalog/domain/value-objects";

export interface SensoryAxes {
  intensity: Scale;
  acidity: Scale | null;
  body: Scale;
  notes: string[];
}

export class Product {
  private constructor(
    readonly id: ProductId,
    readonly name: string,
    readonly slug: string,
    readonly description: string,
    readonly type: ProductType,
    readonly price: Money | null,
    readonly stock: number,
    readonly imageUrl: string | null,
    readonly available: boolean,
    readonly isDemoData: boolean,
    readonly profile: ProductInput["profile"],
  ) {}

  static create(input: ProductInput): Product {
    const parsed = productInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new DomainError(
        `Produto inválido: ${z.prettifyError(parsed.error)}`,
      );
    }
    const data = parsed.data;
    if (data.profile.kind !== data.type) {
      throw new DomainError(
        `Perfil ${data.profile.kind} incompatível com tipo ${data.type} (${data.slug}).`,
      );
    }
    return new Product(
      ProductId.of(data.id),
      data.name,
      data.slug,
      data.description,
      data.type,
      data.priceCents === null ? null : Money.cents(data.priceCents),
      data.stock,
      data.imageUrl,
      data.available,
      data.isDemoData,
      data.profile,
    );
  }

  get purchasable(): boolean {
    return this.available && this.price !== null && this.stock > 0;
  }

  get sensory(): SensoryAxes {
    const { profile } = this;
    switch (profile.kind) {
      case "COFFEE":
        return {
          intensity: profile.intensity,
          acidity: profile.acidity,
          body: profile.body,
          notes: profile.notes,
        };
      case "CHEESE":
        return {
          intensity: profile.intensity,
          acidity: profile.acidity,
          body: profile.intensity,
          notes: profile.notes,
        };
      case "WINE":
        return {
          intensity: profile.body,
          acidity: profile.acidity,
          body: profile.body,
          notes: profile.notes,
        };
    }
  }
}
