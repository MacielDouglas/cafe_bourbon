import { describe, expect, it } from "vitest";
import { parseCatalogSearchParams } from "@/modules/catalog/presentation/search-params";

describe("parseCatalogSearchParams", () => {
  it("aceita parâmetros válidos", () => {
    expect(
      parseCatalogSearchParams({
        tipo: "CHEESE",
        busca: "curado",
        ordem: "price-asc",
        comparar: "queijo-curado,tinto-frutado",
        pagina: "2",
      }),
    ).toEqual({
      tipo: "CHEESE",
      busca: "curado",
      ordem: "price-asc",
      comparar: "queijo-curado,tinto-frutado",
      pagina: 2,
    });
  });

  it("ignora parâmetros desconhecidos", () => {
    expect(parseCatalogSearchParams({ foo: "bar", busca: "café" })).toEqual({
      busca: "café",
    });
  });

  it("normaliza o termo de busca", () => {
    expect(parseCatalogSearchParams({ busca: "  café  " })).toEqual({
      busca: "café",
    });
  });

  it("descarta o conjunto quando um valor é inválido", () => {
    expect(
      parseCatalogSearchParams({ tipo: "BANANA", busca: "café" }),
    ).toEqual({});
    expect(parseCatalogSearchParams({ pagina: "0" })).toEqual({});
    expect(parseCatalogSearchParams({ pagina: "abc" })).toEqual({});
    expect(parseCatalogSearchParams({ ordem: "preco" })).toEqual({});
  });

  it("ignora valores repetidos em array", () => {
    expect(
      parseCatalogSearchParams({ tipo: ["WINE", "COFFEE"], busca: "tinto" }),
    ).toEqual({ busca: "tinto" });
  });

  it("recusa busca longa e comparação extensa", () => {
    expect(parseCatalogSearchParams({ busca: "a".repeat(81) })).toEqual({});
    expect(parseCatalogSearchParams({ comparar: "a".repeat(201) })).toEqual({});
  });
});
