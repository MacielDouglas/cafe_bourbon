import Link from "next/link";
import { cn } from "cn";
import type { ProductType } from "@/modules/catalog/domain/value-objects";

const tabs: { label: string; type?: ProductType }[] = [
  { label: "Todos" },
  { label: "Cafés", type: "COFFEE" },
  { label: "Queijos", type: "CHEESE" },
  { label: "Vinhos", type: "WINE" },
];

function hrefFor(type: ProductType | undefined, search: string | undefined) {
  const params = new URLSearchParams();
  if (type) params.set("tipo", type);
  if (search) params.set("busca", search);
  const query = params.toString();
  return query ? `/produtos?${query}` : "/produtos";
}

export function CatalogFilters({
  active,
  search,
}: {
  active?: ProductType;
  search?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tabs.map((tab) => {
        const isActive = tab.type === active || (!tab.type && !active);
        return (
          <Link
            key={tab.label}
            href={hrefFor(tab.type, search)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm transition-colors",
              isActive
                ? "bg-foreground text-background"
                : "text-foreground/70 hover:bg-secondary hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
