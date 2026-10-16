import { describe, expect, it } from "vitest";
import { createProduct } from "@/testing/product-factory";
import { DomainError } from "@/modules/shared/domain/errors";
import { PairingService } from "@/modules/pairing/domain/pairing-service";

const service = new PairingService();

function criterion(calc: { criteria: { rule: string; points: number }[] }, rule: string) {
  const found = calc.criteria.find((c) => c.rule === rule || c.rule.includes(rule));
  if (!found) throw new Error(`Critério não encontrado: ${rule}`);
  return found;
}

describe("PairingService.calculatePair", () => {
  it("pontuação máxima para intensidades idênticas", () => {
    const a = createProduct();
    const b = createProduct();
    const calc = service.calculatePair(a, b);
    expect(criterion(calc, "intensity-balance").points).toBe(30);
  });

  it("penaliza diferença extrema de intensidade", () => {
    const light = createProduct({
      profile: {
        kind: "COFFEE",
        origin: "Brasil",
        variety: null,
        process: null,
        roastLevel: 1,
        intensity: 1,
        acidity: 3,
        body: 1,
        notes: ["frutas frescas"],
        brewMethods: ["COADO"],
      },
    });
    const strong = createProduct({
      profile: {
        kind: "COFFEE",
        origin: "Cuba",
        variety: null,
        process: null,
        roastLevel: 5,
        intensity: 5,
        acidity: 3,
        body: 5,
        notes: ["especiarias"],
        brewMethods: ["EXPRESSO"],
      },
    });
    const calc = service.calculatePair(light, strong);
    expect(criterion(calc, "intensity-balance").points).toBe(2);
    expect(calc.score.value).toBeLessThan(60);
  });

  it("conta notas em comum com teto de 20", () => {
    const a = createProduct({
      profile: {
        kind: "COFFEE",
        origin: "Brasil",
        variety: null,
        process: null,
        roastLevel: 3,
        intensity: 3,
        acidity: 3,
        body: 3,
        notes: ["melado", "caramelo", "rapadura"],
        brewMethods: ["COADO"],
      },
    });
    const b = createProduct({
      profile: {
        kind: "CHEESE",
        milkType: "Vaca",
        style: "Curado",
        agingDays: 120,
        texture: "Dura",
        intensity: 4,
        acidity: 2,
        notes: ["melado", "caramelo", "rapadura", "aminoácidos"],
        origin: null,
      },
    });
    const calc = service.calculatePair(a, b);
    expect(criterion(calc, "shared-notes").points).toBe(20);
  });

  it("nota neutra quando acidez não cadastrada", () => {
    const coffee = createProduct();
    const cheese = createProduct({
      profile: {
        kind: "CHEESE",
        milkType: "Vaca",
        style: "Frescal",
        agingDays: 7,
        texture: "Fresca",
        intensity: 1,
        acidity: null,
        notes: ["lacticidade"],
        origin: null,
      },
    });
    const calc = service.calculatePair(coffee, cheese);
    expect(criterion(calc, "acidity-harmony").points).toBe(7);
    expect(calc.criteria.find((c) => c.rule === "acidity-harmony")?.detail).toContain(
      "neutro",
    );
  });

  it("contraste doce × queijo curado vale 10", () => {
    const sweetCoffee = createProduct({
      profile: {
        kind: "COFFEE",
        origin: "Colômbia",
        variety: null,
        process: null,
        roastLevel: 3,
        intensity: 3,
        acidity: 4,
        body: 3,
        notes: ["melado"],
        brewMethods: ["COADO"],
      },
    });
    const curedCheese = createProduct({
      profile: {
        kind: "CHEESE",
        milkType: "Vaca",
        style: "Curado",
        agingDays: 120,
        texture: "Dura",
        intensity: 4,
        acidity: 2,
        notes: ["aminoácidos"],
        origin: null,
      },
    });
    const calc = service.calculatePair(sweetCoffee, curedCheese);
    expect(criterion(calc, "sweet-rich-contrast").points).toBe(10);
  });

  it("indisponibilidade zera o critério e marca como não exibível", () => {
    const a = createProduct();
    const b = createProduct({ available: false });
    const calc = service.calculatePair(a, b);
    expect(criterion(calc, "availability").points).toBe(0);
    expect(calc.displayable).toBe(false);
  });

  it("corpos iguais valem 20 no critério proporcional", () => {
    const a = createProduct();
    const b = createProduct();
    const calc = service.calculatePair(a, b);
    expect(criterion(calc, "body-complement").points).toBe(20);
  });

  it("sempre resulta em score entre 0 e 100", () => {
    const worst = createProduct({
      profile: {
        kind: "COFFEE",
        origin: "Brasil",
        variety: null,
        process: null,
        roastLevel: 1,
        intensity: 1,
        acidity: 1,
        body: 1,
        notes: ["frutas frescas"],
        brewMethods: ["COADO"],
      },
    });
    const other = createProduct({
      profile: {
        kind: "WINE",
        grapes: ["Pinot Noir"],
        region: null,
        style: "Tinto leve",
        vintage: null,
        body: 5,
        acidity: 5,
        tannins: 5,
        notes: ["especiarias"],
        alcoholPct: 14,
      },
    });
    const calc = service.calculatePair(worst, other);
    expect(calc.score.value).toBeGreaterThanOrEqual(0);
    expect(calc.score.value).toBeLessThanOrEqual(100);
  });

  it("rejeita par com o mesmo produto", () => {
    const a = createProduct();
    expect(() => service.calculatePair(a, a)).toThrow(DomainError);
  });

  it("explicação menciona os critérios", () => {
    const calc = service.calculatePair(createProduct(), createProduct());
    expect(calc.explanation).toContain("heurística do sistema");
    expect(calc.explanation).toContain("Intensidades");
  });
});

describe("PairingService.calculateTrio", () => {
  it("calcula trio com nota ligadora e bônus", () => {
    const coffee = createProduct({
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
    });
    const cheese = createProduct({
      profile: {
        kind: "CHEESE",
        milkType: "Vaca",
        style: "Meia-cura",
        agingDays: 21,
        texture: "Semidura",
        intensity: 3,
        acidity: 3,
        notes: ["melado"],
        origin: null,
      },
    });
    const wine = createProduct({
      profile: {
        kind: "WINE",
        grapes: ["Merlot"],
        region: null,
        style: "Tinto frutado",
        vintage: null,
        body: 3,
        acidity: 3,
        tannins: 3,
        notes: ["melado"],
        alcoholPct: 13,
      },
    });
    const calc = service.calculateTrio(coffee, cheese, wine);
    expect(calc.score.value).toBeLessThanOrEqual(100);
    expect(calc.criteria.some((c) => c.rule === "trio-linking-note")).toBe(true);
    expect(calc.displayable).toBe(true);
  });

  it("rejeita trio com produtos repetidos", () => {
    const a = createProduct();
    const b = createProduct();
    expect(() => service.calculateTrio(a, a, b)).toThrow(DomainError);
  });

  it("trio com item indisponível não é exibível", () => {
    const coffee = createProduct();
    const cheese = createProduct({ type: "CHEESE" });
    const wine = createProduct({ type: "WINE", available: false });
    const calc = service.calculateTrio(coffee, cheese, wine);
    expect(calc.displayable).toBe(false);
  });
});
