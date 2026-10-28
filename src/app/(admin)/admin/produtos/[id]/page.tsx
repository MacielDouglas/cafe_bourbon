import { notFound } from "next/navigation";
import { StateLink, StateMessage } from "@/components/state-message";
import { ProductForm } from "@/modules/admin/presentation/product-form";
import { ProductImageManager } from "@/modules/admin/presentation/product-image-manager";
import { loadAdminProduct } from "@/modules/admin/presentation/data";

export const instant = false;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditProductPage({ params }: PageProps) {
  const { id } = await params;
  const { product, failed } = await loadAdminProduct(id);

  if (failed) {
    return (
      <StateMessage
        title="Não conseguimos carregar o produto"
        description="O banco de dados está indisponível no momento. Tente novamente em instantes."
        action={<StateLink href="/admin/produtos">Voltar aos produtos</StateLink>}
      />
    );
  }

  if (!product) notFound();

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-medium">Editar produto</h2>
          <p className="text-sm text-muted-foreground">
            Alterações de preço, estoque e disponibilidade valem imediatamente.
          </p>
        </div>
        <ProductForm mode="edit" product={product} />
      </div>
      <ProductImageManager productId={product.id} imageUrl={product.imageUrl} />
    </div>
  );
}
