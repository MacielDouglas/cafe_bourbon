import { describe, expect, it } from "vitest";
import { type ProductInput } from "@/modules/catalog/domain/schemas";
import { Product } from "@/modules/catalog/domain/product";
import { Money, ProductId } from "@/modules/catalog/domain/value-objects";
import { DomainError } from "@/modules/shared/domain/errors";
import { createProduct } from "@/testing/product-factory";

describe("Money", () => {
  it("rejeita centavos negativos", () => {
    expect(() => Money.cents(-1)).toThrow(DomainError);
  });

  it("rejeita centavos não inteiros", () => {
    expect(() => Money.cents(10.5)).toThrow(DomainError);
  });

  it("soma valores da mesma moeda", () => {
    expect(Money.cents(1000).add(Money.cents(2500)).cents).toBe(3500);
  });
});

describe("ProductId", () => {
  it("rejeita identificador vazio", () => {
    expect(() => ProductId.of("   ")).toThrow(DomainError);
  });

  it("normaliza espaços", () => {
    expect(ProductId.of("  abc123 ").value).toBe("abc123");
  });
});

describe("Product", () => {
  const base: ProductInput = {
    id: "p1",
    name: "Café de Teste",
    slug: "cafe-de-teste",
    description: "Descrição longa o suficiente para o schema.",
    type: "COFFEE",
    priceCents: 2000,
    imageUrl: null,
    available: true,
    isDemoData: false,
    profile: {
      kind: "COFFEE",
      origin: "Brasil",
      variety: null,
      process: null,
      roastLevel: 3,
      intensity: 3,
      acidity: 3,
      body: 3,
      notes: ["melado"],
      brewMethods: ["COADO"],
    },
  };

  it("aceita produto válido", () => {
    const product = Product.create(base);
    expect(product.slug).toBe("cafe-de-teste");
    expect(product.purchasable).toBe(true);
  });

  it("rejeita slug malformado", () => {
    expect(() => Product.create({ ...base, slug: "Slug Inválido" })).toThrow(
      DomainError,
    );
  });

  it("rejeita perfil incompatível com o tipo", () => {
    const cheeseProfile: ProductInput["profile"] = {
      kind: "CHEESE",
      milkType: "Vaca",
      style: "Frescal",
      agingDays: 7,
      texture: "Fresca",
      intensity: 1,
      acidity: 4,
      notes: ["lacticidade"],
      origin: null,
    };
    expect(() =>
      Product.create({ ...base, profile: cheeseProfile }),
    ).toThrow(DomainError);
  });

  it("produto sem preço não é comprável", () => {
    const product = Product.create({ ...base, priceCents: null });
    expect(product.purchasable).toBe(false);
  });

  it("produto indisponível não é comprável", () => {
    const product = Product.create({ ...base, available: false });
    expect(product.purchasable).toBe(false);
  });

  it("queijo usa intensidade como proxy de corpo", () => {
    const product = createProduct({ type: "CHEESE" });
    expect(product.sensory.body).toBe(product.sensory.intensity);
  });

  it("vinho usa corpo como intensidade", () => {
    const product = createProduct({ type: "WINE" });
    expect(product.sensory.intensity).toBe(product.sensory.body);
  });
});
