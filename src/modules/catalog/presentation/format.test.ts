import { describe, expect, it } from "vitest";
import { formatCents } from "@/modules/catalog/presentation/format";

function plain(value: string): string {
  return value.replace(/\u00a0/g, " ");
}

describe("formatCents", () => {
  it("formata centavos em reais", () => {
    expect(plain(formatCents(2000))).toBe("R$ 20,00");
    expect(plain(formatCents(0))).toBe("R$ 0,00");
    expect(plain(formatCents(123456))).toBe("R$ 1.234,56");
  });
});
