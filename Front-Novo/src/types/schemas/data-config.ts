import { z } from "zod";

// Schema completo (como vem do backend)
export const DataConfigSchema = z.object({
  id: z.string().uuid(), // id pode não existir no create
  organization: z.string().optional(),
  sqlHost: z.string().min(1, "Host é obrigatório"),
  sqlPort: z.string().min(1, "Porta é obrigatória"),
  sqlUser: z.string().min(1, "Usuário é obrigatório"),
  sqlPassword: z.string().min(1, "Senha é obrigatória"),
  sqlDatabase: z.string().min(1, "Banco de dados é obrigatório"),
  blobConnectionString: z.string().optional(),
  blobContainerName: z.string().optional(),
});

// Schema só para criação/edição (sem id/organization)
export const DataConfigCreateSchema = DataConfigSchema.omit({
  id: true,
  organization: true,
});

export const PaginatedSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    totalPaginas: z.number(),
    totalItens: z.number(),
    indice: z.number(),
    tamanhoPagina: z.number(),
    itens: z.array(item),
  });

// Tipos inferidos do Zod
export type TDataConfig = z.infer<typeof DataConfigSchema>;
export type TDataConfigCreate = z.infer<typeof DataConfigCreateSchema>;