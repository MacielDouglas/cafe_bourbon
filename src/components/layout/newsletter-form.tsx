"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  const [email, setEmail] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setEmail("");
    toast.success("Inscrição registrada!", {
      description: "Demonstrativo — o envio real por e-mail será ativado em breve.",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm items-center gap-2">
      <Input
        type="email"
        name="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="seu@email.com"
        aria-label="Seu e-mail"
      />
      <Button type="submit">Assinar</Button>
    </form>
  );
}
