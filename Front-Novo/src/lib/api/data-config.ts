// src/lib/api/data-config.ts
import { z } from "zod";
import { DataConfig } from "@/types/interfaces/data-config";
import { DataConfigSchema, PaginatedSchema } from "@/types/schemas/data-config";

// Schemas auxiliares
const PaginatedDataConfigSchema = PaginatedSchema(DataConfigSchema);
const DataConfigArraySchema = z.array(DataConfigSchema);

// Função auxiliar para detectar se está no cliente
const isClient = typeof window !== 'undefined';

// Normaliza qualquer resposta em: lista de DataConfig
function normalizeToList(res: unknown): DataConfig[] {
  // 1) Paginated
  const paginated = PaginatedDataConfigSchema.safeParse(res);
  if (paginated.success) return paginated.data.itens;

  // 2) Array direto
  const arr = DataConfigArraySchema.safeParse(res);
  if (arr.success) return arr.data;

  // 3) Objeto único
  const one = DataConfigSchema.safeParse(res);
  if (one.success) return [one.data];

  // Se nada bate, lança erro de validação
  const parsed = PaginatedDataConfigSchema.or(DataConfigArraySchema).or(DataConfigSchema).safeParse(res);
  if (!parsed.success) {
    throw parsed.error;
  }
  return [];
}

/** 
 * Função de fetch que funciona tanto no cliente quanto no servidor
 * No cliente, usa a API Route local como proxy
 * No servidor, usa serverFetch direto
 */
async function fetchDataConfig(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: Partial<DataConfig>
): Promise<unknown> {
  if (isClient) {
    // No cliente, usar a API Route local
    const url = method === 'PUT' && endpoint.includes('/') 
      ? `/api/data-config?id=${endpoint.split('/').pop()}`
      : '/api/data-config';
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    
    return response.json();
  } else {
    // No servidor, usar serverFetch
    const serverFetch = (await import('@/lib/api/server-fetch')).default;
    return serverFetch(endpoint, method, body);
  }
}

/** Busca a(s) configuração(ões) — retorna somente a primeira */
export async function getDataConfig(): Promise<DataConfig | null> {
  const res = await fetchDataConfig("/api/data-config", "GET");
  const list = normalizeToList(res);
  return list[0] ?? null;
}

/** Cria e retorna a config criada */
export async function createDataConfig(payload: Partial<DataConfig>): Promise<DataConfig> {
  const res = await fetchDataConfig("/api/data-config", "POST", payload);
  const list = normalizeToList(res);
  const first = list[0];
  if (!first) throw new Error("Resposta inválida ao criar configuração");
  return first;
}

/** Atualiza e retorna a config atualizada */
export async function updateDataConfig(id: string, payload: Partial<DataConfig>): Promise<DataConfig> {
  const res = await fetchDataConfig(`/api/data-config/${id}`, "PUT", payload);
  const list = normalizeToList(res);
  const first = list[0];
  if (!first) throw new Error("Resposta inválida ao atualizar configuração");
  return first;
}