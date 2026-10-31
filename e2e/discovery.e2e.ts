import { expect, test } from "@playwright/test";
import {
  failRecommendations,
  mockRecommendations,
  type RecommendationFixture,
} from "./helpers";

const recommendations: RecommendationFixture = {
  fallback: false,
  reason: "Selecionamos itens com os eixos que você pediu.",
  recommendations: [
    {
      slug: "cafe-do-brasil",
      name: "Café do Brasil",
      type: "COFFEE",
      typeLabel: "Café",
      subtitle: "Doçura e corpo aveludado",
      priceCents: 2000,
      isDemoData: false,
      score: 92,
      tier: "excelente",
      reason: "Notas de caramelo e corpo médio conversam com seu perfil.",
    },
    {
      slug: "queijo-curado",
      name: "Queijo Curado",
      type: "CHEESE",
      typeLabel: "Queijo",
      subtitle: "Cura longa e textura firme",
      priceCents: 3200,
      isDemoData: true,
      score: 78,
      tier: "boa",
      reason: "A acidez equilibra a gordura do queijo.",
    },
  ],
};

test("quiz envia o perfil e mostra as recomendações", async ({ page }) => {
  let payload: unknown;
  await mockRecommendations(page, recommendations, (body) => {
    payload = body;
  });

  await page.goto("/descobrir");

  const intensity = page.getByRole("slider").first();
  await intensity.press("ArrowRight");
  await expect(intensity).toHaveAttribute("aria-valuenow", "4");

  await page.getByRole("button", { name: "Cafés", exact: true }).click();
  await page.getByRole("button", { name: "caramelo", exact: true }).click();
  await page.getByLabel(/Preço máximo por item/).fill("30,00");
  await page.getByRole("button", { name: "Ver recomendações" }).click();

  await expect(page.getByText("Seleção para você")).toBeVisible();
  await expect(page.getByText("2 itens")).toBeVisible();
  await expect(page.locator("main").getByText("Café do Brasil")).toBeVisible();
  await expect(page.getByText("Combina muito")).toBeVisible();
  await expect(
    page.getByText("Notas de caramelo e corpo médio conversam com seu perfil."),
  ).toBeVisible();

  expect(payload).toMatchObject({
    intensity: 4,
    body: 3,
    acidity: 3,
    categories: ["COFFEE"],
    notes: ["caramelo"],
    maxPriceCents: 3000,
  });
});

test("clicar no resultado do quiz abre a ficha do produto", async ({
  page,
}) => {
  await mockRecommendations(page, recommendations);

  await page.goto("/descobrir");
  await page.getByRole("button", { name: "Ver recomendações" }).click();
  await expect(page.getByText("Seleção para você")).toBeVisible();

  await page
    .getByRole("link")
    .filter({ hasText: "Café do Brasil" })
    .first()
    .click();

  await expect(page).toHaveURL(/\/produtos\/cafe-do-brasil$/);
  await expect(
    page.getByRole("heading", { name: "Café do Brasil" }),
  ).toBeVisible();
});

test("quiz mostra estado vazio quando nada é encontrado", async ({ page }) => {
  await mockRecommendations(page, {
    fallback: false,
    reason: null,
    recommendations: [],
  });

  await page.goto("/descobrir");
  await page.getByRole("button", { name: "Ver recomendações" }).click();

  await expect(
    page.getByText(
      "Não encontramos produtos para esse perfil. Tente ampliar as coleções ou o preço máximo.",
    ),
  ).toBeVisible();
});

test("falha na API mostra erro e mantém o formulário", async ({ page }) => {
  await failRecommendations(page);

  await page.goto("/descobrir");
  await page.getByRole("button", { name: "Ver recomendações" }).click();

  await expect(
    page.getByRole("alert").filter({
      hasText: "Não conseguimos gerar recomendações agora.",
    }),
  ).toHaveText("Não conseguimos gerar recomendações agora. Tente novamente.");
  await expect(
    page.getByRole("button", { name: "Ver recomendações" }),
  ).toBeEnabled();
  await expect(page.getByRole("heading", { name: "Seu perfil" })).toBeVisible();
});
