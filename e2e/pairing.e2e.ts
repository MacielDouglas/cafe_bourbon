import { expect, test } from "@playwright/test";
import { clearCart, selectOption, toast } from "./helpers";

test("harmonizador calcula pares para o café escolhido", async ({ page }) => {
  await page.goto("/harmonizacoes");

  await expect(
    page.getByText("A mesa começa pelo café.", { exact: true }),
  ).toBeVisible();

  await selectOption(page, "Escolha o café", "Café do Brasil");

  await expect(page).toHaveURL(/\/harmonizacoes\?cafe=cafe-do-brasil$/);
  await expect(page.getByText("Pares para Café do Brasil")).toBeVisible();
  await expect(page.getByText(/sugestões calculadas/)).toBeVisible();
  await expect(page.getByText("Sugestão calculada").first()).toBeVisible();

  const trigger = page
    .getByRole("button", { name: "Como chegamos a esta nota" })
    .first();
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
});

test("adiciona um kit de harmonização ao carrinho", async ({ page }) => {
  await clearCart(page);
  await page.goto("/harmonizacoes?cafe=cafe-do-brasil");

  const kitBlock = page
    .getByRole("heading", { name: /Kit de harmonização/ })
    .first()
    .locator("..");
  const kitNames = (
    await kitBlock.locator("li > span:first-child").allTextContents()
  ).map((name) => name.trim());
  expect(kitNames.length).toBeGreaterThanOrEqual(2);

  await page.getByRole("button", { name: "Adicionar kit" }).first().click();
  await expect(toast(page, "Kit adicionado ao carrinho")).toBeVisible();

  await page.goto("/carrinho");
  await expect(page.getByText("Kit de harmonização", { exact: false })).toBeVisible();
  for (const name of kitNames) {
    await expect(
      page.getByRole("button", { name: `Aumentar ${name}` }),
    ).toBeVisible();
  }
  await expect(page.getByRole("button", { name: /Remover$/ })).toHaveCount(
    kitNames.length,
  );
  await expect(page.getByText(/5% off/)).toBeVisible();

  await clearCart(page);
});

test("escolher outro café atualiza os pares", async ({ page }) => {
  await page.goto("/harmonizacoes?cafe=cafe-do-brasil");

  await selectOption(page, "Escolha o café", "Café Cubano");

  await expect(page).toHaveURL(/\/harmonizacoes\?cafe=cafe-cubano$/);
  await expect(page.getByText("Pares para Café Cubano")).toBeVisible();
});
