import Groq from "groq-sdk";
import { GROQ_TIMEOUT_MS, groqModel } from "@/infrastructure/ai/config";
import { getServerEnv } from "@/lib/env";
import type {
  LanguageModelProvider,
  LanguageModelRequest,
} from "@/modules/assistant/application/language-model-provider";

/** Único arquivo que importa `groq-sdk`. Roda apenas no servidor. */
export class GroqLanguageModelProvider implements LanguageModelProvider {
  readonly id = "groq";
  private readonly client: Groq;

  constructor() {
    this.client = new Groq({ apiKey: getServerEnv().GROQ_API_KEY ?? "" });
  }

  async generate({ system, prompt }: LanguageModelRequest): Promise<string> {
    const completion = await this.client.chat.completions.create(
      {
        model: groqModel(),
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 500,
      },
      { timeout: GROQ_TIMEOUT_MS },
    );
    return completion.choices[0]?.message?.content?.trim() ?? "";
  }
}
