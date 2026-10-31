import { expect, test } from "@playwright/test";
import { failApi, failChat, mockChat } from "./helpers";

test("pergunta à IA mostra resposta com especialista e produto", async ({
  page,
}) => {
  await mockChat(page, {
    reply:
      "Para chocolate, prefira um café com notas de cacau e corpo médio. O Café do Brasil é uma boa pedida.",
    productSlugs: ["cafe-do-brasil"],
    productNames: { "cafe-do-brasil": "Café do Brasil" },
  });

  await page.goto("/barista");

  const input = page.getByRole("textbox", {
    name: "Pergunta sobre café, queijo ou vinho",
  });
  await input.fill("Qual café combina com chocolate?");
  await page.getByRole("button", { name: "Enviar" }).click();

  await expect(
    page.getByText("Qual café combina com chocolate?"),
  ).toBeVisible();
  await expect(
    page.getByText(/Para chocolate, prefira um café com notas de cacau/),
  ).toBeVisible();
  await expect(page.getByText("Lorenzo Giovanni · Barista")).toBeVisible();
  await expect(
    page.locator("#conteudo").getByRole("link", { name: /Café do Brasil/ }),
  ).toBeVisible();
  await expect(input).toHaveValue("");
});

test("sugestão pronta dispara uma pergunta", async ({ page }) => {
  await mockChat(page, {
    reply: "Coado e prensa diferem no corpo e na textura da bebida.",
    degraded: false,
  });

  await page.goto("/barista");
  await page
    .getByRole("button", { name: "Qual a diferença entre coado e prensa?" })
    .click();

  await expect(
    page.getByText("Coado e prensa diferem no corpo e na textura da bebida."),
  ).toBeVisible();
});

test("modo degradado é sinalizado ao usuário", async ({ page }) => {
  await mockChat(page, {
    reply: "Sugiro o Café Cubano do catálogo.",
    productSlugs: ["cafe-cubano"],
    degraded: true,
  });

  await page.goto("/barista");
  await page
    .getByRole("textbox", { name: "Pergunta sobre café, queijo ou vinho" })
    .fill("Me indique um café");
  await page.getByRole("button", { name: "Enviar" }).click();

  await expect(
    page.getByText(
      "Modo local: a IA está indisponível, então sugeri itens do catálogo.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Cafe Cubano", exact: true }),
  ).toBeVisible();
});

test("falha da IA mostra alerta recuperável", async ({ page }) => {
  await failChat(page);

  await page.goto("/barista");
  await page
    .getByRole("textbox", { name: "Pergunta sobre café, queijo ou vinho" })
    .fill("Vocês entregam em Franca?");
  await page.getByRole("button", { name: "Enviar" }).click();

  await expect(
    page.getByRole("alert").filter({
      hasText: "A casa não conseguiu responder agora.",
    }),
  ).toHaveText("A casa não conseguiu responder agora. Tente novamente em instantes.");
  await page
    .getByRole("textbox", { name: "Pergunta sobre café, queijo ou vinho" })
    .fill("Tentar de novo");
  await expect(page.getByRole("button", { name: "Enviar" })).toBeEnabled();
});

test("429 da IA mostra alerta recuperável", async ({ page }) => {
  await failApi(page, "/api/chat", 429, { error: "Muitas perguntas." });

  await page.goto("/barista");
  await page
    .getByRole("textbox", { name: "Pergunta sobre café, queijo ou vinho" })
    .fill("Qual café combina com queijo?");
  await page.getByRole("button", { name: "Enviar" }).click();

  await expect(
    page.getByRole("alert").filter({
      hasText: "A casa não conseguiu responder agora.",
    }),
  ).toHaveText("A casa não conseguiu responder agora. Tente novamente em instantes.");
  await page
    .getByRole("textbox", { name: "Pergunta sobre café, queijo ou vinho" })
    .fill("Tentar de novo");
  await expect(page.getByRole("button", { name: "Enviar" })).toBeEnabled();
});

test("botão enviar exige texto", async ({ page }) => {
  await page.goto("/barista");

  await expect(page.getByRole("button", { name: "Enviar" })).toBeDisabled();
  await page
    .getByRole("textbox", { name: "Pergunta sobre café, queijo ou vinho" })
    .fill("   ");
  await expect(page.getByRole("button", { name: "Enviar" })).toBeDisabled();
});

