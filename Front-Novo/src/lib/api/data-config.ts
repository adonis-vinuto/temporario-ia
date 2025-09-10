// src/lib/api/data-config.ts
import serverFetch from "@/lib/api/server-fetch";
import { z } from "zod";
import { DataConfig } from "@/types/interfaces/data-config";
import { DataConfigSchema, PaginatedSchema } from "@/types/schemas/data-config";

// Schemas auxiliares
const PaginatedDataConfigSchema = PaginatedSchema(DataConfigSchema);
const DataConfigArraySchema = z.array(DataConfigSchema);

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

/** Busca a(s) configuração(ões) — retorna somente a primeira (fluxo da sua tela) */
export async function getDataConfig(): Promise<DataConfig | null> {
  const res = await serverFetch<unknown>("/api/data-config", "GET");
  const list = normalizeToList(res);
  return list[0] ?? null;
}

/** (opcional) Caso precise da lista completa em algum lugar */
export async function getDataConfigList(): Promise<DataConfig[]> {
  const res = await serverFetch<unknown>("/api/data-config", "GET");
  return normalizeToList(res);
}

/** Cria e retorna a config criada */
export async function createDataConfig(payload: Partial<DataConfig>): Promise<DataConfig> {
  const res = await serverFetch<unknown>("/api/data-config", "POST", payload);
  // POST pode retornar objeto único ou paginado/array — normalizamos e pegamos a primeira
  const list = normalizeToList(res);
  const first = list[0];
  if (!first) throw new Error("Resposta inválida ao criar configuração");
  return first;
}

/** Atualiza e retorna a config atualizada */
export async function updateDataConfig(id: string, payload: Partial<DataConfig>): Promise<DataConfig> {
  const res = await serverFetch<unknown>(`/api/data-config/${id}`, "PUT", payload);
  const list = normalizeToList(res);
  const first = list[0];
  if (!first) throw new Error("Resposta inválida ao atualizar configuração");
  return first;
}
