import { expect, test } from "@playwright/test";
import { trackPageErrors } from "./helpers";

const routes: { path: string; heading: RegExp | string }[] = [
  { path: "/", heading: /Do grão/ },
  { path: "/produtos", heading: "Cafés, queijos e vinhos" },
  { path: "/produtos/cafe-do-brasil", heading: "Café do Brasil" },
  { path: "/harmonizacoes", heading: "O que combina com o quê" },
  { path: "/descobrir", heading: "Encontre seu próximo favorito" },
  { path: "/barista", heading: "Tire dúvidas antes de provar" },
  { path: "/assinatura", heading: "Café bom, sem pensar" },
  { path: "/carrinho", heading: "Sua seleção" },
  { path: "/entrar", heading: "Entrar" },
  { path: "/criar-conta", heading: "Criar conta" },
];

for (const route of routes) {
  test(`abre ${route.path} sem erro de página`, async ({ page }) => {
    const errors = trackPageErrors(page);

    const response = await page.goto(route.path);

    expect(response?.status()).toBeLessThan(400);
    await expect(
      page.getByRole("heading", { level: 1, name: route.heading }),
    ).toBeVisible();
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("404 mostra página própria e links de recuperação", async ({ page }) => {
  const response = await page.goto("/rota-que-nao-existe");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Esta página saiu da mesa." }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Voltar ao início" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver catálogo" })).toBeVisible();
});

test("produto inexistente mostra a página de produto não encontrado", async ({
  page,
}) => {
  const response = await page.goto("/produtos/produto-inexistente");

  expect([200, 404]).toContain(response?.status() ?? 0);
  await expect(
    page.getByRole("heading", { name: "Produto não encontrado" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Ver todo o catálogo" }),
  ).toBeVisible();
});

test.describe("celular", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  const mobileRoutes = [
    "/",
    "/produtos",
    "/produtos/cafe-do-brasil",
    "/harmonizacoes",
    "/descobrir",
    "/barista",
    "/assinatura",
    "/carrinho",
  ];

  for (const path of mobileRoutes) {
    test(`${path} não rola na horizontal`, async ({ page }) => {
      await page.goto(path);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );

      expect(overflow).toBeLessThanOrEqual(1);
    });
  }

  test("menu mobile busca e navega", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Abrir menu" }).click();
    const menu = page.getByRole("dialog", { name: "Menu" });
    await expect(menu).toBeVisible();

    await menu.getByRole("searchbox", { name: "Termo de busca" }).fill("Cuba");
    await menu.getByRole("button", { name: "Ir" }).click();

    await expect(page).toHaveURL(/\/produtos\?busca=Cuba$/);
    await expect(page.getByRole("link", { name: /Café Cubano/ }).first()).toBeVisible();
    await expect(menu).toBeHidden();

    await page.getByRole("button", { name: "Abrir menu" }).click();
    await page
      .getByRole("dialog", { name: "Menu" })
      .getByRole("link", { name: "Descobrir", exact: true })
      .click();

    await expect(page).toHaveURL(/\/descobrir$/);
    await expect(
      page.getByRole("heading", { name: "Encontre seu próximo favorito" }),
    ).toBeVisible();
  });
});
