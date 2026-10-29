"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusOptions = [
  { value: "ALL", label: "Todos os status" },
  { value: "PENDING", label: "Pendente" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "CANCELLED", label: "Cancelado" },
];

export function OrderFilters({
  search = "",
  status = "ALL",
}: {
  search?: string;
  status?: string;
}) {
  const router = useRouter();
  const [term, setTerm] = useState(search);
  const [currentStatus, setCurrentStatus] = useState(status);

  function apply(nextTerm: string, nextStatus: string) {
    const params = new URLSearchParams();
    if (nextTerm.trim()) params.set("q", nextTerm.trim());
    if (nextStatus !== "ALL") params.set("status", nextStatus);
    const query = params.toString();
    router.push(query ? `/admin/pedidos?${query}` : "/admin/pedidos");
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        apply(term, currentStatus);
      }}
      className="flex flex-col gap-2 sm:flex-row sm:items-center"
    >
      <Input
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Buscar por cliente ou e-mail"
        aria-label="Buscar pedidos"
        className="sm:max-w-xs"
      />
      <Select
        value={currentStatus}
        onValueChange={(value) => {
          const nextStatus = String(value);
          setCurrentStatus(nextStatus);
          apply(term, nextStatus);
        }}
        items={statusOptions}
      >
        <SelectTrigger className="sm:w-48" aria-label="Filtrar por status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" variant="outline">
        <SearchIcon />
        Filtrar
      </Button>
    </form>
  );
}
