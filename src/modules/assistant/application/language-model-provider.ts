export interface LanguageModelRequest {
  system: string;
  prompt: string;
}

/** Porta de modelo de linguagem. Implementações ficam na infraestrutura (ex.: Groq). */
export interface LanguageModelProvider {
  readonly id: string;
  generate(request: LanguageModelRequest): Promise<string>;
}
