"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImagePlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ProductImageManager({
  productId,
  imageUrl,
}: {
  productId: string;
  imageUrl: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(imageUrl);
  const [loading, setLoading] = useState(false);

  async function upload(file: File) {
    if (file.size > 4 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 4 MB.");
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch(`/api/admin/products/${productId}/image`, {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        toast.error(data?.error ?? "Não foi possível enviar a imagem.");
        return;
      }

      const data = (await response.json()) as { imageUrl: string };
      setPreview(`${data.imageUrl}?v=${Date.now()}`);
      toast.success("Imagem convertida para WebP e salva.");
      router.refresh();
    } catch {
      toast.error("Não foi possível enviar a imagem.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove() {
    if (!window.confirm("Remover a imagem deste produto?")) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/products/${productId}/image`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        toast.error(data?.error ?? "Não foi possível remover a imagem.");
        return;
      }
      setPreview(null);
      toast.success("Imagem removida.");
      router.refresh();
    } catch {
      toast.error("Não foi possível remover a imagem.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border p-5">
      <div>
        <h2 className="font-medium">Imagem principal</h2>
        <p className="text-sm text-muted-foreground">
          JPG, PNG, WebP, GIF ou AVIF até 4 MB. Convertida para WebP e salva em
          Base64 no banco.
        </p>
      </div>

      <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/5">
        {preview ? (
          <Image
            src={preview}
            alt="Imagem do produto"
            fill
            sizes="320px"
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
            Sem imagem
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlusIcon />
          {loading ? "Enviando..." : "Enviar imagem"}
        </Button>
        {preview && (
          <Button
            type="button"
            variant="ghost"
            className="text-destructive"
            disabled={loading}
            onClick={() => void remove()}
          >
            <Trash2Icon />
            Remover
          </Button>
        )}
      </div>
    </div>
  );
}
