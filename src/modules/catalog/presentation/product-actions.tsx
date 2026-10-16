"use client";

import { ShoppingBagIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ProductActions({
  productName,
  purchasable,
}: {
  productName: string;
  purchasable: boolean;
}) {
  if (!purchasable) {
    return (
      <Button size="lg" disabled className="w-full sm:w-auto">
        Indisponível
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      className="w-full sm:w-auto"
      onClick={() =>
        toast.info("Carrinho em breve", {
          description: `“${productName}” entra no carrinho demonstrativo na fase de commerce.`,
        })
      }
    >
      <ShoppingBagIcon />
      Adicionar ao carrinho
    </Button>
  );
}
