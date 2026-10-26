"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCents } from "@/modules/catalog/presentation/format";
import { productTypeLabel } from "@/modules/catalog/presentation/labels";
import type { AdminProduct } from "@/modules/admin/presentation/data";

async function errorMessage(response: Response): Promise<string> {
  const data = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;
  return data?.error ?? "Não foi possível concluir a ação.";
}

export function AdminProductTable({ products }: { products: AdminProduct[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [stockDraft, setStockDraft] = useState<Record<string, string>>({});

  async function saveStock(product: AdminProduct) {
    const raw = stockDraft[product.id];
    if (raw === undefined) return;
    const stock = Number(raw);
    if (!Number.isInteger(stock) || stock < 0) {
      toast.error("Informe uma quantidade inteira maior ou igual a zero.");
      return;
    }

    setPending(product.id);
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock }),
      });
      if (!response.ok) {
        toast.error(await errorMessage(response));
        return;
      }
      toast.success(`Estoque de ${product.name} atualizado.`);
      setStockDraft((current) => {
        const next = { ...current };
        delete next[product.id];
        return next;
      });
      router.refresh();
    } catch {
      toast.error("Não foi possível atualizar o estoque.");
    } finally {
      setPending(null);
    }
  }

  async function toggleAvailability(product: AdminProduct) {
    setPending(product.id);
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !product.available }),
      });
      if (!response.ok) {
        toast.error(await errorMessage(response));
        return;
      }
      router.refresh();
    } catch {
      toast.error("Não foi possível alterar a disponibilidade.");
    } finally {
      setPending(null);
    }
  }

  async function remove(product: AdminProduct) {
    if (
      !window.confirm(
        `Excluir definitivamente "${product.name}"? Esta ação não pode ser desfeita.`,
      )
    ) {
      return;
    }

    setPending(product.id);
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        toast.error(await errorMessage(response));
        return;
      }
      toast.success("Produto excluído.");
      router.refresh();
    } catch {
      toast.error("Não foi possível excluir o produto.");
    } finally {
      setPending(null);
    }
  }

  if (products.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
        Nenhum produto cadastrado. Crie o primeiro no botão acima.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="bg-muted/50 text-left text-xs text-muted-foreground uppercase">
          <tr>
            <th className="px-4 py-3 font-medium">Produto</th>
            <th className="px-4 py-3 font-medium">Tipo</th>
            <th className="px-4 py-3 font-medium">Preço</th>
            <th className="px-4 py-3 font-medium">Estoque</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {products.map((product) => {
            const busy = pending === product.id;
            const draft = stockDraft[product.id];
            return (
              <tr key={product.id}>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-xs text-muted-foreground">
                      /{product.slug}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {productTypeLabel[product.type]}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {product.priceCents === null
                    ? "—"
                    : formatCents(product.priceCents)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      min={0}
                      value={draft ?? String(product.stock)}
                      disabled={busy}
                      onChange={(event) =>
                        setStockDraft((current) => ({
                          ...current,
                          [product.id]: event.target.value,
                        }))
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          void saveStock(product);
                        }
                      }}
                      className="w-20"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy || draft === undefined}
                      onClick={() => void saveStock(product)}
                    >
                      Salvar
                    </Button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void toggleAvailability(product)}
                  >
                    <Badge
                      variant={product.available ? "secondary" : "destructive"}
                    >
                      {product.available ? "Disponível" : "Indisponível"}
                    </Badge>
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Editar ${product.name}`}
                      disabled={busy}
                      nativeButton={false}
                      render={<Link href={`/admin/produtos/${product.id}`} />}
                    >
                      <PencilIcon />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Excluir ${product.name}`}
                      disabled={busy}
                      onClick={() => void remove(product)}
                      className="text-destructive"
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
