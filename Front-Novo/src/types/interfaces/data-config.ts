// src/types/interfaces/data-config.ts
export interface DataConfig {
  id: string;
  organization?: string;
  sqlHost: string;
  sqlPort: string;
  sqlUser: string;
  sqlPassword: string;
  sqlDatabase: string;
  blobConnectionString?: string;
  blobContainerName?: string;
}

// 👇 tipo genérico de paginação
export interface Paginated<T> {
  totalPaginas: number;
  totalItens: number;
  indice: number;
  tamanhoPagina: number;
  itens: T[];
}
