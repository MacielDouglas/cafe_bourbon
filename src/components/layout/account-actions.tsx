"use client";

import { ShoppingBagIcon, UserIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function soon(label: string) {
  toast.info(`${label} chega em breve.`, {
    description: "Estamos finalizando login e carrinho demonstrativo.",
  });
}

export function AccountActions() {
  return (
    <div className="flex items-center gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Minha conta"
        onClick={() => soon("A área da conta")}
      >
        <UserIcon />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Carrinho"
        onClick={() => soon("O carrinho")}
      >
        <ShoppingBagIcon />
      </Button>
    </div>
  );
}
