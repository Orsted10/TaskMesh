import Groq from 'groq-sdk';

/**
 * Prioritized list of active Groq models.
 * 'qwen/qwen3.8-27b' is active and supports fast JSON mode & deep reasoning.
 * Llama and OpenAI models are included as fallbacks.
 */
export const GROQ_MODEL_PRIORITY: string[] = [
  process.env.GROQ_MODEL,
  'qwen/qwen3.8-27b',
  'qwen/qwen3.6-27b',
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
].filter(Boolean) as string[];

let groqInstance: Groq | null = null;

export function getGroqClient(): Groq {
  if (!groqInstance) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured in environment variables.');
    }
    groqInstance = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqInstance;
}

export type GroqChatCompletionParams = {
  messages: Array<any>;
  model?: string;
  temperature?: number;
  response_format?: { type: 'json_object' | 'text' };
  max_tokens?: number;
  [key: string]: any;
};

/**
 * Executes a Groq chat completion with automatic fallback to alternate models
 * if the requested model returns a 404 (model_not_found) or 400 (decommissioned).
 */
export async function createGroqChatCompletion(
  groq: Groq,
  params: GroqChatCompletionParams
) {
  const modelsToTry = [
    params.model,
    ...GROQ_MODEL_PRIORITY.filter((m) => m !== params.model),
  ].filter(Boolean) as string[];

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await groq.chat.completions.create({
        ...params,
        model,
      } as any);
      return response;
    } catch (err: any) {
      console.warn(`[Groq] Model "${model}" failed (${err?.status || 'ERR'}):`, err?.message?.substring?.(0, 100) || err);
      lastError = err;

      // Fallback if model is missing, decommissioned, or unauthorized
      const isModelError =
        err?.status === 404 ||
        err?.status === 400 ||
        (typeof err?.message === 'string' && (
          err.message.includes('does not exist') ||
          err.message.includes('decommissioned') ||
          err.message.includes('model_not_found') ||
          err.message.includes('do not have access to it')
        ));

      if (isModelError) {
        continue;
      }

      // If it's a rate limit or bad request not related to model name, throw immediately
      throw err;
    }
  }

  throw lastError;
}
