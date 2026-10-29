"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MenuIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DemoBadge } from "@/components/demo-badge";
import { categoryLinks, coffeeLinks, primaryLinks } from "@/components/layout/navigation";
import { NavLink } from "@/components/layout/nav-link";

export function MobileMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = term.trim();
    setOpen(false);
    setTerm("");
    router.push(query ? `/produtos?busca=${encodeURIComponent(query)}` : "/produtos");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Abrir menu"
            className="size-11 sm:size-10"
          />
        }
      >
        <MenuIcon />
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="top-0 left-0 h-dvh w-full max-w-none translate-x-0 translate-y-0 content-start gap-6 overflow-y-auto rounded-none p-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:max-w-none"
      >
        <div className="flex items-center justify-between gap-4">
          <DialogTitle className="text-lg font-medium tracking-tight">
            Menu
          </DialogTitle>
          <DialogClose
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Fechar menu"
                className="size-11"
              />
            }
          >
            <XIcon />
          </DialogClose>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <Input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            placeholder="Buscar no catálogo..."
            aria-label="Termo de busca"
            className="h-11 sm:h-10"
          />
          <Button type="submit" className="h-11 sm:h-10">
            Ir
          </Button>
        </form>

        <nav aria-label="Menu principal" className="flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <p className="pb-2 text-[0.6875rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Coleções
            </p>
            {categoryLinks.map((category) => (
              <NavLink
                key={category.type}
                href={category.href}
                onClick={() => setOpen(false)}
                className="-mx-2 flex min-h-11 items-center gap-2 rounded-sm px-2 text-2xl font-medium text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
                activeClassName="text-brand"
              >
                {category.label}
                {category.type !== "COFFEE" && <DemoBadge />}
              </NavLink>
            ))}
            <NavLink
              href="/produtos"
              onClick={() => setOpen(false)}
              className="-mx-2 flex min-h-11 items-center rounded-sm px-2 text-2xl font-medium text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
              activeClassName="text-brand"
            >
              Ver tudo
            </NavLink>
            {primaryLinks.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="-mx-2 flex min-h-11 items-center rounded-sm px-2 text-2xl font-medium text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
                activeClassName="text-brand"
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <p className="pb-2 text-[0.6875rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Cafés de origem
            </p>
            {coffeeLinks.map((coffee) => (
              <NavLink
                key={coffee.href}
                href={coffee.href}
                onClick={() => setOpen(false)}
                className="-mx-2 flex min-h-11 items-center rounded-sm px-2 text-base text-foreground/75 transition-colors hover:bg-muted hover:text-foreground"
                activeClassName="font-medium text-brand"
              >
                {coffee.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </DialogContent>
    </Dialog>
  );
}
