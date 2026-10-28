import { cn } from "cn";
import type { SensoryAxes } from "@/modules/catalog/domain/product";

function ScaleBar({
  label,
  value,
  compact,
}: {
  label: string;
  value: number;
  compact?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span
        className={cn(
          "text-muted-foreground",
          compact ? "text-[0.6875rem]" : "text-sm",
        )}
      >
        {label}
      </span>
      <div className={cn("flex", compact ? "gap-0.5" : "gap-1")} aria-hidden>
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className={cn(
              "rounded-full",
              compact ? "h-1 w-3" : "h-1.5 w-7",
              index < value ? "bg-brand" : "bg-border",
            )}
          />
        ))}
      </div>
      <span className="sr-only">
        {label}: {value} de 5
      </span>
    </div>
  );
}

export function SensoryProfile({
  sensory,
  compact = false,
}: {
  sensory: SensoryAxes;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-col", compact ? "gap-1" : "gap-3")}>
      <ScaleBar label="Intensidade" value={sensory.intensity} compact={compact} />
      <ScaleBar label="Corpo" value={sensory.body} compact={compact} />
      {sensory.acidity !== null && (
        <ScaleBar label="Acidez" value={sensory.acidity} compact={compact} />
      )}
    </div>
  );
}

export function SensoryNotes({ notes }: { notes: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {notes.map((note) => (
        <span
          key={note}
          className="rounded-full border border-border px-3 py-1 text-xs text-foreground/75"
        >
          {note}
        </span>
      ))}
    </div>
  );
}
