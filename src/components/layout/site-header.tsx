import { Suspense } from "react";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { AccountActions } from "@/components/layout/account-actions";
import { Logo } from "@/components/layout/logo";
import { MegaMenu } from "@/components/layout/mega-menu";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { NavLink } from "@/components/layout/nav-link";
import { SearchButton } from "@/components/layout/search-button";
import { categoryLinks, primaryLinks } from "@/components/layout/navigation";

const navItem =
  "relative py-2 text-sm text-foreground/70 transition-colors hover:text-foreground";
const navItemActive =
  "font-medium text-brand after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-brand";

function DesktopNav() {
  return (
    <nav className="hidden items-center gap-7 md:flex">
      <MegaMenu />
      {categoryLinks.map((category) => (
        <NavLink
          key={category.type}
          href={category.href}
          className={navItem}
          activeClassName={navItemActive}
        >
          {category.label}
        </NavLink>
      ))}
      {primaryLinks.map((link) => (
        <NavLink
          key={link.href}
          href={link.href}
          className={navItem}
          activeClassName={navItemActive}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function SiteHeader() {
  return (
    <div>
      <AnnouncementBar />
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 sm:px-6 lg:px-8">
          <Logo className="text-foreground" />

          <Suspense fallback={<div className="hidden md:block" />}>
            <DesktopNav />
          </Suspense>

          <div className="ml-auto flex items-center gap-0.5">
            <SearchButton />
            <AccountActions />
            <div className="md:hidden">
              <Suspense fallback={null}>
                <MobileMenu />
              </Suspense>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
