import Image from "next/image";
import Link from "next/link";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "cn";
import { categoryLinks, coffeeLinks } from "@/components/layout/navigation";
import { NavLink } from "@/components/layout/nav-link";

export function MegaMenu({ className }: { className?: string }) {
  return (
    <div className={cn("group relative", className)}>
      <NavLink
        href="/produtos"
        className="relative inline-flex items-center gap-1 py-2 text-sm text-foreground/70 transition-colors hover:text-foreground group-hover:text-foreground"
        activeClassName="font-medium text-brand after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-brand"
      >
        Catálogo
        <ChevronDownIcon className="size-3.5 transition-transform duration-200 group-hover:rotate-180" />
      </NavLink>

      <div className="invisible absolute top-full left-1/2 z-50 w-[min(56rem,90vw)] -translate-x-1/2 pt-3 opacity-0 transition-all duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        <div className="grid grid-cols-[1.4fr_1fr_1.1fr] gap-8 rounded-2xl border border-border bg-popover p-8 text-popover-foreground shadow-lift">
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
                    <span className="block text-base font-medium transition-colors group-hover/item:text-brand">
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
                className="object-cover transition-transform duration-500 group-hover/promo:scale-105"
              />
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
