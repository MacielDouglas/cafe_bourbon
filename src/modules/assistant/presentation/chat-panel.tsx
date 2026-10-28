"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  productSlugs: string[];
  productNames: Record<string, string>;
  degraded: boolean;
}

interface ChatResponse {
  reply: string;
  productSlugs: string[];
  productNames: Record<string, string>;
  pairingIds: string[];
  degraded: boolean;
}

const suggestions = [
  "Qual café combina com um queijo curado?",
  "Quero algo frutado e leve",
  "Sugira um vinho para acompanhar",
];

function humanizeSlug(slug: string): string {
  const minor = new Set(["de", "do", "da", "dos", "das", "e"]);
  return slug
    .split("-")
    .map((part, index) =>
      index > 0 && minor.has(part)
        ? part
        : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(" ");
}

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(message: string) {
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    setMessages((current) => [
      ...current,
      {
        role: "user",
        text: trimmed,
        productSlugs: [],
        productNames: {},
        degraded: false,
      },
    ]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      if (!response.ok) throw new Error("request failed");
      const data = (await response.json()) as ChatResponse;
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: data.reply,
          productSlugs: data.productSlugs,
          productNames: data.productNames ?? {},
          degraded: data.degraded,
        },
      ]);
    } catch {
      setError("O barista virtual não respondeu. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div
        role="log"
        aria-live="polite"
        aria-busy={loading}
        className="flex min-h-72 flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
      >
        {messages.length === 0 && (
          <p className="m-auto max-w-md text-center text-sm text-muted-foreground">
            Pergunte ao nosso barista virtual sobre cafés, queijos, vinhos e
            harmonizações. As sugestões usam o catálogo real da casa.
          </p>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex flex-col gap-2",
              message.role === "user" ? "items-end" : "items-start",
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                message.role === "user"
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-secondary text-secondary-foreground",
              )}
            >
              {message.text}
            </div>

            {message.role === "assistant" && message.degraded && (
              <span className="text-xs text-muted-foreground">
                Modo local: a IA está indisponível, então sugeri itens do
                catálogo.
              </span>
            )}

            {message.productSlugs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {message.productSlugs.map((slug) => (
                  <Link
                    key={slug}
                    href={`/produtos/${slug}`}
                    className="inline-flex min-h-9 items-center rounded-full border border-border px-4 text-xs text-foreground/75 outline-none transition-colors hover:border-foreground/40 hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring/60"
                  >
                    {message.productNames[slug] ?? humanizeSlug(slug)}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <span className="text-sm text-muted-foreground">Pensando...</span>
        )}
        {error && (
          <span role="alert" className="text-sm text-destructive">
            {error}
          </span>
        )}
      </div>

      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => send(suggestion)}
              className="inline-flex min-h-9 items-center rounded-full border border-border bg-card px-4 text-left text-xs text-foreground/70 outline-none transition-colors hover:border-foreground/40 hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void send(input);
        }}
        className="flex items-center gap-2"
      >
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Escreva sua pergunta..."
          aria-label="Pergunta para o barista virtual"
          maxLength={1000}
        />
        <Button type="submit" disabled={loading || input.trim().length === 0}>
          Enviar
        </Button>
      </form>
    </div>
  );
}
