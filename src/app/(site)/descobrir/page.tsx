import { TasteQuiz } from "@/modules/discovery/presentation/taste-quiz";

export const metadata = {
  title: "Descobrir",
  description:
    "Conte seu paladar — intensidade, acidez, corpo e notas — e receba cafés, queijos e vinhos sob medida.",
};

export default function DescobrirPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <header className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-end">
        <div className="home-hero-focus flex flex-col gap-4">
          <h1 className="max-w-4xl text-5xl font-medium tracking-tight text-balance sm:text-6xl">
            Encontre seu próximo favorito
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Ajuste os controles conforme o seu paladar. O motor cruza seu perfil
            com os eixos sensoriais do catálogo — de forma determinística e
            explicável, sem achismo.
          </p>
        </div>
        <div className="border-t border-border pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          <p className="text-lg leading-snug font-medium">
            O paladar não é um botão.
          </p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Intensidade, corpo e acidez são pontos de partida. O resto é o que
            você gosta de lembrar na xícara.
          </p>
        </div>
      </header>

      <div className="mt-12">
        <TasteQuiz />
      </div>
    </div>
  );
}
