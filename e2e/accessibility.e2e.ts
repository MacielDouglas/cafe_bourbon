import { expect, test } from "@playwright/test";
import {
  addToCart,
  credentialsEmail,
  credentialsPassword,
  expectNoA11yViolations,
  login,
  mockChat,
  mockRecommendations,
  owner,
  type RecommendationFixture,
} from "./helpers";

const publicRoutes = [
  "/",
  "/produtos",
  "/produtos/cafe-do-brasil",
  "/harmonizacoes",
  "/harmonizacoes?cafe=cafe-do-brasil",
  "/descobrir",
  "/barista",
  "/carrinho",
  "/assinatura",
  "/entrar",
  "/criar-conta",
  "/rota-que-nao-existe",
];

for (const path of publicRoutes) {
  test(`axe: ${path} não tem violações`, async ({ page }) => {
    await page.goto(path);
    await expectNoA11yViolations(page);
  });
}

test("axe: diálogo de busca aberto", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Buscar produtos" }).click();
  await expect(page.getByRole("dialog", { name: "Buscar" })).toBeVisible();
  await expectNoA11yViolations(page);
});

test("axe: diálogo de conta aberto", async ({ page }) => {
  await login(page, "/assinatura");
  await page.getByRole("button", { name: "Minha conta" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expectNoA11yViolations(page);
});

test("axe: carrinho com um item", async ({ page }) => {
  await addToCart(page, "cafe-do-brasil", "Café do Brasil");
  await page.goto("/carrinho");
  await expect(page.getByRole("heading", { name: "Resumo" })).toBeVisible();
  await expectNoA11yViolations(page);
});

test("axe: quiz com resultados", async ({ page }) => {
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
    ],
  };
  await mockRecommendations(page, recommendations);

  await page.goto("/descobrir");
  await page.getByRole("button", { name: "Ver recomendações" }).click();
  await expect(page.getByText("Seleção para você")).toBeVisible();
  await expectNoA11yViolations(page);
});

test("axe: chat com mensagens", async ({ page }) => {
  await mockChat(page, {
    reply: "O Café do Brasil combina bem com chocolate.",
    productSlugs: ["cafe-do-brasil"],
    productNames: { "cafe-do-brasil": "Café do Brasil" },
  });

  await page.goto("/barista");
  await page
    .getByRole("textbox", { name: "Pergunta sobre café, queijo ou vinho" })
    .fill("Qual café combina com chocolate?");
  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(page.getByText("Lorenzo Giovanni · Barista")).toBeVisible();
  await expectNoA11yViolations(page);
});

test("axe: comparação de produtos", async ({ page }) => {
  await page.goto("/produtos?comparar=cafe-do-brasil,cafe-cubano");
  await expect(
    page.getByRole("heading", { name: "Comparando 2 produtos" }),
  ).toBeVisible();
  await expectNoA11yViolations(page);
});

