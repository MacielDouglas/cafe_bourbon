import { expect, test } from "@playwright/test";
import { login, selectOption } from "./helpers";

test("admin exige login", async ({ page }) => {
  await page.goto("/admin");

  await expect(page).toHaveURL(/\/entrar\?redirect=\/admin$/);
  await expect(
    page.getByRole("heading", { name: "Entrar" }),
  ).toBeVisible();
});

test("owner vê métricas e navega pelo painel", async ({ page }) => {
  await login(page, "/admin");

  await expect(
    page.getByRole("heading", { name: "Visão geral" }),
  ).toBeVisible();
  for (const label of ["Receita", "Pedidos", "Ticket médio", "Itens vendidos"]) {
    await expect(page.getByText(label, { exact: true }).first()).toBeVisible();
  }

  await page.getByRole("link", { name: "Pedidos", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/pedidos$/);
  await expect(
    page.locator('[data-slot="card-title"]').getByText("Pedidos", {
      exact: true,
    }),
  ).toBeVisible();

  await page.getByRole("textbox", { name: "Buscar pedidos" }).fill("zzz-inexistente");
  await page.getByRole("button", { name: "Filtrar" }).click();
  await expect(page).toHaveURL(/\/admin\/pedidos\?q=zzz-inexistente$/);
  await expect(
    page.getByText(/Nenhum pedido corresponde a esse filtro/),
  ).toBeVisible();

  await selectOption(page, "Filtrar por status", "Cancelado");
  await expect(page).toHaveURL(/status=CANCELLED/);
});

test("admin filtra produtos e cancela a exclusão", async ({ page }) => {
  await login(page, "/admin");

  await page.getByRole("link", { name: "Produtos", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/produtos$/);
  await expect(
    page.getByRole("heading", { name: "Produtos", level: 2 }),
  ).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();

  await page
    .getByRole("textbox", { name: "Buscar produtos" })
    .fill("Café do Brasil");
  await expect(page.getByText("Café do Brasil").first()).toBeVisible();

  await page.getByRole("textbox", { name: "Buscar produtos" }).fill("zzz");
  await expect(
    page.getByText("Nenhum produto corresponde a esse filtro."),
  ).toBeVisible();

  await page.getByRole("textbox", { name: "Buscar produtos" }).fill("");
  await page.getByRole("button", { name: "Excluir Café do Brasil" }).click();

  const dialog = page.getByRole("dialog", { name: "Excluir produto" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Cancelar" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText("Café do Brasil").first()).toBeVisible();
});

test("admin abre as páginas de produto sem erro", async ({ page }) => {
  await login(page, "/admin/produtos/novo");

  await expect(
    page.getByRole("heading", { name: "Painel da casa" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Novo produto" })).toBeVisible();
  await expect(page.getByText("Application error")).toHaveCount(0);

  await page.goto("/admin/produtos");
  await page.getByRole("button", { name: "Editar Café do Brasil" }).click();

  await expect(page).toHaveURL(/\/admin\/produtos\/[^/]+$/);
  await expect(
    page.getByRole("heading", { name: "Editar produto" }),
  ).toBeVisible();
  await expect(page.getByText("Application error")).toHaveCount(0);
});
