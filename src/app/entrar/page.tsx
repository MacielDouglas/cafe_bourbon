import Link from "next/link";
import { CredentialsForm } from "@/components/auth/credentials-form";

export const metadata = {
  title: "Entrar",
  description: "Acesse sua conta Café Bourbon para acompanhar assinaturas.",
};

export default function EntrarPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 px-4 py-20 sm:px-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-medium tracking-tight">Entrar</h1>
        <p className="text-sm text-muted-foreground">
          Acesse para gerenciar suas assinaturas de café.
        </p>
      </header>

      <CredentialsForm mode="sign-in" redirectTo="/assinatura" />

      <p className="text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link
          href="/criar-conta"
          className="rounded-sm font-medium text-brand underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          Criar conta
        </Link>
      </p>
    </div>
  );
}
