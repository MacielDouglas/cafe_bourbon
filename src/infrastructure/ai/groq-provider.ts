import Groq, { APIError } from "groq-sdk";
import { GROQ_TIMEOUT_MS, groqModel } from "@/infrastructure/ai/config";
import { getServerEnv } from "@/lib/env";
import type {
  LanguageModelProvider,
  LanguageModelRequest,
} from "@/modules/assistant/application/language-model-provider";

const MAX_COMPLETION_TOKENS = 400;

function logGroqFailure(error: unknown): void {
  if (error instanceof APIError) {
    console.error(
      `[groq] falha na chamada (status ${error.status ?? "desconhecido"}): ${error.message}`,
    );
    return;
  }
  console.error(
    "[groq] falha inesperada:",
    error instanceof Error ? error.message : error,
  );
}

/** Único arquivo que importa `groq-sdk`. Roda apenas no servidor. */
export class GroqLanguageModelProvider implements LanguageModelProvider {
  readonly id = "groq";
  private readonly client: Groq;

  constructor() {
    this.client = new Groq({ apiKey: getServerEnv().GROQ_API_KEY ?? "" });
  }

  async generate({ system, prompt }: LanguageModelRequest): Promise<string> {
    try {
      const completion = await this.client.chat.completions.create(
        {
          model: groqModel(),
          messages: [
            { role: "system", content: system },
            { role: "user", content: prompt },
          ],
          temperature: 0.4,
          max_completion_tokens: MAX_COMPLETION_TOKENS,
          // Mantém o consumo dentro do limite de tokens/minuto do plano gratuito.
          reasoning_effort: "low",
          reasoning_format: "hidden",
        },
        { timeout: GROQ_TIMEOUT_MS },
      );
      const content = completion.choices[0]?.message?.content?.trim() ?? "";
      if (!content) {
        console.error(
          `[groq] resposta vazia (finish_reason=${completion.choices[0]?.finish_reason ?? "desconhecido"})`,
        );
      }
      return content;
    } catch (error) {
      logGroqFailure(error);
      throw error;
    }
  }
}
