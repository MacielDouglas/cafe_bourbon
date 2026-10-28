import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

export function AnnouncementBar() {
  const message = "Torra artesanal · Franca, São Paulo";
  const secondary = "Assinaturas a partir de R$ 90";

  return (
    <div className="bg-espresso text-creme">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2.5 text-center text-xs font-medium tracking-[0.14em] uppercase">
        <span>{message}</span>
        <span aria-hidden className="hidden opacity-40 sm:inline">
          —
        </span>
        <Link
          href="/assinatura"
          className="group hidden items-center gap-1 rounded-sm underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-creme/60 sm:inline-flex"
        >
          {secondary}
          <ArrowUpRightIcon className="size-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
