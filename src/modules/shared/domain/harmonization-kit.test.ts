import { describe, expect, it } from "vitest";
import {
  assertHarmonizationKit,
  computeHarmonizationDiscount,
} from "@/modules/shared/domain/harmonization-kit";
import { DomainError } from "@/modules/shared/domain/errors";

describe("computeHarmonizationDiscount", () => {
  it("aplica 5% em cada item de um trio", () => {
    const discount = computeHarmonizationDiscount([
      { productId: "cafe", type: "COFFEE", priceCents: 2000, quantity: 1 },
      { productId: "queijo", type: "CHEESE", priceCents: 3500, quantity: 1 },
      { productId: "vinho", type: "WINE", priceCents: 8000, quantity: 1 },
    ]);

    expect(discount.kitCount).toBe(1);
    expect(discount.totalCents).toBe(100 + 175 + 400);
    expect(discount.discountByProductId.get("vinho")).toBe(400);
  });

  it("não aplica desconto sem categorias diferentes", () => {
    const discount = computeHarmonizationDiscount([
      { productId: "cafe-1", type: "COFFEE", priceCents: 2000, quantity: 2 },
    ]);

    expect(discount.kitCount).toBe(0);
    expect(discount.totalCents).toBe(0);
  });

  it("forma vários kits conforme a quantidade disponível", () => {
    const discount = computeHarmonizationDiscount([
      { productId: "cafe", type: "COFFEE", priceCents: 2000, quantity: 2 },
      { productId: "queijo", type: "CHEESE", priceCents: 3500, quantity: 2 },
    ]);

    expect(discount.kitCount).toBe(2);
    expect(discount.totalCents).toBe(2 * (100 + 175));
  });
});

describe("assertHarmonizationKit", () => {
  it("aceita combinações de 2 ou 3 categorias diferentes", () => {
    expect(() =>
      assertHarmonizationKit([{ type: "COFFEE" }, { type: "WINE" }]),
    ).not.toThrow();
  });

  it("recusa kit com uma única categoria", () => {
    expect(() =>
      assertHarmonizationKit([{ type: "COFFEE" }, { type: "COFFEE" }]),
    ).toThrow(DomainError);
  });
});
