import { z } from "zod";

// n8n webhook URL
const API_URL = "https://zoleon.app.n8n.cloud/webhook/68819970-dbf1-49df-8e8b-d8c871e7301c";

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
      // Block potentially dangerous patterns
      const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i, // onclick=, onerror=, etc.
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

/**
 * Validates a user query before sending to the API
 */
export function validateQuery(query: string): QueryValidationResult {
  const result = querySchema.safeParse(query);
  
  if (!result.success) {
    const errorMessage = result.error.errors[0]?.message || "Consulta inválida";
    return { success: false, error: errorMessage };
  }
  
  return { success: true, data: result.data };
}

/**
 * Check if the API is configured
 */
export function isApiConfigured(): boolean {
  return Boolean(API_URL);
}

/**
 * Get API URL (for components that need it)
 */
export function getApiUrl(): string {
  return API_URL;
}

/**
 * Get fetch timeout
 */
export function getFetchTimeout(): number {
  return FETCH_TIMEOUT;
}

/**
 * Safely make API request with validation
 */
export async function fetchWithValidation(
  query: string,
  signal?: AbortSignal
): Promise<{ data?: unknown; error?: string }> {
  // Validate query first
  const validation = validateQuery(query);
  if (validation.success === false) {
    return { error: validation.error };
  }
  const validatedQuery = validation.data;

  // Check if API is configured
  if (!isApiConfigured()) {
    return { error: "API não configurada. Configure a variável de ambiente VITE_N8N_WEBHOOK_URL." };
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: validatedQuery }),
      signal,
    });

    if (!res.ok) {
      const errorText = await res.text();
      return { error: `Erro na API: ${res.status} - ${errorText}` };
    }

    const rawText = await res.text();
    
    try {
      const data = JSON.parse(rawText);
      return { data };
    } catch {
      return { error: "Resposta inválida do servidor (não é JSON válido)" };
    }
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        return { 
          error: `Timeout: o servidor não respondeu em ${FETCH_TIMEOUT / 1000}s.` 
        };
      }
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        return { 
          error: "Erro de rede. Verifique sua conexão com a internet." 
        };
      }
      return { error: err.message };
    }
    return { error: "Erro desconhecido ao consultar a API" };
  }
}
