import Link from "next/link";
import { ArrowUpIcon } from "lucide-react";
import { CopyrightYear } from "@/components/layout/copyright-year";
import { Logo } from "@/components/layout/logo";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { categoryLinks, coffeeLinks } from "@/components/layout/navigation";

const helpLinks = [
  { label: "Nossa história", href: "/#historia" },
  { label: "Nosso processo", href: "/#processo" },
  { label: "Descobrir seu paladar", href: "/descobrir" },
  { label: "Barista virtual", href: "/barista" },
  { label: "Assinatura de café", href: "/assinatura" },
  { label: "Carrinho", href: "/carrinho" },
  { label: "Contato", href: "mailto:contato@bourboncafes.com" },
];

const footerLink =
  "relative inline-flex min-h-9 items-center rounded-sm text-sm text-foreground/75 outline-none transition-colors after:absolute after:inset-x-0 after:bottom-1.5 after:h-px after:origin-left after:scale-x-0 after:bg-brand after:transition-transform after:duration-300 hover:text-brand hover:after:scale-x-100 focus-visible:ring-2 focus-visible:ring-ring/60";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
          <div className="flex max-w-xl flex-col gap-6">
            <Logo className="text-foreground" />
            <p className="text-3xl leading-tight font-medium tracking-tight text-balance sm:text-4xl">
              A mesa continua aberta.
            </p>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Cafés especiais de origem única, queijos e vinhos — torrados e
              curados para harmonizar. Feito em Franca, São Paulo.
            </p>
            <div className="flex flex-col gap-3 pt-2">
              <p className="text-[0.6875rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                Receba os lançamentos
              </p>
              <NewsletterForm />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <nav className="flex flex-col gap-4" aria-label="Cafés">
              <p className="text-[0.6875rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                Cafés
              </p>
              <ul className="flex flex-col gap-0.5">
                {coffeeLinks.map((coffee) => (
                  <li key={coffee.href}>
                    <Link href={coffee.href} className={footerLink}>
                      {coffee.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav className="flex flex-col gap-4" aria-label="Catálogo">
              <p className="text-[0.6875rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                Catálogo
              </p>
              <ul className="flex flex-col gap-0.5">
                <li>
                  <Link href="/produtos" className={footerLink}>
                    Todos os produtos
                  </Link>
                </li>
                <li>
                  <Link href="/harmonizacoes" className={footerLink}>
                    Harmonizações
                  </Link>
                </li>
                {categoryLinks.map((category) => (
                  <li key={category.type}>
                    <Link href={category.href} className={footerLink}>
                      {category.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav
              className="col-span-2 flex flex-col gap-4 sm:col-span-1"
              aria-label="A Bourbon"
            >
              <p className="text-[0.6875rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                A Bourbon
              </p>
              <ul className="flex flex-col gap-0.5">
                {helpLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={footerLink}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.6875rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Café Bourbon · Franca, SP
          </p>
          <Link
            href="#conteudo"
            className="group inline-flex min-h-9 w-fit items-center gap-2 rounded-sm text-sm font-medium text-foreground/75 outline-none transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-ring/60"
          >
            Voltar ao topo
            <ArrowUpIcon className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© <CopyrightYear /> Café Bourbon. Todos os direitos reservados.</p>
          <p>Feito com café, queijo e vinho.</p>
        </div>
      </div>
    </footer>
  );
}
