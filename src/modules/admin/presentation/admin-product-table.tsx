"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);

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
    setDeleteTarget(null);
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
      <p className="rounded-2xl border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground shadow-soft">
        Nenhum produto cadastrado. Crie o primeiro no botão acima.
      </p>
    );
  }

  const term = query.trim().toLowerCase();
  const filtered = products.filter((product) => {
    const matchesTerm =
      !term ||
      product.name.toLowerCase().includes(term) ||
      product.slug.toLowerCase().includes(term);
    const matchesType = typeFilter === "ALL" || product.type === typeFilter;
    return matchesTerm && matchesType;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nome ou slug"
          aria-label="Buscar produtos"
          className="sm:max-w-xs"
        />
        <Select
          value={typeFilter}
          onValueChange={(value) => setTypeFilter(String(value))}
          items={[
            { value: "ALL", label: "Todos os tipos" },
            { value: "COFFEE", label: "Cafés" },
            { value: "CHEESE", label: "Queijos" },
            { value: "WINE", label: "Vinhos" },
          ]}
        >
          <SelectTrigger className="sm:w-48" aria-label="Filtrar por tipo">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos os tipos</SelectItem>
            <SelectItem value="COFFEE">Cafés</SelectItem>
            <SelectItem value="CHEESE">Queijos</SelectItem>
            <SelectItem value="WINE">Vinhos</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filtered.length} de {products.length}
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
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
          {filtered.map((product) => {
            const busy = pending === product.id;
            const draft = stockDraft[product.id];
            return (
              <tr key={product.id}>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-2 font-medium">
                      {product.name}
                      
                    </span>
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
                      aria-label={`Estoque de ${product.name}`}
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
                      variant="outline"
                      disabled={busy || draft === undefined}
                      onClick={() => void saveStock(product)}
                    >
                      Salvar
                    </Button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col items-start gap-1.5">
                    <Badge
                      variant={product.available ? "secondary" : "destructive"}
                    >
                      {product.available ? "Disponível" : "Indisponível"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      onClick={() => void toggleAvailability(product)}
                    >
                      {product.available ? "Pausar venda" : "Ativar venda"}
                    </Button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Editar ${product.name}`}
                      disabled={busy}
                      nativeButton={false}
                      render={<Link href={`/admin/produtos/${product.id}`} />}
                    >
                      <PencilIcon />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Excluir ${product.name}`}
                      disabled={busy}
                      onClick={() => setDeleteTarget(product)}
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
      {filtered.length === 0 && (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          Nenhum produto corresponde a esse filtro.
        </p>
      )}
      </div>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir produto</DialogTitle>
            <DialogDescription>
              Excluir definitivamente “{deleteTarget?.name}”? Esta ação não pode
              ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={pending !== null}
              onClick={() => deleteTarget && void remove(deleteTarget)}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
