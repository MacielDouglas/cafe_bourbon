"use client";

import type { ComponentProps } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "cn";

function isActive(
  pathname: string,
  currentType: string | null,
  href: string,
): boolean {
  const [path, query = ""] = href.split("?");
  const targetType = new URLSearchParams(query).get("tipo");

  if (path === "/produtos") {
    if (targetType) {
      return pathname === "/produtos" && currentType === targetType;
    }
    return (
      pathname.startsWith("/produtos") &&
      (pathname !== "/produtos" || currentType === null)
    );
  }

  return pathname === path || pathname.startsWith(`${path}/`);
}

export function NavLink({
  href,
  className,
  activeClassName,
  ...props
}: Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  activeClassName?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = isActive(pathname, searchParams.get("tipo"), href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-4 focus-visible:ring-offset-background",
        className,
        active && activeClassName,
      )}
      {...props}
    />
  );
}
