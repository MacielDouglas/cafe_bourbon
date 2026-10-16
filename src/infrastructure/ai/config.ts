export const GROQ_TIMEOUT_MS = 15_000;

export const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";

/** Modelo centralizado: `GROQ_MODEL` no servidor, com padrão estável. */
export function groqModel(): string {
  return process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;
}
