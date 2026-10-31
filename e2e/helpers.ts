import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

export interface A11yViolation {
  id: string;
  impact: string | null | undefined;
  help: string;
  nodes: string[];
}

export async function analyzeA11y(page: Page): Promise<A11yViolation[]> {
  await page.addStyleTag({
    content: `*, *::before, *::after {
      animation: none !important;
      transition: none !important;
    }`,
  });

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
    .analyze();

  return results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.slice(0, 3).map((node) => node.target.join(" ")),
  }));
}

export async function expectNoA11yViolations(page: Page): Promise<void> {
  const violations = await analyzeA11y(page);
  const report = violations
    .map(
      (violation) =>
        `[${violation.impact ?? "sem impacto"}] ${violation.id}: ${violation.help}\n    nós: ${violation.nodes.join(" | ")}`,
    )
    .join("\n");

  expect(violations, `Violações de acessibilidade:\n${report}`).toEqual([]);
}

export async function failApi(
  page: Page,
  pathname: string,
  status: number,
  body: Record<string, unknown>,
  method?: string,
): Promise<void> {
  await page.route(`**${pathname}*`, (route) => {
    if (method && route.request().method() !== method) {
      return route.continue();
    }
    return route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
}

export const owner = {
  email: "coffeemen@coffee.com",
  password: "teste1234",
};

export const DEMO_COFFEE = {
  slug: "cafe-do-brasil",
  name: "Café do Brasil",
};

export function trackPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

export function toast(page: Page, text: string | RegExp) {
  return page.locator("[data-sonner-toast]").filter({ hasText: text }).first();
}

export function credentialsEmail(page: Page) {
  return page.getByRole("textbox", { name: "E-mail", exact: true });
}

export function credentialsPassword(page: Page) {
  return page.locator('input[name="password"]');
}

export function credentialsSubmit(page: Page) {
  return page
    .locator("form")
    .filter({ has: credentialsEmail(page) })
    .getByRole("button", { name: "Entrar", exact: true });
}

export async function login(
  page: Page,
  redirectTo = "/assinatura",
): Promise<void> {
  await page.goto(`/entrar?redirect=${encodeURIComponent(redirectTo)}`);
  await credentialsEmail(page).fill(owner.email);
  await credentialsPassword(page).fill(owner.password);
  await credentialsSubmit(page).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/entrar"));
}

export async function signUp(
  page: Page,
  email: string,
  name = "Cliente E2E",
  password = "senha-segura-123",
): Promise<void> {
  await page.goto("/criar-conta");
  await page.locator('input[name="name"]').fill(name);
  await credentialsEmail(page).fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page).not.toHaveURL(/\/criar-conta/);
}

export async function clearCart(page: Page): Promise<void> {
  await page.goto("/carrinho");
  const empty = page.getByText("Seu carrinho está vazio");
  const summary = page.getByRole("heading", { name: "Resumo" });
  await expect(empty.or(summary).first()).toBeVisible();

  if (await summary.isVisible()) {
    await page.getByRole("button", { name: "Esvaziar carrinho" }).click();
    await expect(empty).toBeVisible();
  }
}

export async function addToCart(
  page: Page,
  slug: string,
  name: string,
): Promise<void> {
  await page.goto(`/produtos/${slug}`);
  await page.getByRole("button", { name: "Adicionar ao carrinho" }).click();
  await expect(toast(page, "Adicionado ao carrinho")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Carrinho \d+/ }),
  ).toBeVisible();
  await expect(page.locator("main").getByText(name).first()).toBeVisible();
}

export interface ChatFixture {
  reply: string;
  productSlugs?: string[];
  productNames?: Record<string, string>;
  pairingIds?: string[];
  degraded?: boolean;
}

export async function mockChat(page: Page, fixture: ChatFixture): Promise<void> {
  await page.route("**/api/chat", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        productSlugs: [],
        productNames: {},
        pairingIds: [],
        degraded: false,
        ...fixture,
      }),
    }),
  );
}

export async function failChat(page: Page): Promise<void> {
  await page.route("**/api/chat", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "O assistente está indisponível agora." }),
    }),
  );
}

export interface RecommendationFixture {
  fallback: boolean;
  reason: string | null;
  recommendations: {
    slug: string;
    name: string;
    type: string;
    typeLabel: string;
    subtitle: string;
    priceCents: number | null;
    isDemoData: boolean;
    score: number;
    tier: "experimental" | "moderada" | "boa" | "excelente";
    reason: string;
  }[];
}

export async function mockRecommendations(
  page: Page,
  fixture: RecommendationFixture,
  onRequest?: (body: unknown) => void,
): Promise<void> {
  await page.route("**/api/recommendations", async (route) => {
    onRequest?.(route.request().postDataJSON());
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(fixture),
    });
  });
}

export async function failRecommendations(page: Page): Promise<void> {
  await page.route("**/api/recommendations", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Não foi possível gerar recomendações." }),
    }),
  );
}

export async function selectOption(
  page: Page,
  triggerName: string,
  optionName: string,
): Promise<void> {
  await page.getByRole("combobox", { name: triggerName }).click();
  await page.getByRole("option", { name: optionName }).click();
}
