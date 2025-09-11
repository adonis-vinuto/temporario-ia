// src/lib/api/data-config.ts
import { z } from "zod";
import { DataConfig } from "@/types/interfaces/data-config.intf";
import { DataConfigSchema } from "@/types/schemas/data-config.schema";
import { PaginatedSchema } from "@/types/schemas/pagination.schema";

const PaginatedDataConfigSchema = PaginatedSchema(DataConfigSchema);
const DataConfigArraySchema = z.array(DataConfigSchema);

const isClient = typeof window !== 'undefined';

function normalizeToList(res: unknown): DataConfig[] {

  const paginated = PaginatedDataConfigSchema.safeParse(res);
  if (paginated.success) return paginated.data.itens;

  const arr = DataConfigArraySchema.safeParse(res);
  if (arr.success) return arr.data;

  const one = DataConfigSchema.safeParse(res);
  if (one.success) return [one.data];

  const parsed = PaginatedDataConfigSchema.or(DataConfigArraySchema).or(DataConfigSchema).safeParse(res);
  if (!parsed.success) {
    throw parsed.error;
  }
  return [];
}

async function fetchDataConfig(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: Partial<DataConfig>
): Promise<unknown> {
  if (isClient) {
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
    const serverFetch = (await import('@/lib/api/server-fetch')).default;
    return serverFetch(endpoint, method, body);
  }
}

export async function getDataConfig(): Promise<DataConfig | null> {
  const res = await fetchDataConfig("/api/data-config", "GET");
  const list = normalizeToList(res);
  return list[0] ?? null;
}

export async function createDataConfig(payload: Partial<DataConfig>): Promise<DataConfig> {
  const res = await fetchDataConfig("/api/data-config", "POST", payload);
  const list = normalizeToList(res);
  const first = list[0];
  if (!first) throw new Error("Resposta inválida ao criar configuração");
  return first;
}

export async function updateDataConfig(id: string, payload: Partial<DataConfig>): Promise<DataConfig> {
  const res = await fetchDataConfig(`/api/data-config/${id}`, "PUT", payload);
  const list = normalizeToList(res);
  const first = list[0];
  if (!first) throw new Error("Resposta inválida ao atualizar configuração");
  return first;
}
