// src/types/schemas/data-config.schema.ts
import { z } from "zod";

export const DataConfigSchema = z.object({
  id: z.string().uuid(),
  organization: z.string().optional(),
  sqlHost: z.string().min(1, "Host SQL é obrigatório"),
  sqlPort: z.string().min(1, "Porta SQL é obrigatória"),
  sqlUser: z.string().min(1, "Usuário SQL é obrigatório"),
  sqlPassword: z.string().min(1, "Senha SQL é obrigatória"),
  sqlDatabase: z.string().min(1, "Banco de dados SQL é obrigatório"),
  blobConnectionString: z.string().optional(),
  blobContainerName: z.string().optional(),
});

export const DataConfigCreateSchema = z.object({
  sqlHost: z.string().min(1, "Host SQL é obrigatório"),
  sqlPort: z.string().min(1, "Porta SQL é obrigatória"),
  sqlUser: z.string().min(1, "Usuário SQL é obrigatório"),
  sqlPassword: z.string().min(1, "Senha SQL é obrigatória"),
  sqlDatabase: z.string().min(1, "Banco de dados SQL é obrigatório"),
  blobConnectionString: z.string().optional(),
  blobContainerName: z.string().optional(),
});

export type TDataConfig = z.infer<typeof DataConfigSchema>;
export type TDataConfigCreate = z.infer<typeof DataConfigCreateSchema>;
