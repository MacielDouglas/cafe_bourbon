import { expect, test } from "@playwright/test";
import {
  addToCart,
  clearCart,
  credentialsEmail,
  credentialsSubmit,
  DEMO_COFFEE,
  login,
  toast,
} from "./helpers";

test("carrinho vazio orienta a explorar o catálogo", async ({ page }) => {
  await page.goto("/carrinho");

  await expect(page.getByText("Seu carrinho está vazio")).toBeVisible();
  await page.getByRole("button", { name: "Ver o catálogo" }).click();

  await expect(page).toHaveURL(/\/produtos$/);
  await expect(
    page.getByRole("heading", { name: "Cafés, queijos e vinhos" }),
  ).toBeVisible();
});

test("altera quantidade, remove com desfazer e esvazia o carrinho", async ({
  page,
}) => {
  await addToCart(page, DEMO_COFFEE.slug, DEMO_COFFEE.name);
  await page.goto("/carrinho");

  await page
    .getByRole("button", { name: `Aumentar ${DEMO_COFFEE.name}` })
    .click();
  await expect(page.getByText("R$ 40,00").first()).toBeVisible();

  await page
    .getByRole("button", { name: `Diminuir ${DEMO_COFFEE.name}` })
    .click();
  await expect(page.getByText("R$ 20,00").first()).toBeVisible();

  await page.getByRole("button", { name: "Remover", exact: true }).click();
  await expect(toast(page, `${DEMO_COFFEE.name} removido`)).toBeVisible();
  await expect(page.getByText("Seu carrinho está vazio")).toBeVisible();

  await page
    .locator("[data-sonner-toast]")
    .filter({ hasText: `${DEMO_COFFEE.name} removido` })
    .getByRole("button", { name: "Desfazer" })
    .click();
  await expect(
    page.locator("main").getByRole("link", { name: DEMO_COFFEE.name }).first(),
  ).toBeVisible();

  await page.getByRole("button", { name: "Esvaziar carrinho" }).click();
  await expect(toast(page, "Carrinho esvaziado")).toBeVisible();
  await expect(page.getByText("Seu carrinho está vazio")).toBeVisible();
  await page
    .locator("[data-sonner-toast]")
    .filter({ hasText: "Carrinho esvaziado" })
    .getByRole("button", { name: "Desfazer" })
    .click();
  await expect(
    page.locator("main").getByRole("link", { name: DEMO_COFFEE.name }).first(),
  ).toBeVisible();
  await clearCart(page);
});

test("checkout sem sessão pede login e volta ao carrinho", async ({ page }) => {
  await addToCart(page, DEMO_COFFEE.slug, DEMO_COFFEE.name);
  await page.goto("/carrinho");

  await page
    .getByRole("button", { name: "Finalizar pedido (demonstrativo)" })
    .click();

  await expect(page).toHaveURL(/\/entrar\?redirect=\/carrinho$/);
  await expect(toast(page, "Entre na sua conta para finalizar o pedido.")).toBeVisible();

  await credentialsEmail(page).fill("coffeemen@coffee.com");
  await page.locator('input[name="password"]').fill("teste1234");
  await credentialsSubmit(page).click();

  await expect(page).toHaveURL(/\/carrinho$/);
  await clearCart(page);
});

test("compra autenticada cria pedido e esvazia o carrinho", async ({
  page,
}) => {
  await login(page, "/carrinho");
  await clearCart(page);

  await addToCart(page, DEMO_COFFEE.slug, DEMO_COFFEE.name);
  await page.goto("/carrinho");

  await expect(page.getByText("R$ 20,00").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Resumo" })).toBeVisible();

  await page
    .getByRole("button", { name: "Finalizar pedido (demonstrativo)" })
    .click();

  await expect(toast(page, "Pedido demonstrativo confirmado")).toBeVisible();
  await expect(page.getByText("Seu carrinho está vazio")).toBeVisible();
  await expect(
    page
      .getByRole("banner")
      .getByRole("button", { name: "Carrinho", exact: true }),
  ).toBeVisible();
});
