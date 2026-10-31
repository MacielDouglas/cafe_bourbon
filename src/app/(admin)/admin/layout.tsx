import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { requireOwner } from "@/infrastructure/auth/authorization";
import { AdminNav } from "@/modules/admin/presentation/admin-nav";

export const metadata: Metadata = {
  title: "Painel da casa",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireOwner();

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <a
        href="#conteudo-admin"
        className="sr-only z-50 rounded-lg bg-espresso px-4 py-2 text-sm font-medium text-creme outline-none focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus-visible:ring-2 focus-visible:ring-ring/60"
      >
        Pular para o conteúdo
      </a>
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 sm:px-6 lg:px-8">
          <Logo className="text-foreground" />
          <div className="hidden h-6 w-px bg-border sm:block" aria-hidden />
          <div>
            <h1 className="text-sm font-medium tracking-tight">
              Painel da casa
            </h1>
            <p className="text-xs text-muted-foreground">
              Conectado como {user.name} ({user.email})
            </p>
          </div>
          <Link
            href="/"
            className="ml-auto text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Ver loja
          </Link>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AdminNav />
        </div>
      </header>
      <main id="conteudo-admin" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
