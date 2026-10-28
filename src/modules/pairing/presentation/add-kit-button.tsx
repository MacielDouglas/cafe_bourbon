"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBagIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { notifyCartUpdated } from "@/lib/auth-client";
import { HARMONIZATION_KIT_DISCOUNT_PERCENT } from "@/modules/shared/domain/harmonization-kit";

export function AddKitButton({
  productIds,
  kitName,
  disabled,
}: {
  productIds: string[];
  kitName: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    setLoading(true);
    try {
      const response = await fetch("/api/cart/kit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        toast.error(data?.error ?? "Não foi possível adicionar o kit.");
        return;
      }

      const data = (await response.json()) as { totalQuantity: number };
      notifyCartUpdated();
      router.refresh();
      toast.success("Kit adicionado ao carrinho", {
        description: `${kitName} · ${data.totalQuantity} item(ns) · ${HARMONIZATION_KIT_DISCOUNT_PERCENT}% de desconto aplicado.`,
        action: {
          label: "Ver carrinho",
          onClick: () => router.push("/carrinho"),
        },
      });
    } catch {
      toast.error("Não foi possível adicionar o kit. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleAdd}
      disabled={disabled || loading}
      className="w-full sm:w-auto"
    >
      <ShoppingBagIcon />
      {loading ? "Adicionando..." : "Adicionar kit"}
    </Button>
  );
}
