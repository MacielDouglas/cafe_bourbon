import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "cn";
import { categoryLinks, coffeeLinks } from "@/components/layout/navigation";
import { NavLink } from "@/components/layout/nav-link";

export function MegaMenu({ className }: { className?: string }) {
  return (
    <div className={cn("group relative", className)}>
      <NavLink
        href="/produtos"
        className="relative inline-flex items-center gap-1 py-2 text-sm text-foreground/70 transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:rounded-full after:bg-brand after:transition-transform after:duration-300 hover:text-foreground hover:after:scale-x-100 group-hover:text-foreground"
        activeClassName="font-medium text-brand hover:text-brand after:h-0.5 after:scale-x-100"
      >
        Catálogo
        <ChevronDownIcon className="size-3.5 transition-transform duration-300 group-hover:rotate-180" />
      </NavLink>

      <div className="invisible absolute top-full left-0 z-50 w-[min(56rem,calc(100vw-16rem))] translate-y-1 pt-3 opacity-0 transition-[opacity,transform] duration-200 ease-[var(--ease-out-soft)] group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <div className="grid max-h-[calc(100dvh-7rem)] grid-cols-[1.4fr_1fr_1.1fr] gap-8 overflow-y-auto rounded-2xl border border-border bg-popover p-8 text-popover-foreground shadow-lift">
          <div className="flex flex-col gap-5">
            <p className="text-[0.6875rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Coleções
            </p>
            <ul className="flex flex-col gap-4">
              {categoryLinks.map((category) => (
                <li key={category.type}>
                  <Link
                    href={category.href}
                    className="group/item block rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                  >
                    <span className="flex items-center gap-2 text-base font-medium transition-colors group-hover/item:text-brand">
                      {category.label}
                      
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {category.blurb}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-5">
            <p className="text-[0.6875rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Cafés de origem
            </p>
            <ul className="flex flex-col gap-2.5">
              {coffeeLinks.map((coffee) => (
                <li key={coffee.href}>
                  <Link
                    href={coffee.href}
                    className="inline-flex min-h-9 items-center rounded-sm text-sm text-foreground/75 outline-none transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-ring/60"
                  >
                    {coffee.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/produtos?tipo=COFFEE"
            className="group/promo flex flex-col gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-4 focus-visible:ring-offset-popover"
          >
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg bg-muted">
              <Image
                src="/images/cafes/cafe-do-brasil.jpg"
                alt="Grãos de café do Brasil"
                fill
                sizes="(min-width: 768px) 280px, 0px"
                className="object-cover transition-transform duration-700 ease-out group-hover/promo:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-espresso/60 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-creme px-3 py-1.5 text-xs font-medium text-foreground shadow-soft">
                Ver café
                <ArrowUpRightIcon className="size-3.5 transition-transform duration-300 group-hover/promo:-translate-y-0.5 group-hover/promo:translate-x-0.5" />
              </span>
            </div>
            <span className="text-sm font-medium">
              Doçura e corpo aveludado
            </span>
            <span className="text-sm text-muted-foreground">
              O carro-chefe Bourbon, torrado toda semana.
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
