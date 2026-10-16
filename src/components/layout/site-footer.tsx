import Link from "next/link";
import { CopyrightYear } from "@/components/layout/copyright-year";
import { Logo } from "@/components/layout/logo";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { categoryLinks, coffeeLinks } from "@/components/layout/navigation";

const helpLinks = [
  { label: "Nossa história", href: "/#historia" },
  { label: "Nosso processo", href: "/#processo" },
  { label: "Contato", href: "mailto:contato@bourboncafes.com" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div className="flex max-w-sm flex-col gap-5">
          <Logo className="text-foreground" />
          <p className="text-sm text-muted-foreground">
            Cafés especiais de origem única, queijos e vinhos — torrados e
            curados para harmonizar. Feito em Franca, São Paulo.
          </p>
          <div className="flex flex-col gap-3">
            <p className="text-[0.6875rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Receba os lançamentos
            </p>
            <NewsletterForm />
          </div>
        </div>

        <nav className="flex flex-col gap-4">
          <p className="text-[0.6875rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Cafés
          </p>
          <ul className="flex flex-col gap-2.5">
            {coffeeLinks.map((coffee) => (
              <li key={coffee.href}>
                <Link
                  href={coffee.href}
                  className="text-sm text-foreground/75 transition-colors hover:text-brand"
                >
                  {coffee.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="flex flex-col gap-4">
          <p className="text-[0.6875rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Categoria
          </p>
          <ul className="flex flex-col gap-2.5">
            <li>
              <Link
                href="/produtos"
                className="text-sm text-foreground/75 transition-colors hover:text-brand"
              >
                Todos os produtos
              </Link>
            </li>
            {categoryLinks.map((category) => (
              <li key={category.type}>
                <Link
                  href={category.href}
                  className="text-sm text-foreground/75 transition-colors hover:text-brand"
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="flex flex-col gap-4">
          <p className="text-[0.6875rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
            A Bourbon
          </p>
          <ul className="flex flex-col gap-2.5">
            {helpLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-foreground/75 transition-colors hover:text-brand"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
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
