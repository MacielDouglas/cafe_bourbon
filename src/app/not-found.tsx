import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main
        id="conteudo"
        className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start gap-4 px-4 py-24 sm:px-6"
      >
        <p className="text-sm font-medium tracking-[0.16em] text-brand uppercase">
          Página não encontrada
        </p>
        <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
          Esta página saiu da mesa.
        </h1>
        <p className="text-muted-foreground">
          O endereço pode ter mudado ou o item não está mais no catálogo. Você
          pode voltar ao início ou explorar todos os produtos.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-soft outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Voltar ao início
          </Link>
          <Link
            href="/produtos"
            className="inline-flex min-h-11 items-center rounded-full border border-border px-6 text-sm font-medium outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Ver catálogo
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
