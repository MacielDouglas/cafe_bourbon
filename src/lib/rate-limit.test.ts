import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("permite até o limite dentro da janela", () => {
    const key = "test:allow";

    expect(checkRateLimit(key, 2, 60_000)).toEqual({
      allowed: true,
      retryAfterMs: 0,
    });
    expect(checkRateLimit(key, 2, 60_000).allowed).toBe(true);
  });

  it("bloqueia acima do limite e informa a espera", () => {
    const key = "test:block";
    checkRateLimit(key, 1, 60_000);

    vi.advanceTimersByTime(15_000);
    const result = checkRateLimit(key, 1, 60_000);

    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBe(45_000);
  });

  it("libera a chave depois da janela", () => {
    const key = "test:reset";
    checkRateLimit(key, 1, 60_000);
    expect(checkRateLimit(key, 1, 60_000).allowed).toBe(false);

    vi.advanceTimersByTime(60_000);

    expect(checkRateLimit(key, 1, 60_000).allowed).toBe(true);
  });

  it("isola chaves diferentes", () => {
    expect(checkRateLimit("test:a", 1, 60_000).allowed).toBe(true);
    expect(checkRateLimit("test:b", 1, 60_000).allowed).toBe(true);
    expect(checkRateLimit("test:a", 1, 60_000).allowed).toBe(false);
  });
});
