import { expect, test } from "@playwright/test";
import { selectOption } from "./helpers";

test("filtra o catálogo por coleção", async ({ page }) => {
  await page.goto("/produtos");

  const filters = page.getByRole("navigation", { name: "Filtrar por coleção" });
  await filters.getByRole("link", { name: "Vinhos" }).click();

  await expect(page).toHaveURL(/\/produtos\?tipo=WINE$/);
  await expect(filters.getByRole("link", { name: "Vinhos" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.getByText("Tinto Encorpado").first()).toBeVisible();
  await expect(page.getByRole("main").getByText("Café do Brasil")).toHaveCount(0);
});

test("ordena por menor preço e mantém o filtro", async ({ page }) => {
  await page.goto("/produtos?tipo=COFFEE");

  await selectOption(page, "Ordenar produtos", "Menor preço");

  await expect(page).toHaveURL(/\/produtos\?tipo=COFFEE&ordem=price-asc$/);
  const firstProduct = page.locator('main a[href^="/produtos/"]').first();
  await expect(firstProduct).toContainText("Café do Brasil");
});

test("compara produtos e limpa a comparação", async ({ page }) => {
  await page.goto("/produtos");

  await page.getByRole("link", { name: "Comparar", exact: true }).first().click();
  await expect(page).toHaveURL(/comparar=/);
  await expect(page.getByText(/1 selecionado\(s\) para comparar/)).toBeVisible();

  await page.goto("/produtos?comparar=cafe-do-brasil,cafe-cubano");
  await expect(
    page.getByRole("heading", { name: "Comparando 2 produtos" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver produto" })).toHaveCount(2);

  await page.getByRole("link", { name: "Limpar comparação" }).click();
  await expect(page).toHaveURL(/\/produtos$/);
  await expect(
    page.getByRole("heading", { name: /Comparando/ }),
  ).toHaveCount(0);
});

test("limita a comparação a quatro produtos", async ({ page }) => {
  await page.goto(
    "/produtos?comparar=cafe-do-brasil,cafe-cubano,cafe-papua-nova-guine,cafe-colombiano-medellin,tinto-encorpado",
  );

  await expect(
    page.getByRole("heading", { name: "Comparando 4 produtos" }),
  ).toBeVisible();
});

test("busca sem resultado mostra estado vazio explicativo", async ({ page }) => {
  await page.goto("/produtos?busca=xyz-inexistente");

  await expect(page.getByText("Nada por aqui ainda")).toBeVisible();
  await expect(
    page.getByText(/Não encontramos produtos para “xyz-inexistente”/),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Ver todos os produtos" }),
  ).toBeVisible();
});

test("ficha do produto mostra perfil e atalho de harmonização", async ({
  page,
}) => {
  await page.goto("/produtos/cafe-do-brasil");

  await expect(
    page.getByRole("heading", { level: 1, name: "Café do Brasil" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Perfil sensorial" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Métodos de preparo" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Ver harmonizações sugeridas" }).click();

  await expect(page).toHaveURL(/\/harmonizacoes\?cafe=cafe-do-brasil$/);
  await expect(
    page.getByText("Pares para Café do Brasil"),
  ).toBeVisible();
});
