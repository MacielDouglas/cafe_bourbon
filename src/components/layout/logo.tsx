import Link from "next/link";
import { cn } from "cn";

/**
 * Wordmark Café Bourbon renderizado como máscara CSS para herdar `currentColor`
 * (o SVG em /public/bourbon.svg é preto sólido). Mantém o texto acessível.
 */
function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Café Bourbon — página inicial"
      className={cn(
        "inline-flex items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-4 focus-visible:ring-offset-background",
        className,
      )}
    >
      <span
        aria-hidden
        className="block h-6 w-[122px] bg-current [mask-image:url(/bourbon.svg)] [mask-repeat:no-repeat] [mask-position:left_center] [mask-size:contain]"
      />
    </Link>
  );
}

export { Logo };
