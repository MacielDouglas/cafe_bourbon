import { Suspense } from "react";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { AccountActions } from "@/components/layout/account-actions";
import { Logo } from "@/components/layout/logo";
import { MegaMenu } from "@/components/layout/mega-menu";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { NavLink } from "@/components/layout/nav-link";
import { SearchButton } from "@/components/layout/search-button";
import { primaryLinks } from "@/components/layout/navigation";

const navItem =
  "relative py-2.5 text-sm text-foreground/70 transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:rounded-full after:bg-brand after:transition-transform after:duration-300 hover:text-foreground hover:after:scale-x-100";
const navItemActive =
  "font-medium text-brand hover:text-brand after:h-0.5 after:scale-x-100";

function DesktopNav() {
  return (
    <nav
      aria-label="Navegação principal"
      className="hidden items-center gap-7 lg:flex"
    >
      <MegaMenu />
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
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-7xl items-center gap-4 px-4 sm:gap-6 sm:px-6 lg:gap-8 lg:px-8">
          <Logo className="shrink-0 text-foreground" />

          <Suspense fallback={<div className="hidden lg:block" />}>
            <DesktopNav />
          </Suspense>

          <div className="ml-auto flex items-center gap-1 sm:gap-0.5">
            <div className="hidden sm:block">
              <SearchButton />
            </div>
            <AccountActions />
            <div className="lg:hidden">
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
