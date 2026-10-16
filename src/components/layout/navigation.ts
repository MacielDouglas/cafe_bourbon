import type { ProductType } from "@/modules/catalog/domain/value-objects";

export interface CategoryLink {
  type: ProductType;
  label: string;
  blurb: string;
  href: string;
}

export interface SimpleLink {
  label: string;
  href: string;
}

/** Coleções principais — alimentam o mega-menu, a home e o rodapé. */
export const categoryLinks: CategoryLink[] = [
  {
    type: "COFFEE",
    label: "Cafés",
    blurb: "Torras especiais de origem única",
    href: "/produtos?tipo=COFFEE",
  },
  {
    type: "CHEESE",
    label: "Queijos",
    blurb: "Seleção curada para harmonizar",
    href: "/produtos?tipo=CHEESE",
  },
  {
    type: "WINE",
    label: "Vinhos",
    blurb: "Rótulos para dividir a mesa",
    href: "/produtos?tipo=WINE",
  },
];

/** Links de destaque do cabeçalho. */
export const primaryLinks: SimpleLink[] = [
  { label: "Harmonizações", href: "/harmonizacoes" },
  { label: "Descobrir", href: "/descobrir" },
  { label: "Barista", href: "/barista" },
];

/** Cafés de origem — atalhos usados no mega-menu e no rodapé. */
export const coffeeLinks: SimpleLink[] = [
  { label: "Café do Brasil", href: "/produtos/cafe-do-brasil" },
  { label: "Café Cubano", href: "/produtos/cafe-cubano" },
  { label: "Papua Nova Guiné", href: "/produtos/cafe-papua-nova-guine" },
  { label: "Colombiano (Medellín)", href: "/produtos/cafe-colombiano-medellin" },
];
