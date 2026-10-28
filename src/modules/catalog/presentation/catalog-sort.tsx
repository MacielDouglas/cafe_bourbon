"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductSort } from "@/modules/catalog/domain/repository";
import type { ProductType } from "@/modules/catalog/domain/value-objects";

const options: { value: ProductSort; label: string }[] = [
  { value: "name", label: "Nome (A–Z)" },
  { value: "price-asc", label: "Menor preço" },
  { value: "price-desc", label: "Maior preço" },
  { value: "intensity-desc", label: "Maior intensidade" },
];

export function CatalogSort({
  active,
  search,
  sort = "name",
  compare,
}: {
  active?: ProductType;
  search?: string;
  sort?: ProductSort;
  compare?: string;
}) {
  const router = useRouter();

  function handleChange(value: ProductSort) {
    const params = new URLSearchParams();
    if (active) params.set("tipo", active);
    if (search) params.set("busca", search);
    if (value !== "name") params.set("ordem", value);
    if (compare) params.set("comparar", compare);
    const query = params.toString();
    router.push(query ? `/produtos?${query}` : "/produtos");
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Ordenar</span>
      <Select
        value={sort}
        onValueChange={(value) => handleChange(value as ProductSort)}
        items={options}
      >
        <SelectTrigger className="w-44" aria-label="Ordenar produtos">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
