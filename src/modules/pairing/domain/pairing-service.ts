import { DomainError } from "@/modules/shared/domain/errors";
import type { Product } from "@/modules/catalog/domain/product";
import {
  type PairingCriterion,
  PairingScore,
} from "@/modules/pairing/domain/pairing";

export interface PairingCalculation {
  score: PairingScore;
  criteria: PairingCriterion[];
  explanation: string;
  displayable: boolean;
}

const SWEET_KEYWORDS = [
  "melado",
  "caramelo",
  "rapadura",
  "açúcar",
  "acucar",
  "doce",
  "mel",
];

function hasSweetNote(product: Product): boolean {
  return product.sensory.notes.some((note) =>
    SWEET_KEYWORDS.some((keyword) => note.includes(keyword)),
  );
}

function isCreamyCheese(product: Product): boolean {
  if (product.type !== "CHEESE") return false;
  const texture = product.profile.kind === "CHEESE" ? product.profile.texture.toLowerCase() : "";
  return texture.includes("cremos") || texture.includes("mole") || texture.includes("blanda");
}

function isRichCheese(product: Product): boolean {
  if (product.type !== "CHEESE") return false;
  const { profile } = product;
  if (profile.kind !== "CHEESE") return false;
  const style = profile.style.toLowerCase();
  const texture = profile.texture.toLowerCase();
  const cured = style.includes("curad") || (profile.agingDays !== null && profile.agingDays >= 60);
  const fatty = texture.includes("grass") || texture.includes("cremos") || texture.includes("gordur");
  return cured || fatty;
}

function intensityCriterion(a: Product, b: Product): PairingCriterion {
  const diff = Math.abs(a.sensory.intensity - b.sensory.intensity);
  const points = Math.max(0, 30 - 7 * diff);
  const detail =
    diff === 0
      ? `Intensidades idênticas (${a.sensory.intensity}) — equilíbrio perfeito`
      : `Intensidades ${a.sensory.intensity} e ${b.sensory.intensity} — diferença de ${diff}`;
  return { rule: "intensity-balance", points, max: 30, detail };
}

function bodyCriterion(a: Product, b: Product): PairingCriterion {
  const signature =
    (a.type === "COFFEE" && b.type === "CHEESE") ||
    (a.type === "CHEESE" && b.type === "COFFEE") ||
    (a.type === "WINE" && b.type === "CHEESE") ||
    (a.type === "CHEESE" && b.type === "WINE") ||
    (a.type === "COFFEE" && b.type === "WINE") ||
    (a.type === "WINE" && b.type === "COFFEE");

  const coffee = [a, b].find((p) => p.type === "COFFEE");
  const cheese = [a, b].find((p) => p.type === "CHEESE");
  const wine = [a, b].find((p) => p.type === "WINE");

  if (signature && coffee && cheese && coffee.sensory.body >= 4 && isCreamyCheese(cheese)) {
    return {
      rule: "body-complement",
      points: 20,
      max: 20,
      detail: `Café de corpo alto (${coffee.sensory.body}) com queijo cremoso`,
    };
  }
  if (signature && wine && cheese && wine.sensory.body >= 4 && cheese.profile.kind === "CHEESE" && cheese.profile.intensity >= 4) {
    return {
      rule: "body-complement",
      points: 20,
      max: 20,
      detail: `Vinho encorpado (${wine.sensory.body}) com queijo de alta intensidade`,
    };
  }
  if (signature && coffee && wine && coffee.sensory.body >= 4 && wine.sensory.body >= 4) {
    return {
      rule: "body-complement",
      points: 20,
      max: 20,
      detail: `Café e vinho de corpo alto (${coffee.sensory.body}/${wine.sensory.body})`,
    };
  }

  const diff = Math.abs(a.sensory.body - b.sensory.body);
  const points = diff <= 0 ? 20 : diff === 1 ? 15 : diff === 2 ? 10 : diff === 3 ? 5 : 0;
  return {
    rule: "body-complement",
    points,
    max: 20,
    detail: `Corpos ${a.sensory.body} e ${b.sensory.body} — contraste de ${diff} ponto(s)`,
  };
}

function acidityCriterion(a: Product, b: Product): PairingCriterion {
  const acidityA = a.sensory.acidity;
  const acidityB = b.sensory.acidity;
  if (acidityA === null || acidityB === null) {
    return {
      rule: "acidity-harmony",
      points: 7,
      max: 15,
      detail: "Acidez não cadastrada em um dos produtos — critério neutro",
    };
  }
  const diff = Math.abs(acidityA - acidityB);
  const points = diff <= 1 ? 15 : diff === 2 ? 8 : 0;
  return {
    rule: "acidity-harmony",
    points,
    max: 15,
    detail: `Acidez ${acidityA} e ${acidityB} — diferença de ${diff}`,
  };
}

function notesCriterion(a: Product, b: Product): PairingCriterion {
  const notesA = new Set(a.sensory.notes);
  const common = b.sensory.notes.filter((note) => notesA.has(note));
  const points = Math.min(20, common.length * 7);
  const detail =
    common.length > 0
      ? `Notas em comum: ${common.slice(0, 3).join(", ")}`
      : "Sem notas em comum";
  return { rule: "shared-notes", points, max: 20, detail };
}