test("pergunta fora do escopo responde sem degradação na API real", async ({
  page,
}) => {
  const ip = `198.51.100.${Math.floor(Math.random() * 180) + 10}`;
  let chatCalls = 0;
  await page.route("**/api/chat", (route) => {
    chatCalls += 1;
    return route.continue({ headers: { "x-forwarded-for": ip } });
  });

  await page.goto("/barista");
  await page
    .getByRole("textbox", { name: "Pergunta sobre café, queijo ou vinho" })
    .fill("Que horas são?");
  await page.getByRole("button", { name: "Enviar" }).click();

  await expect(
    page.getByText(
      "Por aqui só converso sobre café, queijo e vinho do Café Bourbon. Pergunte sobre um café, um queijo, um vinho ou uma harmonização — é nisso que a casa pode ajudar.",
    ),
  ).toBeVisible();
  await expect(page.getByText("Modo local:")).toHaveCount(0);
  expect(chatCalls).toBe(1);
});

test("produto citado na resposta é clicável e abre a ficha", async ({
  page,
}) => {
  await mockChat(page, {
    reply: "O Café do Brasil combina muito bem com chocolate meio amargo.",
    productSlugs: ["cafe-do-brasil"],
    productNames: { "cafe-do-brasil": "Café do Brasil" },
  });

  await page.goto("/barista");
  const input = page.getByRole("textbox", {
    name: "Pergunta sobre café, queijo ou vinho",
  });
  await input.fill("Qual café combina com chocolate?");
  await page.getByRole("button", { name: "Enviar" }).click();

  const link = page
    .locator("#conteudo")
    .getByRole("link", { name: /Café do Brasil/ });
  await expect(link).toBeVisible();
  await link.click();

  await expect(page).toHaveURL(/\/produtos\/cafe-do-brasil$/);
  await expect(page.getByRole("heading", { name: "Café do Brasil" })).toBeVisible();
});

test("multi-turno mostra quatro bolhas em ordem e limpa o input", async ({
  page,
}) => {
  const replies = [
    "Primeira resposta da casa.",
    "Segunda resposta da casa.",
  ];
  let call = 0;
  await page.route("**/api/chat", (route) => {
    const reply = replies[Math.min(call, replies.length - 1)] ?? replies[0];
    call += 1;
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        reply,
        productSlugs: [],
        productNames: {},
        pairingIds: [],
        degraded: false,
      }),
    });
  });

  await page.goto("/barista");
  const log = page.getByRole("log");
  const input = page.getByRole("textbox", {
    name: "Pergunta sobre café, queijo ou vinho",
  });

  await input.fill("Qual café combina com queijo?");
  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(input).toHaveValue("");
  await expect(log.locator(":scope > div")).toHaveCount(2);

  await input.fill("E com vinho tinto?");
  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(input).toHaveValue("");
  await expect(log.locator(":scope > div")).toHaveCount(4);

  const rows = await log.locator(":scope > div").allTextContents();
  expect(rows[0]).toContain("Qual café combina com queijo?");
  expect(rows[1]).toContain("Primeira resposta da casa.");
  expect(rows[2]).toContain("E com vinho tinto?");
  expect(rows[3]).toContain("Segunda resposta da casa.");
});

test("persona prevista fica visível enquanto a casa responde", async ({
  page,
}) => {
  await page.route("**/api/chat", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        reply: "Respondi sobre café.",
        productSlugs: [],
        productNames: {},
        pairingIds: [],
        degraded: false,
      }),
    });
  });

  await page.goto("/barista");
  const log = page.getByRole("log");
  await page
    .getByRole("textbox", { name: "Pergunta sobre café, queijo ou vinho" })
    .fill("Qual café combina com chocolate?");
  await page.getByRole("button", { name: "Enviar" }).click();

  await expect(log).toHaveAttribute("aria-busy", "true");
  await expect(
    log.getByRole("status").getByText("Lorenzo Giovanni está pensando..."),
  ).toBeVisible();

  await expect(log.getByText("Respondi sobre café.")).toBeVisible();
  await expect(log).toHaveAttribute("aria-busy", "false");
  await expect(log.getByRole("status")).toHaveCount(0);
});
