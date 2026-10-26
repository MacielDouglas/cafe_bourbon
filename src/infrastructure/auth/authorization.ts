import type { UserRole } from "@prisma/client";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/infrastructure/auth/better-auth";
import { getPrisma } from "@/infrastructure/database/prisma";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export function isOwnerRole(role: string | null | undefined): boolean {
  return role === "OWNER" || role === "ADMIN";
}

/** Usuário autenticado (com papel) ou null. Nunca lança em falha de sessão/DB. */
export async function currentUser(): Promise<AuthenticatedUser | null> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return null;
    return await getPrisma().user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, role: true },
    });
  } catch {
    return null;
  }
}

/**
 * Guard de páginas do painel: redireciona visitantes para o login e esconde o
 * painel de usuários comuns (404).
 */
export async function requireOwner(): Promise<AuthenticatedUser> {
  const user = await currentUser();
  if (!user) redirect("/entrar?redirect=/admin");
  if (!isOwnerRole(user.role)) notFound();
  return user;
}
