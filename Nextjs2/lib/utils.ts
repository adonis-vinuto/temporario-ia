import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function enumKeys<E extends object>(e: E): (keyof E)[] {
  return Object.keys(e).filter((k) => isNaN(Number(k))) as (keyof E)[];
}

export function formatDateBR(date: string | Date) {
  return format(new Date(date), "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
}
