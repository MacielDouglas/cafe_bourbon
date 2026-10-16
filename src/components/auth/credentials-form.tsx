"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export function CredentialsForm({
  mode,
  redirectTo = "/",
}: {
  mode: "sign-in" | "sign-up";
  redirectTo?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isSignUp = mode === "sign-up";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();

    setLoading(true);
    try {
      const result = isSignUp
        ? await authClient.signUp.email({ name, email, password })
        : await authClient.signIn.email({ email, password });

      if (result.error) {
        toast.error(result.error.message ?? "Não foi possível continuar.");
        return;
      }

      toast.success(isSignUp ? "Conta criada" : "Bem-vindo de volta");
      router.push(redirectTo);
      router.refresh();
    } catch {
      toast.error("Não foi possível continuar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {isSignUp && (
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Nome</span>
          <Input name="name" autoComplete="name" required minLength={2} />
        </label>
      )}

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">E-mail</span>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="voce@exemplo.com"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">Senha</span>
        <Input
          name="password"
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          required
          minLength={8}
          placeholder="Mínimo de 8 caracteres"
        />
      </label>

      <Button type="submit" size="lg" disabled={loading}>
        {loading
          ? "Aguarde..."
          : isSignUp
            ? "Criar conta"
            : "Entrar"}
      </Button>
    </form>
  );
}
