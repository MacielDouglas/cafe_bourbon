import { ChatPanel } from "@/modules/assistant/presentation/chat-panel";

export const metadata = {
  title: "Barista virtual",
  description:
    "Converse com o barista virtual do Café Bourbon sobre cafés, queijos, vinhos e harmonizações.",
};

export default function BaristaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="flex max-w-2xl flex-col gap-3">
        <span className="text-[0.6875rem] font-medium tracking-[0.18em] text-brand uppercase">
          Assistente
        </span>
        <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
          Barista virtual
        </h1>
        <p className="text-muted-foreground">
          Um atendente que conhece o nosso catálogo. Ele sugere apenas produtos
          que existem na casa e nunca inventa preço ou disponibilidade. Quando a
          IA não está configurada, respondemos em modo degradado com as melhores
          pistas do catálogo.
        </p>
      </header>

      <div className="mt-10">
        <ChatPanel />
      </div>
    </div>
  );
}
