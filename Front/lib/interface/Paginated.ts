export interface Paginated<T> {
  totalPaginas: number;
  totalItens: number;
  indice: number;
  tamanhoPagina: number;
  itens: T[];
}
