"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CART_UPDATED_EVENT } from "@/lib/auth-client";

export function CartIndicator() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function refresh() {
      try {
        const response = await fetch("/api/cart", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as { totalQuantity: number };
        if (active) setCount(data.totalQuantity);
      } catch {
        // silencioso: contador é apenas indicativo
      }
    }

    void refresh();
    const handler = () => void refresh();
    window.addEventListener(CART_UPDATED_EVENT, handler);
    return () => {
      active = false;
      window.removeEventListener(CART_UPDATED_EVENT, handler);
    };
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={count > 0 ? `Carrinho (${count} itens)` : "Carrinho"}
      render={<Link href="/carrinho" />}
      className="relative"
    >
      <ShoppingBagIcon />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-brand text-[0.625rem] font-medium text-brand-foreground tabular-nums">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Button>
  );
}
