import Link from "next/link";
import { cn } from "cn";
import type { ProductType } from "@/modules/catalog/domain/value-objects";

const tabs: { label: string; type?: ProductType }[] = [
  { label: "Todos" },
  { label: "Cafés", type: "COFFEE" },
  { label: "Queijos", type: "CHEESE" },
  { label: "Vinhos", type: "WINE" },
];

function hrefFor(
  type: ProductType | undefined,
  search: string | undefined,
  sort: string | undefined,
  compare: string | undefined,
) {
  const params = new URLSearchParams();
  if (type) params.set("tipo", type);
  if (search) params.set("busca", search);
  if (sort) params.set("ordem", sort);
  if (compare) params.set("comparar", compare);
  const query = params.toString();
  return query ? `/produtos?${query}` : "/produtos";
}

export function CatalogFilters({
  active,
  search,
  sort,
  compare,
}: {
  active?: ProductType;
  search?: string;
  sort?: string;
  compare?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tabs.map((tab) => {
        const isActive = tab.type === active || (!tab.type && !active);
        return (
          <Link
            key={tab.label}
            href={hrefFor(tab.type, search, sort, compare)}
            className={cn(
              "inline-flex min-h-10 items-center rounded-full border px-5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-soft"
                : "border-border bg-card text-foreground/70 hover:border-foreground/20 hover:bg-secondary hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
