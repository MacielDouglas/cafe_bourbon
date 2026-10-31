import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "@/lib/safe-redirect";

describe("safeRedirectPath", () => {
  it("mantém caminhos internos", () => {
    expect(safeRedirectPath("/carrinho")).toBe("/carrinho");
    expect(safeRedirectPath("/admin/produtos?tipo=COFFEE")).toBe(
      "/admin/produtos?tipo=COFFEE",
    );
    expect(safeRedirectPath("/#historia")).toBe("/#historia");
  });

  it("usa o primeiro valor quando recebe array", () => {
    expect(safeRedirectPath(["/assinatura", "/outro"])).toBe("/assinatura");
  });

  it("remove espaços nas extremidades", () => {
    expect(safeRedirectPath("  /produtos  ")).toBe("/produtos");
  });

  it("recusa destinos externos e protocolos", () => {
    expect(safeRedirectPath("https://evil.example")).toBe("/");
    expect(safeRedirectPath("//evil.example")).toBe("/");
    expect(safeRedirectPath("javascript:alert(1)")).toBe("/");
    expect(safeRedirectPath("produtos")).toBe("/");
  });

  it("recusa barras invertidas e vazio", () => {
    expect(safeRedirectPath("/a\\b")).toBe("/");
    expect(safeRedirectPath("")).toBe("/");
    expect(safeRedirectPath("   ")).toBe("/");
    expect(safeRedirectPath(undefined)).toBe("/");
  });

  it("respeita o fallback informado", () => {
    expect(safeRedirectPath(undefined, "/assinatura")).toBe("/assinatura");
    expect(safeRedirectPath("https://evil.example", "/carrinho")).toBe(
      "/carrinho",
    );
  });

  it("recusa caminhos acima do limite", () => {
    expect(safeRedirectPath(`/${"a".repeat(500)}`)).toBe("/");
  });
});
