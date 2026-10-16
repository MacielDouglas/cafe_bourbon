import Image from "next/image";
import Link from "next/link";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "cn";
import { categoryLinks, coffeeLinks } from "@/components/layout/navigation";

export function MegaMenu({ className }: { className?: string }) {
  return (
    <div className={cn("group relative", className)}>
      <Link
        href="/produtos"
        className="inline-flex items-center gap-1 py-2 text-sm text-foreground/70 transition-colors hover:text-foreground group-hover:text-foreground"
      >
        Catálogo
        <ChevronDownIcon className="size-3.5 transition-transform duration-200 group-hover:rotate-180" />
      </Link>

      <div className="invisible absolute top-full left-1/2 z-50 w-[min(56rem,90vw)] -translate-x-1/2 pt-3 opacity-0 transition-all duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        <div className="grid grid-cols-[1.4fr_1fr_1.1fr] gap-8 rounded-xl border border-border bg-popover p-7 text-popover-foreground shadow-xl">
          <div className="flex flex-col gap-5">
            <p className="text-[0.6875rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Coleções
            </p>
            <ul className="flex flex-col gap-4">
              {categoryLinks.map((category) => (
                <li key={category.type}>
                  <Link href={category.href} className="group/item block">
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
                    className="text-sm text-foreground/75 transition-colors hover:text-brand"
                  >
                    {coffee.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/produtos?tipo=COFFEE"
            className="group/promo flex flex-col gap-3"
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
