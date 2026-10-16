import { TasteQuiz } from "@/modules/discovery/presentation/taste-quiz";

export const metadata = {
  title: "Descobrir",
  description:
    "Conte seu paladar — intensidade, acidez, corpo e notas — e receba cafés, queijos e vinhos sob medida.",
};

export default function DescobrirPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="flex max-w-2xl flex-col gap-3">
        <span className="text-[0.6875rem] font-medium tracking-[0.18em] text-brand uppercase">
          Descobrir
        </span>
        <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">
          Encontre seu próximo favorito
        </h1>
        <p className="text-muted-foreground">
          Ajuste os controles conforme o seu paladar. O motor cruza seu perfil
          com os eixos sensoriais do catálogo — de forma determinística e
          explicável, sem achismo.
        </p>
      </header>

      <div className="mt-10">
        <TasteQuiz />
      </div>
    </div>
  );
}
