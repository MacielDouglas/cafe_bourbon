import Link from "next/link";
import { ChatPanel } from "@/modules/assistant/presentation/chat-panel";

export const metadata = {
  title: "Tire dúvidas",
  description:
    "Pergunte sobre cafés, queijos, vinhos e harmonizações do Café Bourbon. Cada tema tem um especialista da casa.",
};

const people = [
  {
    initials: "LG",
    name: "Lorenzo Giovanni",
    role: "Barista",
    topic: "Café",
    line: "Métodos, moagens, torra e origens.",
  },
  {
    initials: "JP",
    name: "Jean Pierre",
    role: "Sommelier",
    topic: "Vinho",
    line: "Uvas, terroir, guarda e serviço.",
  },
  {
    initials: "CZ",
    name: "Chico da Dona Zezé",
    role: "Queijista",
    topic: "Queijo",
    line: "Leite, cura, textura e sabor.",
  },
] as const;

const rules = [
  {
    title: "Só produto da casa",
    text: "As sugestões saem do catálogo disponível, com nome e preço conferidos.",
  },
  {
    title: "Cada tema tem seu especialista",
    text: "Café fica com Lorenzo, vinho com Jean Pierre e queijo com Chico.",
  },
  {
    title: "Se a conexão falhar",
    text: "A resposta usa pistas locais do catálogo, sem inventar produto.",
  },
] as const;

export default function DuvidasPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <header className="grid gap-8 lg:grid-cols-[1.45fr_1fr] lg:items-end">
        <div className="home-hero-focus flex flex-col gap-4">
          <h1 className="text-5xl font-medium tracking-tight sm:text-6xl">
            Tire dúvidas antes de provar
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Pergunte sobre café, queijo, vinho e harmonizações. Quem responde é
            a pessoa certa: Lorenzo Giovanni cuida do café, Jean Pierre do vinho
            e Chico da Dona Zezé do queijo.
          </p>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            As respostas partem do catálogo real da casa. Nada de preço, safra
            ou estoque inventado.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link
              href="/produtos"
              className="font-medium underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
            >
              Ver catálogo
            </Link>
            <Link
              href="/harmonizacoes"
              className="font-medium underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
            >
              Ver harmonizações
            </Link>
          </div>
        </div>
        <aside
          aria-labelledby="quem-responde"
          className="rounded-2xl border border-border bg-linho/70 p-5"
        >
          <h2 id="quem-responde" className="text-sm font-medium">
            Quem responde
          </h2>
          <ul className="mt-4 flex flex-col gap-4">
            {people.map((person) => (
              <li key={person.name} className="flex gap-3">
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-medium text-brand"
                  aria-hidden
                >
                  {person.initials}
                </span>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium">{person.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {person.role} · {person.topic}
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {person.line}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
            Perguntas sobre a loja em geral ficam com a Casa Bourbon.
          </p>
        </aside>
      </header>

      <section aria-labelledby="conversa" className="mt-12">
        <h2 id="conversa" className="sr-only">
          Converse com a casa
        </h2>
        <ChatPanel />
      </section>

      <section
        aria-labelledby="como-funciona"
        className="mt-12 grid gap-6 border-t border-border pt-8 sm:grid-cols-3"
      >
        <h2 id="como-funciona" className="sr-only">
          Como a casa responde
        </h2>
        {rules.map((rule) => (
          <div key={rule.title} className="flex flex-col gap-1.5">
            <h3 className="text-sm font-medium">{rule.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {rule.text}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
