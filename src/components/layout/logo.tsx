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
      className={cn("inline-flex items-center", className)}
    >
      <span
        aria-hidden
        className="block h-5 w-[102px] bg-current [mask-image:url(/bourbon.svg)] [mask-repeat:no-repeat] [mask-position:left_center] [mask-size:contain]"
      />
    </Link>
  );
}

export { Logo };
