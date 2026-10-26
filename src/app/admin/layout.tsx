import type { Metadata } from "next";
import { requireOwner } from "@/infrastructure/auth/authorization";
import { AdminNav } from "@/modules/admin/presentation/admin-nav";

export const metadata: Metadata = {
  title: "Painel do owner",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireOwner();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4">
        <div>
          <span className="text-[0.6875rem] font-medium tracking-[0.18em] text-brand uppercase">
            Administração
          </span>
          <h1 className="text-3xl font-medium tracking-tight">Painel do owner</h1>
          <p className="text-sm text-muted-foreground">
            Sessão de {user.name} ({user.email})
          </p>
        </div>
        <AdminNav />
      </header>
      {children}
    </div>
  );
}
