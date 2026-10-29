"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRightIcon, SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "cn";
import {
  type AssistantPersona,
  resolveAssistantPersona,
} from "@/modules/assistant/domain/assistant-persona";
import { detectAssistantTopic } from "@/modules/assistant/domain/assistant-topic";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  productSlugs: string[];
  productNames: Record<string, string>;
  degraded: boolean;
  persona?: AssistantPersona;
}

interface ChatResponse {
  reply: string;
  productSlugs: string[];
  productNames: Record<string, string>;
  pairingIds: string[];
  degraded: boolean;
  persona?: AssistantPersona;
}

const suggestions = [
  "Qual a diferença entre coado e prensa?",
  "Como escolher um vinho para queijo curado?",
  "O que é um queijo maturado?",
  "Qual café combina com chocolate?",
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
  const [pendingPersona, setPendingPersona] = useState<AssistantPersona | null>(
    null,
  );

  async function send(message: string) {
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    const predictedPersona = resolveAssistantPersona(
      detectAssistantTopic(trimmed),
    );
    setPendingPersona(predictedPersona);
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
          persona: data.persona ?? predictedPersona,
        },
      ]);
    } catch {
      setError("A casa não conseguiu responder agora. Tente novamente em instantes.");
    } finally {
      setLoading(false);
      setPendingPersona(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div
        role="log"
        aria-live="polite"
        aria-busy={loading}
        className="flex min-h-80 flex-col gap-5 rounded-3xl border border-border bg-card p-5 shadow-soft sm:p-7"
      >
        {messages.length === 0 && (
          <div className="m-auto flex max-w-md flex-col items-center gap-3 text-center">
            <span
              className="flex size-12 items-center justify-center rounded-full bg-brand/10 text-lg font-medium text-brand"
              aria-hidden
            >
              B
            </span>
            <p className="text-xl font-medium tracking-tight sm:text-2xl">
              Qual é a sua dúvida?
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Pergunte sobre café, queijo, vinho e harmonizações. Lorenzo
              Giovanni responde sobre café, Jean Pierre sobre vinho e Chico da
              Dona Zezé sobre queijo.
            </p>
          </div>
        )}

        {messages.map((message, index) => {
          const persona =
            message.role === "assistant"
              ? message.persona ?? resolveAssistantPersona("GENERAL")
              : null;
          return (
            <div
              key={index}
              className={cn(
                "home-pairing-in flex gap-3",
                message.role === "user" ? "justify-end" : "items-start",
              )}
            >
              {persona && (
                <span
                  className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-medium text-brand"
                  aria-hidden
                >
                  {persona.initials}
                </span>
              )}
              <div
                className={cn(
                  "flex max-w-[85%] flex-col gap-2",
                  message.role === "user" ? "items-end" : "items-start",
                )}
              >
                {persona && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {persona.name} · {persona.role}
                  </span>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    message.role === "user"
                      ? "rounded-tr-md bg-primary text-primary-foreground shadow-soft"
                      : "rounded-tl-md bg-secondary text-secondary-foreground",
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
                        className="group inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border px-4 text-xs text-foreground/75 outline-none transition-colors hover:border-foreground/40 hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring/60"
                      >
                        {message.productNames[slug] ?? humanizeSlug(slug)}
                        <ArrowUpRightIcon
                          className="size-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && pendingPersona && (
          <div className="home-pairing-in flex gap-3">
            <span
              className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-medium text-brand"
              aria-hidden
            >
              {pendingPersona.initials}
            </span>
            <div
              role="status"
              className="flex flex-col gap-1.5 rounded-2xl rounded-tl-md bg-secondary px-4 py-3"
            >
              <span className="text-xs text-muted-foreground">
                {pendingPersona.thinking}
              </span>
              <span className="flex items-center gap-1" aria-hidden>
                <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:-300ms]" />
                <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:-150ms]" />
                <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground" />
              </span>
            </div>
          </div>
        )}
        {error && (
          <span role="alert" className="text-sm text-destructive">
            {error}
          </span>
        )}
      </div>

      {messages.length === 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium">Comece por aqui</p>
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
          placeholder="Pergunte sobre café, queijo ou vinho..."
          aria-label="Pergunta sobre café, queijo ou vinho"
          autoComplete="off"
          maxLength={1000}
        />
        <Button
          type="submit"
          disabled={loading || input.trim().length === 0}
          className="shrink-0 gap-2"
        >
          <SendIcon className="size-4" aria-hidden />
          Enviar
        </Button>
      </form>
    </div>
  );
}
