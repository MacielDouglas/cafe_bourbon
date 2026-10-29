"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MinusIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { DemoBadge } from "@/components/demo-badge";
import { StateMessage } from "@/components/state-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCents } from "@/modules/catalog/presentation/format";
import { productTypeLabel } from "@/modules/catalog/presentation/labels";
import type { SerializedCart } from "@/modules/commerce/presentation/serialize";
import { CartSkeleton } from "@/modules/commerce/presentation/skeletons";
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
      <span className="text-[0.6875rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
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
  const [revalidating, setRevalidating] = useState(true);
  const mutated = useRef(false);

  // Garante dados frescos ao entrar na página, mesmo que a navegação
  // cliente tenha reutilizado um payload em cache (ex.: carrinho vazio).
  useEffect(() => {
    let active = true;

    async function refresh() {
      try {
        const response = await fetch("/api/cart", { cache: "no-store" });
        if (!response.ok) return;
        const fresh = (await response.json()) as SerializedCart;
        if (active && !mutated.current) setCart(fresh);
      } catch {
        // mantém o estado atual; mutações continuam disponíveis
      } finally {
        if (active) setRevalidating(false);
      }
    }

    void refresh();
    return () => {
      active = false;
    };
  }, []);

  async function send(
    key: string,
    path: string,
    init: RequestInit,
  ): Promise<boolean> {
    mutated.current = true;
    setPending(key);
    try {
      setCart(await parseCart(await fetch(path, init)));
      notifyCartUpdated();
      return true;
    } catch {
      toast.error("Não foi possível atualizar o carrinho.");
      return false;
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

  async function removeLine(productId: string) {
    const line = cart.lines.find((item) => item.productId === productId);
    const ok = await send(
      productId,
      `/api/cart?productId=${encodeURIComponent(productId)}`,
      { method: "DELETE" },
    );
    if (ok && line) {
      toast.success(`${line.name} removido`, {
        action: {
          label: "Desfazer",
          onClick: () => void setQuantity(line.productId, line.quantity),
        },
      });
    }
  }

  async function clear() {
    const snapshot = cart.lines.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
    }));
    const ok = await send("__all__", "/api/cart", { method: "DELETE" });
    if (!ok || snapshot.length === 0) return;
    toast.success("Carrinho esvaziado", {
      action: {
        label: "Desfazer",
        onClick: () => void restore(snapshot),
      },
    });
  }

  async function restore(
    lines: { productId: string; quantity: number }[],
  ): Promise<void> {
    mutated.current = true;
    try {
      await Promise.all(
        lines.map((line) =>
          fetch("/api/cart", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(line),
          }),
        ),
      );
      const response = await fetch("/api/cart", { cache: "no-store" });
      if (response.ok) setCart((await response.json()) as SerializedCart);
      notifyCartUpdated();
    } catch {
      toast.error("Não foi possível restaurar o carrinho.");
    }
  }

  async function checkout() {
    if (!isAuthenticated) {
      toast.info("Entre na sua conta para finalizar o pedido.");
      router.push("/entrar?redirect=/carrinho");
      return;
    }

    mutated.current = true;
    setPending("__checkout__");
    try {
      const response = await fetch("/api/checkout", { method: "POST" });

      if (response.status === 401) {
        toast.info("Entre na sua conta para finalizar o pedido.");
        router.push("/entrar?redirect=/carrinho");
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
        kitDiscountCents: 0,
        kitDiscountLabel: formatCents(0),
        kitDiscountPercent: 5,
        kitCount: 0,
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

  if (revalidating && cart.lines.length === 0) {
    return <CartSkeleton />;
  }

  if (cart.lines.length === 0) {
    return (
      <StateMessage
        title="Seu carrinho está vazio"
        description="Explore o catálogo de cafés, queijos e vinhos e monte sua mesa."
        action={
          <Button nativeButton={false} render={<Link href="/produtos" />}>
            Ver o catálogo
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
      <ul className="flex flex-col divide-y divide-border">
        {cart.lines.map((line) => (
          <li key={line.productId} className="flex gap-4 py-5">
            <Link
              href={`/produtos/${line.slug}`}
              className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted shadow-soft outline-none ring-1 ring-foreground/5 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Thumb imageUrl={line.imageUrl} name={line.name} type={line.type} />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-col">
                  <Link
                    href={`/produtos/${line.slug}`}
                    className="truncate rounded-sm font-medium outline-none transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-ring/60"
                  >
                    {line.name}
                  </Link>
                  <span className="text-sm text-muted-foreground">
                    {line.priceLabel} cada
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {productTypeLabel[line.type]}
                    {line.isDemoData && <DemoBadge />}
                  </span>
                </div>
                <span className="shrink-0 font-medium tabular-nums">
                  {line.subtotalLabel}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-lg border border-border bg-card shadow-soft">
                  <Button
                    variant="ghost"
                    size="icon"
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
                    size="icon"
                    aria-label={`Aumentar ${line.name}`}
                    disabled={pending === line.productId || line.quantity >= 99}
                    onClick={() => setQuantity(line.productId, line.quantity + 1)}
                  >
                    <PlusIcon />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive"
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

      <aside className="flex h-fit flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="text-lg font-medium">Resumo</h2>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Itens</span>
          <span className="tabular-nums">{cart.totalQuantity}</span>
        </div>
        {cart.kitDiscountCents > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-brand">
              Kit de harmonização ({cart.kitCount}× ·{" "}
              {cart.kitDiscountPercent}% off)
            </span>
            <span className="font-medium text-brand tabular-nums">
              − {cart.kitDiscountLabel}
            </span>
          </div>
        )}
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
        <Separator />
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
