"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOutIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CartIndicator } from "@/components/layout/cart-indicator";
import { authClient, useSession } from "@/lib/auth-client";

export function AccountActions() {
  const { data } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const user = data?.user;

  async function handleSignOut() {
    setSigningOut(true);
    await authClient.signOut();
    setSigningOut(false);
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-0.5">
      {user ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={<Button variant="ghost" size="icon" aria-label="Minha conta" />}
          >
            <UserIcon />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{user.name || "Minha conta"}</DialogTitle>
              <DialogDescription>{user.email}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                render={
                  <Link href="/assinatura" onClick={() => setOpen(false)} />
                }
              >
                Assinaturas
              </Button>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                disabled={signingOut}
              >
                <LogOutIcon />
                {signingOut ? "Saindo..." : "Sair"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Entrar"
          render={<Link href="/entrar" />}
        >
          <UserIcon />
        </Button>
      )}

      <CartIndicator />
    </div>
  );
}
