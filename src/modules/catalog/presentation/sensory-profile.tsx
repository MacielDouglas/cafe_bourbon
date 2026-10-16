import { cn } from "cn";
import type { SensoryAxes } from "@/modules/catalog/domain/product";

function ScaleBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex gap-1" aria-hidden>
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className={cn(
              "h-1.5 w-7 rounded-full",
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

export function SensoryProfile({ sensory }: { sensory: SensoryAxes }) {
  return (
    <div className="flex flex-col gap-3">
      <ScaleBar label="Intensidade" value={sensory.intensity} />
      <ScaleBar label="Corpo" value={sensory.body} />
      {sensory.acidity !== null && (
        <ScaleBar label="Acidez" value={sensory.acidity} />
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
