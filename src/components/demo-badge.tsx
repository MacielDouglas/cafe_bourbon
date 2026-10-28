import { cn } from "cn";

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-card px-2 py-0.5 text-[0.6875rem] font-medium tracking-wide text-muted-foreground",
        className,
      )}
      title="Conteúdo demonstrativo: será substituído por dados reais."
    >
      Demonstrativo
    </span>
  );
}
