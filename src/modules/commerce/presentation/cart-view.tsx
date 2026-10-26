"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MinusIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCents } from "@/modules/catalog/presentation/format";
import { productTypeLabel } from "@/modules/catalog/presentation/labels";
import type { SerializedCart } from "@/modules/commerce/presentation/serialize";
import { notifyCartUpdated } from "@/lib/auth-client";

async function parseCart(response: Response): Promise<SerializedCart> {
  if (!response.ok) throw new Error("cart request failed");
  return (await response.json()) as SerializedCart;
}

function Thumb({
  imageUrl,
  name,
  type,
}: {
  imageUrl: string | null;
  name: string;
  type: keyof typeof productTypeLabel;
}) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        fill
        sizes="96px"
        unoptimized={imageUrl.startsWith("/api/media/")}
        className="object-cover"
      />
    );
  }
  return (
    <div className="flex size-full items-center justify-center bg-secondary">
      <span className="text-[0.625rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
        {productTypeLabel[type]}
      </span>
    </div>
  );
}

export function CartView({
  initialCart,
  isAuthenticated,
}: {
  initialCart: SerializedCart;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [cart, setCart] = useState(initialCart);
  const [pending, setPending] = useState<string | null>(null);

  async function send(
    key: string,
    path: string,
    init: RequestInit,
  ): Promise<void> {
    setPending(key);
    try {
      setCart(await parseCart(await fetch(path, init)));
      notifyCartUpdated();
    } catch {
      toast.error("Não foi possível atualizar o carrinho.");
    } finally {
      setPending(null);
    }
  }

  function setQuantity(productId: string, quantity: number) {
    return send(productId, "/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
  }

  function removeLine(productId: string) {
    return send(productId, `/api/cart?productId=${encodeURIComponent(productId)}`, {
      method: "DELETE",
    });
  }

  function clear() {
    return send("__all__", "/api/cart", { method: "DELETE" });
  }

  async function checkout() {
    if (!isAuthenticated) {
      toast.info("Entre na sua conta para finalizar o pedido.");
      router.push("/entrar");
      return;
    }

    setPending("__checkout__");
    try {
      const response = await fetch("/api/checkout", { method: "POST" });

      if (response.status === 401) {
        toast.info("Entre na sua conta para finalizar o pedido.");
        router.push("/entrar");
        return;
      }
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        toast.error(data?.error ?? "Não foi possível concluir o pedido.");
        return;
      }

      const data = (await response.json()) as {
        order: { id: string; totalCents: number; itemCount: number };
      };
      setCart({
        lines: [],
        totalQuantity: 0,
        totalCents: 0,
        totalLabel: formatCents(0),
      });
      notifyCartUpdated();
      toast.success("Pedido demonstrativo confirmado", {
        description: `Pedido ${data.order.id.slice(-6)} · ${data.order.itemCount} item(ns) · ${formatCents(data.order.totalCents)}`,
      });
      router.refresh();
    } catch {
      toast.error("Não foi possível concluir o pedido.");
    } finally {
      setPending(null);
    }
  }

  if (cart.lines.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-xl border border-dashed border-border px-8 py-16 sm:items-center sm:text-center">
        <h2 className="text-xl font-medium">Seu carrinho está vazio</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Explore o catálogo de cafés, queijos e vinhos e monte sua mesa.
        </p>
        <Button nativeButton={false} render={<Link href="/produtos" />}>
          Ver o catálogo
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
      <ul className="flex flex-col divide-y divide-border">
        {cart.lines.map((line) => (
          <li key={line.productId} className="flex gap-4 py-5">
            <Link
              href={`/produtos/${line.slug}`}
              className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/5"
            >
              <Thumb imageUrl={line.imageUrl} name={line.name} type={line.type} />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-col">
                  <span className="text-[0.625rem] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                    {productTypeLabel[line.type]}
                  </span>
                  <Link
                    href={`/produtos/${line.slug}`}
                    className="truncate font-medium transition-colors hover:text-brand"
                  >
                    {line.name}
                  </Link>
                  <span className="text-sm text-muted-foreground">
                    {line.priceLabel} cada
                  </span>
                </div>
                <span className="shrink-0 font-medium tabular-nums">
                  {line.subtotalLabel}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-lg border border-border">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Diminuir ${line.name}`}
                    disabled={pending === line.productId}
                    onClick={() => setQuantity(line.productId, line.quantity - 1)}
                  >
                    <MinusIcon />
                  </Button>
                  <span className="w-8 text-center text-sm tabular-nums">
                    {line.quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Aumentar ${line.name}`}
                    disabled={pending === line.productId || line.quantity >= 99}
                    onClick={() => setQuantity(line.productId, line.quantity + 1)}
                  >
                    <PlusIcon />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  disabled={pending === line.productId}
                  onClick={() => removeLine(line.productId)}
                >
                  <Trash2Icon />
                  Remover
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="flex h-fit flex-col gap-5 rounded-xl border border-border p-6">
        <h2 className="text-lg font-medium">Resumo</h2>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Itens</span>
          <span className="tabular-nums">{cart.totalQuantity}</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="font-medium">Total</span>
          <span className="text-xl font-medium tabular-nums">
            {cart.totalLabel}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Carrinho demonstrativo — preços calculados no servidor. O checkout não
          realiza pagamento nesta versão.
        </p>
        <Button
          size="lg"
          onClick={() => void checkout()}
          disabled={pending !== null}
        >
          {pending === "__checkout__"
            ? "Confirmando..."
            : "Finalizar pedido (demonstrativo)"}
        </Button>
        <Button variant="ghost" size="sm" onClick={clear} disabled={pending !== null}>
          Esvaziar carrinho
        </Button>
        {cart.lines.some((line) => line.isDemoData) && (
          <Badge variant="outline" className="w-fit text-muted-foreground">
            Inclui itens demonstrativos
          </Badge>
        )}
      </aside>
    </div>
  );
}
