import { describe, expect, it } from "vitest";
import {
  detectAssistantTopic,
  isAssistantMessageInScope,
  tokenizeAssistantMessage,
} from "@/modules/assistant/domain/assistant-topic";

describe("tokenizeAssistantMessage", () => {
  it("remove acentos, caixa alta e pontuação", () => {
    expect(tokenizeAssistantMessage("Café, queijos & vinhos!")).toEqual([
      "cafe",
      "queijos",
      "vinhos",
    ]);
  });

  it("descarta stopwords e tokens com menos de 3 caracteres", () => {
    expect(tokenizeAssistantMessage("qual o de um café saboroso")).toEqual([
      "cafe",
      "saboroso",
    ]);
  });

  it("devolve lista vazia quando nada sobra", () => {
    expect(tokenizeAssistantMessage("um o de a é")).toEqual([]);
  });
});

describe("detectAssistantTopic", () => {
  it("detecta tópico por palavra-chave", () => {
    expect(detectAssistantTopic("Que café você recomenda?")).toBe("COFFEE");
    expect(detectAssistantTopic("Queijo curado com pão?")).toBe("CHEESE");
    expect(detectAssistantTopic("Vinho tinto seco?")).toBe("WINE");
  });

  it("cai em GENERAL sem palavras de catálogo", () => {
    expect(detectAssistantTopic("Que horas são?")).toBe("GENERAL");
  });

  it("desempata pela primeira ocorrência na mensagem", () => {
    expect(detectAssistantTopic("Queijo com vinho")).toBe("CHEESE");
    expect(detectAssistantTopic("Vinho com queijo")).toBe("WINE");
    expect(detectAssistantTopic("Torra do grão com vinho")).toBe("COFFEE");
  });
});

describe("isAssistantMessageInScope", () => {
  it("aceita mensagens com tópico de produto", () => {
    expect(isAssistantMessageInScope("Que horas são para entregar café?")).toBe(
      true,
    );
  });

  it("aceita mensagens de gosto mesmo sem tópico de produto", () => {
    expect(isAssistantMessageInScope("Combina com chocolate?")).toBe(true);
  });

  it("aceita mensagens de comércio", () => {
    expect(isAssistantMessageInScope("Tem estoque?")).toBe(true);
  });

  it("recusa mensagens fora do assunto", () => {
    expect(isAssistantMessageInScope("Você gosta de filmes?")).toBe(false);
  });

  it("recusa mensagens sem tokens úteis", () => {
    expect(isAssistantMessageInScope("")).toBe(false);
    expect(isAssistantMessageInScope("um o de a é")).toBe(false);
  });
});
