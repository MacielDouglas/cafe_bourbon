import type { AssistantTopic } from "@/modules/assistant/domain/assistant-topic";

export interface AssistantPersona {
  topic: AssistantTopic;
  name: string;
  role: string;
  initials: string;
  thinking: string;
}

export const ASSISTANT_PERSONAS: Record<AssistantTopic, AssistantPersona> = {
  COFFEE: {
    topic: "COFFEE",
    name: "Lorenzo Giovanni",
    role: "Barista",
    initials: "LG",
    thinking: "Lorenzo Giovanni está pensando...",
  },
  WINE: {
    topic: "WINE",
    name: "Jean Pierre",
    role: "Sommelier",
    initials: "JP",
    thinking: "Jean Pierre está escolhendo as palavras...",
  },
  CHEESE: {
    topic: "CHEESE",
    name: "Chico da Dona Zezé",
    role: "Queijista",
    initials: "CZ",
    thinking: "Chico da Dona Zezé está pensando...",
  },
  GENERAL: {
    topic: "GENERAL",
    name: "Casa Bourbon",
    role: "Atendimento",
    initials: "CB",
    thinking: "A casa está preparando a resposta...",
  },
};

export function resolveAssistantPersona(topic: AssistantTopic): AssistantPersona {
  return ASSISTANT_PERSONAS[topic];
}