function contrastCriterion(a: Product, b: Product): PairingCriterion {
  const pair = [a, b];
  const coffee = pair.find((p) => p.type === "COFFEE");
  const cheese = pair.find((p) => p.type === "CHEESE");
  const wine = pair.find((p) => p.type === "WINE");

  if (coffee && cheese) {
    const points = hasSweetNote(coffee) && isRichCheese(cheese) ? 10 : 0;
    return {
      rule: "sweet-rich-contrast",
      points,
      max: 10,
      detail:
        points > 0
          ? "Doçura do café contrasta com queijo curado/gorduroso"
          : "Sem contraste doce × salgado/gorduroso",
    };
  }
  if (coffee && wine) {
    const tannins = wine.profile.kind === "WINE" ? wine.profile.tannins : null;
    const points = hasSweetNote(coffee) && tannins !== null && tannins >= 3 ? 10 : 0;
    return {
      rule: "sweet-tannin-contrast",
      points,
      max: 10,
      detail:
        points > 0
          ? "Doçura do café contrasta com taninos do vinho"
          : "Sem contraste doce × tanino",
    };
  }
  if (wine && cheese) {
    const wineProfile = wine.profile.kind === "WINE" ? wine.profile : null;
    const tanninsOk = wineProfile?.tannins !== null && wineProfile?.tannins !== undefined && wineProfile.tannins >= 3;
    const acidityOk = wineProfile !== null && wineProfile.acidity >= 4;
    const points = isRichCheese(cheese) && (tanninsOk || acidityOk) ? 10 : 0;
    return {
      rule: "fat-acid-contrast",
      points,
      max: 10,
      detail:
        points > 0
          ? "Gordura do queijo cortada por tanino ou acidez do vinho"
          : "Sem contraste gordura × tanino/acidez",
    };
  }
  return { rule: "contrast", points: 0, max: 10, detail: "Contraste não aplicável" };
}

function availabilityCriterion(a: Product, b: Product): PairingCriterion {
  const points = a.available && b.available ? 5 : 0;
  return {
    rule: "availability",
    points,
    max: 5,
    detail: points > 0 ? "Produtos disponíveis" : "Produto indisponível — não exibir",
  };
}

function buildExplanation(
  score: PairingScore,
  criteria: readonly PairingCriterion[],
  label: string,
): string {
  const details = criteria.map((c) => `${c.detail} (${c.points}/${c.max})`).join("; ");
  const tierLabel =
    score.tier === "excelente"
      ? "excelente compatibilidade"
      : score.tier === "boa"
        ? "boa compatibilidade"
        : score.tier === "moderada"
          ? "compatibilidade moderada"
          : "combinação experimental";
  return `${label}: ${tierLabel} (heurística do sistema, ${score.value}/100). ${details}.`;
}

export class PairingService {
  calculatePair(a: Product, b: Product): PairingCalculation {
    if (a.id.value === b.id.value) {
      throw new DomainError("Não é possível calcular harmonização de um produto consigo mesmo.");
    }
    const criteria: PairingCriterion[] = [
      intensityCriterion(a, b),
      bodyCriterion(a, b),
      acidityCriterion(a, b),
      notesCriterion(a, b),
      contrastCriterion(a, b),
      availabilityCriterion(a, b),
    ];
    const total = criteria.reduce((sum, c) => sum + c.points, 0);
    const score = PairingScore.of(total);
    return {
      score,
      criteria,
      explanation: buildExplanation(score, criteria, `${a.name} + ${b.name}`),
      displayable: a.available && b.available,
    };
  }

  calculateTrio(a: Product, b: Product, c: Product): PairingCalculation {
    const ids = [a.id.value, b.id.value, c.id.value];
    if (new Set(ids).size !== 3) {
      throw new DomainError("Trinca de harmonização precisa de 3 produtos distintos.");
    }
    const pairs = [
      { label: `${a.name} + ${b.name}`, calc: this.calculatePair(a, b) },
      { label: `${a.name} + ${c.name}`, calc: this.calculatePair(a, c) },
      { label: `${b.name} + ${c.name}`, calc: this.calculatePair(b, c) },
    ];

    const criteria: PairingCriterion[] = pairs.flatMap(({ label, calc }) =>
      calc.criteria.map((criterion) => ({
        ...criterion,
        rule: `pair[${label}] ${criterion.rule}`,
      })),
    );

    const avg = pairs.reduce((sum, p) => sum + p.calc.score.value, 0) / 3;
    const base = avg * 0.9;

    const notesA = new Set(a.sensory.notes);
    const notesB = new Set(b.sensory.notes);
    const linking = c.sensory.notes.filter(
      (note) => notesA.has(note) && notesB.has(note),
    );
    const linkBonus = linking.length > 0 ? 10 : 0;
    if (linkBonus > 0) {
      criteria.push({
        rule: "trio-linking-note",
        points: linkBonus,
        max: 10,
        detail: `Nota ligando os três: ${linking[0] ?? ""}`,
      });
    }

    const score = PairingScore.of(Math.min(100, base + linkBonus));
    const allAvailable = a.available && b.available && c.available;
    return {
      score,
      criteria,
      explanation: buildExplanation(
        score,
        criteria,
        `Experiência ${a.name} + ${b.name} + ${c.name}`,
      ),
      displayable: allAvailable,
    };
  }
}

export const pairingService = new PairingService();
