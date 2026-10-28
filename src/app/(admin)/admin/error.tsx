"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] erro inesperado:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-card px-6 py-10 shadow-soft">
      <h2 className="text-xl font-medium">Não foi possível carregar o painel</h2>
      <p className="max-w-lg text-sm text-muted-foreground">
        Ocorreu uma falha ao buscar os dados. Tente novamente; se persistir,
        verifique a conexão com o banco.
      </p>
      <Button onClick={reset} className="mt-2">
        Tentar novamente
      </Button>
    </div>
  );
}
