import Link from "next/link";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { AccountActions } from "@/components/layout/account-actions";
import { Logo } from "@/components/layout/logo";
import { MegaMenu } from "@/components/layout/mega-menu";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { SearchButton } from "@/components/layout/search-button";
import { categoryLinks } from "@/components/layout/navigation";

export function SiteHeader() {
  return (
    <div>
      <AnnouncementBar />
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 sm:px-6 lg:px-8">
          <Logo className="text-foreground" />

          <nav className="hidden items-center gap-7 md:flex">
            <MegaMenu />
            {categoryLinks.map((category) => (
              <Link
                key={category.type}
                href={category.href}
                className="py-2 text-sm text-foreground/70 transition-colors hover:text-foreground"
              >
                {category.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-0.5">
            <SearchButton />
            <AccountActions />
            <div className="md:hidden">
              <MobileMenu />
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
