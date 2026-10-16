"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBagIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { notifyCartUpdated } from "@/lib/auth-client";

export function ProductActions({
  productId,
  productName,
  purchasable,
}: {
  productId: string;
  productName: string;
  purchasable: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!purchasable) {
    return (
      <Button size="lg" disabled className="w-full sm:w-auto">
        Indisponível
      </Button>
    );
  }

  async function handleAdd() {
    setLoading(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (response.status === 422) {
        const data = (await response.json()) as { error?: string };
        toast.error(data.error ?? "Produto indisponível para compra.");
        return;
      }
      if (!response.ok) throw new Error("request failed");

      const data = (await response.json()) as { totalQuantity: number };
      notifyCartUpdated();
      toast.success("Adicionado ao carrinho", {
        description: `${productName} · ${data.totalQuantity} item(ns) no carrinho.`,
        action: { label: "Ver carrinho", onClick: () => router.push("/carrinho") },
      });
    } catch {
      toast.error("Não foi possível adicionar ao carrinho. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      size="lg"
      className="w-full sm:w-auto"
      onClick={handleAdd}
      disabled={loading}
    >
      <ShoppingBagIcon />
      {loading ? "Adicionando..." : "Adicionar ao carrinho"}
    </Button>
  );
}
