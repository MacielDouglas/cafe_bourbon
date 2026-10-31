import { expect, test } from "@playwright/test";
import { credentialsEmail, credentialsSubmit, login, owner, toast } from "./helpers";

test("login inválido mostra mensagem traduzida e foca o e-mail", async ({
  page,
}) => {
  await page.goto("/entrar");

  await credentialsEmail(page).fill("ninguem@example.com");
  await page.locator('input[name="password"]').fill("senha-errada-123");
  await credentialsSubmit(page).click();

  await expect(
    page.getByRole("alert").filter({ hasText: "E-mail ou senha incorretos." }),
  ).toHaveText("E-mail ou senha incorretos.");
  await expect(credentialsEmail(page)).toBeFocused();
  await expect(page).toHaveURL(/\/entrar$/);
});

test("login do owner abre a conta e permite sair", async ({ page }) => {
  await login(page, "/assinatura");

  await page.getByRole("button", { name: "Minha conta" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText(owner.email)).toBeVisible();

  await dialog.getByRole("button", { name: "Sair" }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("banner").getByRole("button", { name: "Entrar" }),
  ).toBeVisible();
});

test("cadastro cria conta e usuário comum não acessa o admin", async ({
  page,
}) => {
  const email = `e2e-${Date.now()}@example.com`;

  await page.goto("/criar-conta");
  await page.locator('input[name="name"]').fill("Cliente de Teste");
  await credentialsEmail(page).fill(email);
  await page.locator('input[name="password"]').fill("senha-segura-123");
  await page.getByRole("button", { name: "Criar conta" }).click();

  await expect(toast(page, "Conta criada")).toBeVisible();
  await expect(page).toHaveURL(/\/assinatura$/);
  await expect(
    page.getByRole("banner").getByRole("button", { name: "Minha conta" }),
  ).toBeVisible();

  const response = await page.goto("/admin");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Esta página saiu da mesa." }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Minha conta" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/criar-conta");
  await page.locator('input[name="name"]').fill("Cliente Duplicado");
  await credentialsEmail(page).fill(email);
  await page.locator('input[name="password"]').fill("senha-segura-123");
  await page.getByRole("button", { name: "Criar conta" }).click();

  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Já existe uma conta com este e-mail." }),
  ).toHaveText("Já existe uma conta com este e-mail.");
});
