"use client";

import { useRef, useState } from "react";
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
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const isSignUp = mode === "sign-up";

  function showError(message: string) {
    setFormError(message);
    formRef.current?.querySelector<HTMLInputElement>("input")?.focus();
  }

  function translateAuthError(message: string | undefined): string {
    const normalized = message?.toLowerCase() ?? "";
    if (/invalid email or password|incorrect password/.test(normalized)) {
      return "E-mail ou senha incorretos.";
    }
    if (/already (exists|registered)|user exists/.test(normalized)) {
      return "Já existe uma conta com este e-mail.";
    }
    if (/password/.test(normalized)) {
      return "A senha precisa ter pelo menos 8 caracteres.";
    }
    if (/email/.test(normalized)) {
      return "Confira o e-mail informado.";
    }
    return "Não foi possível continuar. Tente novamente.";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
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
        showError(translateAuthError(result.error.message));
        return;
      }

      toast.success(isSignUp ? "Conta criada" : "Bem-vindo de volta");
      router.push(redirectTo);
      router.refresh();
    } catch {
      showError("Não foi possível continuar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-soft"
    >
      {formError && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {formError}
        </p>
      )}

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
          aria-describedby="password-hint"
        />
        <span id="password-hint" className="text-xs text-muted-foreground">
          Mínimo de 8 caracteres.
        </span>
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
