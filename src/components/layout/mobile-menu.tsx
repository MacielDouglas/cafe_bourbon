"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { categoryLinks, coffeeLinks } from "@/components/layout/navigation";

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
        render={<Button variant="ghost" size="icon" aria-label="Abrir menu" />}
      >
        <MenuIcon />
      </DialogTrigger>
      <DialogContent className="top-0 left-0 h-dvh w-full max-w-none translate-x-0 translate-y-0 content-start gap-8 overflow-y-auto rounded-none p-6 sm:max-w-none">
        <DialogTitle className="sr-only">Menu</DialogTitle>
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <Input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Buscar no catálogo..."
            aria-label="Termo de busca"
          />
          <Button type="submit">Ir</Button>
        </form>

        <nav className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <p className="text-[0.6875rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Coleções
            </p>
            {categoryLinks.map((category) => (
              <Link
                key={category.type}
                href={category.href}
                onClick={() => setOpen(false)}
                className="text-2xl font-medium"
              >
                {category.label}
              </Link>
            ))}
            <Link
              href="/produtos"
              onClick={() => setOpen(false)}
              className="text-2xl font-medium"
            >
              Ver tudo
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[0.6875rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Cafés de origem
            </p>
            {coffeeLinks.map((coffee) => (
              <Link
                key={coffee.href}
                href={coffee.href}
                onClick={() => setOpen(false)}
                className="text-base text-foreground/75"
              >
                {coffee.label}
              </Link>
            ))}
          </div>
        </nav>
      </DialogContent>
    </Dialog>
  );
}
