import Link from "next/link";
import type { ReactNode } from "react";

export function StateMessage({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border px-8 py-16 text-center sm:items-center">
      {eyebrow && (
        <span className="text-[0.6875rem] font-medium tracking-[0.18em] text-brand uppercase">
          {eyebrow}
        </span>
      )}
      <h2 className="text-xl font-medium">{title}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

export function StateLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-brand underline-offset-4 hover:underline"
    >
      {children}
    </Link>
  );
}
