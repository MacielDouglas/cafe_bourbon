"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CoffeeOption } from "@/modules/pairing/presentation/data";

export function CoffeeSelect({
  coffees,
  value,
}: {
  coffees: CoffeeOption[];
  value?: string;
}) {
  const router = useRouter();

  return (
    <Select
      value={value ?? null}
      onValueChange={(next) => {
        const slug = typeof next === "string" ? next : "";
        router.push(slug ? `/harmonizacoes?cafe=${slug}` : "/harmonizacoes");
      }}
      items={coffees.map((coffee) => ({
        value: coffee.slug,
        label: coffee.name,
      }))}
    >
      <SelectTrigger aria-label="Escolha o café" className="w-full sm:w-80">
        <SelectValue placeholder="Selecione um café" />
      </SelectTrigger>
      <SelectContent>
        {coffees.map((coffee) => (
          <SelectItem key={coffee.slug} value={coffee.slug}>
            {coffee.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
