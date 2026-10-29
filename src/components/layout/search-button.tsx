"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function SearchButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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
            aria-label="Buscar produtos"
            className="size-11 sm:size-10"
          />
        }
      >
        <SearchIcon />
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buscar</DialogTitle>
          <DialogDescription>
            Encontre cafés, queijos e vinhos pelo nome ou pelas notas.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            autoFocus
            name="busca"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Ex.: café do brasil, tanino..."
            aria-label="Termo de busca"
            className="h-11 sm:h-10"
          />
          <Button type="submit" className="h-11 sm:h-10">
            Ir
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
