import { z } from "zod";

// Timeout in milliseconds (60 seconds)
const FETCH_TIMEOUT = 60000;

// Query validation schema with security constraints
export const querySchema = z
  .string()
  .min(1, "A consulta não pode estar vazia")
  .max(500, "A consulta deve ter no máximo 500 caracteres")
  .trim()
  .refine(
    (val) => {
      const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /data:/i,
        /vbscript:/i,
      ];
      return !dangerousPatterns.some((pattern) => pattern.test(val));
    },
    { message: "A consulta contém caracteres não permitidos" }
  );

export type QueryValidationResult = 
  | { success: true; data: string }
  | { success: false; error: string };

export function validateQuery(query: string): QueryValidationResult {
  const result = querySchema.safeParse(query);
  if (!result.success) {
    const errorMessage = result.error.errors[0]?.message || "Consulta inválida";
    return { success: false, error: errorMessage };
  }
  return { success: true, data: result.data };
}

export function getFetchTimeout(): number {
  return FETCH_TIMEOUT;
}

/**
 * Safely make API request directly to n8n webhook
 */
export async function fetchWithValidation(
  query: string,
  signal?: AbortSignal
): Promise<{ data?: unknown; error?: string }> {
  const validation = validateQuery(query);
  if (validation.success === false) {
    return { error: validation.error };
  }

  try {
    const N8N_WEBHOOK_URL = "https://leohar.app.n8n.cloud/webhook/68819970-dbf1-49df-8e8b-d8c871e7301c";

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: validation.data }),
      signal: signal
    });

    if (!response.ok) {
      return { error: "Erro ao processar a solicitação no n8n. Tente novamente." };
    }

    const data = await response.json();

    if (data?.error) {
      return { error: data.error };
    }

    return { data };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { error: `Timeout: o servidor não respondeu em ${FETCH_TIMEOUT / 1000}s.` };
    }
    return { error: "Erro de rede. Verifique sua conexão com a internet." };
  }
}