import { expect, test } from "@playwright/test";
import {
  addToCart,
  clearCart,
  DEMO_COFFEE,
  failApi,
  login,
  selectOption,
  toast,
} from "./helpers";

test("falha ao adicionar produto mostra toast recuperável", async ({
  page,
}) => {
  await failApi(page, "/api/cart", 500, {}, "POST");
  await page.goto(`/produtos/${DEMO_COFFEE.slug}`);

  await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();

  await expect(
    toast(page, "Não foi possível adicionar ao carrinho. Tente novamente."),
  ).toBeVisible();
});

test("falha ao alterar quantidade mostra toast de atualização", async ({
  page,
}) => {
  await addToCart(page, DEMO_COFFEE.slug, DEMO_COFFEE.name);
  await failApi(page, "/api/cart", 500, {}, "PATCH");
  await page.goto("/carrinho");

  await page
    .getByRole("button", { name: `Aumentar ${DEMO_COFFEE.name}` })
    .click();

  await expect(toast(page, "Não foi possível atualizar o carrinho.")).toBeVisible();
  await clearCart(page);
});

test("falha ao remover item mostra toast de atualização", async ({ page }) => {
  await addToCart(page, DEMO_COFFEE.slug, DEMO_COFFEE.name);
  await failApi(page, "/api/cart", 500, {}, "DELETE");
  await page.goto("/carrinho");

  await page.getByRole("button", { name: "Remover", exact: true }).click();

  await expect(toast(page, "Não foi possível atualizar o carrinho.")).toBeVisible();
  await page.unroute("**/api/cart*");
  await clearCart(page);
});

test("falha ao adicionar kit mostra toast do kit", async ({ page }) => {
  await failApi(page, "/api/cart/kit", 500, {}, "POST");
  await page.goto("/harmonizacoes?cafe=cafe-do-brasil");

  await page.getByRole("button", { name: "Adicionar kit" }).first().click();

  await expect(toast(page, "Não foi possível adicionar o kit.")).toBeVisible();
});

test("falha no checkout mostra toast de pedido", async ({ page }) => {
  await login(page, "/carrinho");
  await clearCart(page);
  await addToCart(page, DEMO_COFFEE.slug, DEMO_COFFEE.name);
  await failApi(page, "/api/checkout", 500, {}, "POST");
  await page.goto("/carrinho");

  await page
    .getByRole("button", { name: "Finalizar pedido (demonstrativo)" })
    .click();

  await expect(toast(page, "Não foi possível concluir o pedido.")).toBeVisible();
  await clearCart(page);
});

test("falha na assinatura mostra toast de assinatura", async ({ page }) => {
  await login(page, "/assinatura");
  await failApi(page, "/api/subscription", 500, {}, "POST");

  await page.getByRole("button", { name: /Coffee Lovers/ }).click();
  await selectOption(page, "Café do mês", "Café Cubano");
  await page.getByRole("button", { name: "Confirmar assinatura" }).click();

  await expect(
    toast(page, "Não foi possível concluir a assinatura."),
  ).toBeVisible();
});
