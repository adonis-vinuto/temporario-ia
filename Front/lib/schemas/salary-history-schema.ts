import { z } from "zod";

export const salaryHistoryFormSchema = z.object({
  idEmployee: z.string().min(1, "Colaborador é obrigatório"),
  changeDate: z.string().min(1, "Data da alteração é obrigatória"),
  newSalary: z
    .number({ invalid_type_error: "Novo salário deve ser um número" })
    .positive("Novo salário deve ser maior que zero"),
  motiveName: z.string().min(1, "Motivo é obrigatório"),
  motiveCodSeniorCodmot: z
    .string()
    .optional(), // só exigido em edição/visualização
});

export type SalaryHistoryFormSchema = z.infer<typeof salaryHistoryFormSchema>;