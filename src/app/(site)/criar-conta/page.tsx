import Link from "next/link";
import { CredentialsForm } from "@/components/auth/credentials-form";
import { safeRedirectPath } from "@/lib/safe-redirect";

export const instant = false;

export const metadata = {
  title: "Criar conta",
  description: "Crie sua conta Café Bourbon e comece a assinar cafés de origem única.",
};

export default async function CriarContaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const redirectTo = safeRedirectPath((await searchParams).redirect, "/assinatura");

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 px-4 py-20 sm:px-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-medium tracking-tight">Criar conta</h1>
        <p className="text-sm text-muted-foreground">
          Leva um minuto. Depois você escolhe o plano e o café do mês.
        </p>
      </header>

      <CredentialsForm mode="sign-up" redirectTo={redirectTo} />

      <p className="text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link
          href={`/entrar?redirect=${encodeURIComponent(redirectTo)}`}
          className="rounded-sm font-medium text-brand underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
