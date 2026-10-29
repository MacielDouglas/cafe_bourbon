"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] erro inesperado:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-start justify-center gap-4 px-4 py-24 sm:px-6">
      <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
        Não conseguimos carregar esta página.
      </h1>
      <p className="text-muted-foreground">
        Pode ser uma falha momentânea. Tente recarregar; se continuar, volte ao
        início e tente de novo em instantes.
      </p>
      <div className="mt-2 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-soft outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Tentar novamente
        </button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-full border border-border px-6 text-sm font-medium outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
