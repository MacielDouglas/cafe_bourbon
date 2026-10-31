import { expect, test } from "@playwright/test";

test("mega-menu leva à coleção de queijos", async ({ page }) => {
  await page.goto("/");
  const header = page.getByRole("banner");

  await header.getByRole("link", { name: "Catálogo" }).hover();
  await header.getByRole("link", { name: /Queijos/ }).click();

  await expect(page).toHaveURL(/\/produtos\?tipo=CHEESE$/);
  await expect(
    page
      .getByRole("navigation", { name: "Filtrar por coleção" })
      .getByRole("link", { name: "Queijos" }),
  ).toHaveAttribute("aria-current", "page");
  await expect(page.getByText("Queijo Frescal").first()).toBeVisible();
});

test("navegação principal abre as seções", async ({ page }) => {
  await page.goto("/");
  const header = page.getByRole("banner");

  await header.getByRole("link", { name: "Harmonizações" }).click();
  await expect(page).toHaveURL(/\/harmonizacoes$/);
  await expect(
    page.getByRole("heading", { name: "O que combina com o quê" }),
  ).toBeVisible();

  await header.getByRole("link", { name: "Tire dúvidas" }).click();
  await expect(page).toHaveURL(/\/barista$/);
  await expect(
    page.getByRole("heading", { name: "Tire dúvidas antes de provar" }),
  ).toBeVisible();
});

test("busca do cabeçalho filtra o catálogo", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Buscar produtos" }).click();
  const dialog = page.getByRole("dialog", { name: "Buscar" });
  await expect(dialog).toBeVisible();

  await dialog.getByRole("searchbox", { name: "Termo de busca" }).fill("Brasil");
  await dialog.getByRole("button", { name: "Ir" }).click();

  await expect(page).toHaveURL(/\/produtos\?busca=Brasil$/);
  await expect(
    page.locator("main").getByText("Café do Brasil").first(),
  ).toBeVisible();
});

test("cabeçalho fica fixo e rodapé rola até a história", async ({ page }) => {
  await page.goto("/");
  const header = page.getByRole("banner");

  await page.mouse.wheel(0, 900);
  await expect(header).toBeInViewport();
  const top = await header.evaluate(
    (element) => element.getBoundingClientRect().top,
  );
  expect(top).toBeLessThanOrEqual(1);

  const footer = page.getByRole("contentinfo");
  await footer.getByRole("link", { name: "Nossa história" }).click();

  await expect(page).toHaveURL(/\/#historia$/);
  await expect(page.locator("#historia")).toBeInViewport();

  await footer.getByRole("link", { name: "Voltar ao topo" }).click();
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeLessThan(50);
});

test.describe("rolagem", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("aside do harmonizador permanece fixo ao rolar os pares", async ({
    page,
  }) => {
    await page.goto("/harmonizacoes?cafe=cafe-do-brasil");
    const aside = page
      .getByRole("complementary")
      .filter({ hasText: "Escolha o café" });
    await expect(aside).toBeVisible();

    const start = await aside.boundingBox();
    expect(start?.y).toBeTruthy();
    await page.mouse.wheel(0, Math.round((start?.y ?? 0) - 96 + 10));

    await expect(aside).toBeInViewport();
    const box = await aside.boundingBox();
    expect(box?.y).toBeGreaterThanOrEqual(90);
    expect(box?.y).toBeLessThanOrEqual(102);
  });

  test("aside da assinatura permanece fixo ao rolar o formulário", async ({
    page,
  }) => {
    await page.goto("/assinatura");
    const aside = page
      .getByRole("complementary")
      .filter({ hasText: "Sua escolha" });
    await expect(aside).toBeVisible();

    const start = await aside.boundingBox();
    expect(start?.y).toBeTruthy();
    await page.mouse.wheel(0, Math.round((start?.y ?? 0) - 96 + 10));

    await expect(aside).toBeInViewport();
    const box = await aside.boundingBox();
    expect(box?.y).toBeGreaterThanOrEqual(90);
    expect(box?.y).toBeLessThanOrEqual(102);
  });

  test("navegar a partir do fim da página reinicia o scroll", async ({
    page,
  }) => {
    await page.goto("/produtos");
    await expect(
      page.getByRole("heading", { name: "Cafés, queijos e vinhos" }),
    ).toBeVisible();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(300);

    await page
      .getByRole("banner")
      .getByRole("link", { name: "Descobrir" })
      .click();
    await expect(page).toHaveURL(/\/descobrir$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(50);
  });
});

test("link de pular conteúdo é o primeiro foco", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Pular para o conteúdo" });
  await expect(skip).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/#conteudo$/);
});
