import { ProductForm } from "@/modules/admin/presentation/product-form";

export const instant = false;

export default function AdminNewProductPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-medium">Novo produto</h2>
        <p className="text-sm text-muted-foreground">
          Após criar, você poderá enviar a imagem principal.
        </p>
      </div>
      <ProductForm mode="create" />
    </div>
  );
}
