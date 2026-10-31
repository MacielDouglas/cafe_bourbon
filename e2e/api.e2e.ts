import { expect, test } from "@playwright/test";

function uniqueIp(): string {
  const octet = Math.floor(Math.random() * 200) + 10;
  return `198.51.100.${octet}`;
}

test("GET /api/cart devolve um resumo válido", async ({ request }) => {
  const response = await request.get("/api/cart");

  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as {
    lines: unknown[];
    totalQuantity: number;
    totalCents: number;
  };
  expect(Array.isArray(body.lines)).toBe(true);
  expect(body.totalQuantity).toBeGreaterThanOrEqual(0);
  expect(body.totalCents).toBeGreaterThanOrEqual(0);
});

test("POST /api/cart rejeita payload inválido", async ({ request }) => {
  const response = await request.post("/api/cart", {
    data: { productId: "", quantity: 0 },
  });

  expect(response.status()).toBe(400);
  await expect(response.json()).resolves.toMatchObject({
    error: "Payload inválido.",
  });
});

test("POST /api/chat valida a mensagem", async ({ request }) => {
  const response = await request.post("/api/chat", {
    data: { message: "" },
    headers: { "x-forwarded-for": uniqueIp() },
  });

  expect(response.status()).toBe(400);
  await expect(response.json()).resolves.toMatchObject({
    error: "Mensagem inválida (1 a 1000 caracteres).",
  });
});

test("POST /api/chat limita abuso por IP", async ({ request }) => {
  const ip = uniqueIp();
  const statuses: number[] = [];

  for (let index = 0; index < 11; index += 1) {
    const response = await request.post("/api/chat", {
      data: { message: "" },
      headers: { "x-forwarded-for": ip },
    });
    statuses.push(response.status());
    if (index === 10) {
      expect(response.headers()["retry-after"]).toBeTruthy();
    }
  }

  expect(statuses.slice(0, 10)).toEqual(Array(10).fill(400));
  expect(statuses[10]).toBe(429);
});

test("checkout e assinatura exigem sessão", async ({ request }) => {
  const checkout = await request.post("/api/checkout");
  expect(checkout.status()).toBe(401);
  await expect(checkout.json()).resolves.toMatchObject({
    error: "Entre na sua conta para finalizar o pedido.",
  });

  const subscription = await request.post("/api/subscription", {
    data: {
      plan: "MENSAL",
      grind: "GRAOS",
      brewMethod: null,
      coffeeId: "cafe-do-brasil",
    },
  });
  expect(subscription.status()).toBe(401);
  await expect(subscription.json()).resolves.toMatchObject({
    error: "Faça login para assinar um plano.",
  });
});

test("API do admin bloqueia visitantes", async ({ request }) => {
  const response = await request.patch("/api/admin/products/qualquer", {
    data: { stock: 1 },
  });

  expect(response.status()).toBe(401);
  await expect(response.json()).resolves.toMatchObject({
    error: "Autenticação necessária.",
  });
});

test("GET /api/recommendations rejeita perfil inválido", async ({ request }) => {
  const response = await request.post("/api/recommendations", {
    data: { intensity: 9 },
  });

  expect(response.status()).toBe(400);
  await expect(response.json()).resolves.toMatchObject({
    error: "Perfil de paladar inválido.",
  });
});

test("área do admin redireciona visitantes para o login", async ({
  request,
}) => {
  const response = await request.get("/admin", { maxRedirects: 0 });

  expect([302, 303, 307, 308]).toContain(response.status());
  expect(response.headers()["location"]).toContain("/entrar");
});

test("slug inexistente mostra a página de produto não encontrado", async ({
  request,
}) => {
  const response = await request.get("/produtos/nao-existe");

  expect([200, 404]).toContain(response.status());
  const html = await response.text();
  expect(html).toContain("Produto não encontrado");
  expect(html).toContain("noindex");
});