test("axe: assinatura com plano escolhido", async ({ page }) => {
  await page.goto("/assinatura");
  await page.getByRole("button", { name: /Coffee Lovers/ }).click();
  await expect(
    page.getByRole("button", { name: /Coffee Lovers/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await expectNoA11yViolations(page);
});

test.describe("admin", () => {
  test("axe: painel e listagens do admin", async ({ page }) => {
    await login(page, "/admin");
    await expect(
      page.getByRole("heading", { name: "Visão geral" }),
    ).toBeVisible();
    await expectNoA11yViolations(page);

    await page.getByRole("link", { name: "Produtos", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/produtos$/);
    await expect(page.getByRole("table")).toBeVisible();
    await expectNoA11yViolations(page);

    await page.goto("/admin/produtos/novo");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoA11yViolations(page);

    await page.goto("/admin/pedidos");
    await expect(
      page
        .locator('[data-slot="card-title"]')
        .getByText("Pedidos", { exact: true }),
    ).toBeVisible();
    await expectNoA11yViolations(page);
  });
});

test.describe("teclado, foco e live regions", () => {
  test("Tab percorre o cabeçalho na ordem visual", async ({ page }) => {
    await page.goto("/");

    const startOfHeader = [
      "Pular para o conteúdo",
      "Assinaturas a partir de R$ 90",
      /página inicial/,
      "Catálogo",
    ];
    for (const name of startOfHeader) {
      await page.keyboard.press("Tab");
      await expect(page.locator(":focus")).toHaveAccessibleName(name);
    }

    const harmonizations = page
      .getByRole("navigation", { name: "Navegação principal" })
      .getByRole("link", { name: "Harmonizações" });
    for (let index = 0; index < 20; index++) {
      await page.keyboard.press("Tab");
      if (await harmonizations.evaluate((el) => el === document.activeElement)) {
        break;
      }
    }
    await expect(harmonizations).toBeFocused();

    const endOfHeader = [
      "Descobrir",
      "Tire dúvidas",
      "Assinatura",
      "Buscar produtos",
      "Entrar",
      "Carrinho",
    ];
    for (const name of endOfHeader) {
      await page.keyboard.press("Tab");
      await expect(page.locator(":focus")).toHaveAccessibleName(name);
    }
  });

  test("Esc fecha o diálogo de busca e devolve o foco ao botão", async ({
    page,
  }) => {
    await page.goto("/");
    const searchButton = page.getByRole("button", { name: "Buscar produtos" });
    await searchButton.click();

    const dialog = page.getByRole("dialog", { name: "Buscar" });
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(searchButton).toBeFocused();
  });

  test("Esc fecha o diálogo da conta e devolve o foco ao botão", async ({
    page,
  }) => {
    await login(page, "/assinatura");
    const accountButton = page.getByRole("button", { name: "Minha conta" });
    await accountButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(accountButton).toBeFocused();
  });

  test("login pode ser submetido por Enter no teclado", async ({ page }) => {
    await page.goto("/entrar");
    await credentialsEmail(page).fill(owner.email);
    await credentialsPassword(page).fill(owner.password);
    await credentialsPassword(page).press("Enter");

    await page.waitForURL((url) => !url.pathname.startsWith("/entrar"));
  });

  test("slider do quiz opera com ArrowLeft e toggle aciona pelo teclado", async ({
    page,
  }) => {
    await page.goto("/descobrir");

    const intensity = page.getByRole("slider", { name: "Intensidade" });
    await intensity.focus();
    await intensity.press("ArrowLeft");
    await expect(intensity).toHaveAttribute("aria-valuenow", "2");

    const toggle = page.getByRole("button", { name: "Cafés", exact: true });
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

  test("radio de moagem navega por setas", async ({ page }) => {
    await page.goto("/assinatura");

    const first = page.getByRole("radio", { name: "Em grãos" });
    await first.focus();
    await page.keyboard.press("ArrowRight");

    await expect(
      page.getByRole("radio", { name: "Moído" }),
    ).toHaveAttribute("aria-checked", "true");
  });

  test("chat sinaliza aria-busy e a persona prevista durante o envio", async ({
    page,
  }) => {
    await page.route("**/api/chat", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 700));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          reply: "O Café do Brasil combina muito bem com chocolate.",
          productSlugs: [],
          productNames: {},
          pairingIds: [],
          degraded: false,
        }),
      });
    });

    await page.goto("/barista");
    await page
      .getByRole("textbox", { name: "Pergunta sobre café, queijo ou vinho" })
      .fill("Qual café combina com chocolate?");
    await page.getByRole("button", { name: "Enviar" }).click();

    const log = page.getByRole("log");
    const pending = page.getByText("Lorenzo Giovanni está pensando...");
    await expect(log).toHaveAttribute("aria-busy", "true");
    await expect(pending).toBeVisible();

    await expect(log).toHaveAttribute("aria-busy", "false");
    await expect(pending).toBeHidden();
    await expect(
      page.getByText("O Café do Brasil combina muito bem com chocolate."),
    ).toBeVisible();
  });

  test("resultados do quiz anunciam em região aria-live", async ({ page }) => {
    await mockRecommendations(page, {
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
          reason: "Notas de caramelo conversam com seu perfil.",
        },
      ],
    });

    await page.goto("/descobrir");
    await page.getByRole("button", { name: "Ver recomendações" }).click();

    await expect(
      page.locator('[aria-live="polite"]').filter({
        hasText: "Seleção para você",
      }),
    ).toBeVisible();
  });

  test("link ativo do cabeçalho marca aria-current", async ({ page }) => {
    await page.goto("/produtos");

    await expect(
      page.getByRole("banner").getByRole("link", { name: "Catálogo" }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("elemento focado pelo Teclado no cabeçalho mostra anel de foco", async ({
    page,
  }) => {
    await page.goto("/");

    for (let index = 0; index < 4; index++) {
      await page.keyboard.press("Tab");
    }
    await expect(page.getByRole("banner").getByRole("link", { name: "Catálogo" })).toBeFocused();

    const focusStyles = await page.locator(":focus").evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        outline: style.outlineStyle,
        boxShadow: style.boxShadow,
      };
    });

    const hasOutline = focusStyles.outline !== "none";
    const hasRing =
      focusStyles.boxShadow !== "none" && focusStyles.boxShadow !== "";
    expect(hasOutline || hasRing).toBe(true);
  });
});

test.describe("celular", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("axe: menu mobile aberto", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Abrir menu" }).click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
    await expectNoA11yViolations(page);
  });

  test("Esc fecha o menu mobile e devolve o foco ao botão", async ({
    page,
  }) => {
    await page.goto("/");
    const menuButton = page.getByRole("button", { name: "Abrir menu" });
    await menuButton.click();

    const menu = page.getByRole("dialog", { name: "Menu" });
    await expect(menu).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(menuButton).toBeFocused();
  });

  test("axe: home no celular", async ({ page }) => {
    await page.goto("/");
    await expectNoA11yViolations(page);
  });
});
