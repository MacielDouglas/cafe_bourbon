import { cn } from "cn";
import {
  type PairingTier,
  pairingTierLabel,
} from "@/modules/pairing/presentation/labels";

const tierBar: Record<PairingTier, string> = {
  excelente: "w-full",
  boa: "w-3/4",
  moderada: "w-1/2",
  experimental: "w-1/4",
};

export function PairingScoreBadge({
  value,
  tier,
  className,
}: {
  value: number;
  tier: PairingTier;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl leading-none font-medium tabular-nums">
          {value}
        </span>
        <span className="text-[0.6875rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
          {pairingTierLabel[tier]}
        </span>
      </div>
      <div className="h-1 w-24 overflow-hidden rounded-full bg-border" aria-hidden>
        <div className={cn("h-full rounded-full bg-brand", tierBar[tier])} />
      </div>
      <span className="sr-only">
        Compatibilidade {value} de 100 — {pairingTierLabel[tier]}
      </span>
    </div>
  );
}
