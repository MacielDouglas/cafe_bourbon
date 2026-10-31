import { expect, test } from "@playwright/test";
import { login, selectOption, toast } from "./helpers";

test("assinatura sem sessão leva ao login", async ({ page }) => {
  await page.goto("/assinatura");

  await expect(
    page.getByRole("heading", { name: "Café bom, sem pensar" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Confirmar assinatura" }).click();

  await expect(page).toHaveURL(/\/entrar\?redirect=\/assinatura$/);
  await expect(
    toast(page, "Entre na sua conta para assinar. Suas escolhas ficam salvas."),
  ).toBeVisible();
});

test("assina um plano escolhendo café, moagem e preparo", async ({ page }) => {
  const captured: { payload?: Record<string, unknown> } = {};

  await page.route("**/api/subscription", async (route) => {
    captured.payload = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        subscription: {
          id: "sub-e2e",
          plan: "COFFEE_LOVERS",
          planName: "Coffee Lovers",
          cadence: "por mês",
          priceLabel: 12000,
          grind: "MOIDO",
          brewMethod: "COADO",
          coffeeId: "cafe-cubano",
          status: "ACTIVE",
        },
      }),
    });
  });

  await login(page, "/assinatura");

  await page.getByRole("button", { name: /Coffee Lovers/ }).click();
  await expect(
    page.getByRole("button", { name: /Coffee Lovers/ }),
  ).toHaveAttribute("aria-pressed", "true");

  await selectOption(page, "Café do mês", "Café Cubano");
  await page.getByRole("radio", { name: "Moído" }).click();
  await selectOption(page, "Método de preparo (opcional)", "Coado");

  await page.getByRole("button", { name: "Confirmar assinatura" }).click();

  await expect(
    page.getByRole("heading", { name: "A mesa está garantida." }),
  ).toBeVisible();
  await expect(
    page.locator("main").getByText("Plano Coffee Lovers ativado."),
  ).toBeVisible();
  await expect(toast(page, "Assinatura confirmada")).toBeVisible();

  expect(captured.payload).toMatchObject({
    plan: "COFFEE_LOVERS",
    grind: "MOIDO",
    brewMethod: "COADO",
  });
  expect(typeof captured.payload?.coffeeId).toBe("string");

  await page.getByRole("button", { name: "Fazer outra assinatura" }).click();
  await expect(
    page.getByRole("button", { name: "Confirmar assinatura" }),
  ).toBeVisible();
});

test("rascunho da assinatura é restaurado após recarregar", async ({
  page,
}) => {
  await page.goto("/assinatura");

  await page.getByRole("button", { name: /Coffee Lovers/ }).click();
  await selectOption(page, "Café do mês", "Café Cubano");

  await expect
    .poll(() =>
      page.evaluate(() => window.sessionStorage.getItem("cb_subscription_draft")),
    )
    .toContain("COFFEE_LOVERS");

  await page.reload();

  await expect(
    page.getByRole("button", { name: /Coffee Lovers/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("combobox", { name: "Café do mês" }),
  ).toContainText("Café Cubano");
});

test("confirmar assinatura limpa o rascunho", async ({ page }) => {
  await page.route("**/api/subscription", (route) =>
    route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        subscription: {
          id: "sub-draft",
          plan: "COFFEE_LOVERS",
          planName: "Coffee Lovers",
          cadence: "por mês",
          priceLabel: 12000,
          grind: "GRAOS",
          brewMethod: null,
          coffeeId: "cafe-cubano",
          status: "ACTIVE",
        },
      }),
    }),
  );

  await login(page, "/assinatura");
  await page.getByRole("button", { name: /Coffee Lovers/ }).click();
  await selectOption(page, "Café do mês", "Café Cubano");

  await expect
    .poll(() =>
      page.evaluate(() => window.sessionStorage.getItem("cb_subscription_draft")),
    )
    .toContain("COFFEE_LOVERS");

  await page.getByRole("button", { name: "Confirmar assinatura" }).click();

  await expect(
    page.getByRole("heading", { name: "A mesa está garantida." }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => window.sessionStorage.getItem("cb_subscription_draft")),
    )
    .toBeNull();
});

test("newsletter do rodapé registra a inscrição", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Seu e-mail").fill("visitante@example.com");
  await page
    .getByRole("contentinfo")
    .getByRole("button", { name: "Assinar" })
    .click();

  await expect(toast(page, "Inscrição registrada!")).toBeVisible();
});
