import Link from "next/link";
import { CredentialsForm } from "@/components/auth/credentials-form";

export const metadata = {
  title: "Criar conta",
  description: "Crie sua conta Café Bourbon e comece a assinar cafés de origem única.",
};

export default function CriarContaPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 px-4 py-20 sm:px-6">
      <header className="flex flex-col gap-3">
        <span className="text-[0.6875rem] font-medium tracking-[0.18em] text-brand uppercase">
          Minha conta
        </span>
        <h1 className="text-3xl font-medium tracking-tight">Criar conta</h1>
        <p className="text-sm text-muted-foreground">
          Leva um minuto. Depois você escolhe o plano e o café do mês.
        </p>
      </header>

      <CredentialsForm mode="sign-up" redirectTo="/assinatura" />

      <p className="text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link
          href="/entrar"
          className="font-medium text-brand underline-offset-4 hover:underline"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
