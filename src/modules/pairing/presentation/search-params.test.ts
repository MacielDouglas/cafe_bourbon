import { describe, expect, it } from "vitest";
import { parsePairingSearchParams } from "@/modules/pairing/presentation/search-params";

describe("parsePairingSearchParams", () => {
  it("aceita e normaliza o slug do café", () => {
    expect(parsePairingSearchParams({ cafe: "  cafe-do-brasil  " })).toEqual({
      cafe: "cafe-do-brasil",
    });
  });

  it("tolera ausência de parâmetros", () => {
    expect(parsePairingSearchParams({})).toEqual({});
  });

  it("ignora arrays e valores vazios", () => {
    expect(parsePairingSearchParams({ cafe: ["a", "b"] })).toEqual({});
    expect(parsePairingSearchParams({ cafe: "   " })).toEqual({});
  });

  it("recusa slug acima do limite", () => {
    expect(parsePairingSearchParams({ cafe: "a".repeat(121) })).toEqual({});
  });
});
