// lib/schemas/payrollSchema.ts
import { z } from "zod";

export const payrollFormSchema = z.object({
    idEmployee: z
        .string()
        .min(1, "ID do funcionário é obrigatório"),

    payrollPeriodCod: z
        .string()
        .min(1, "Código do período é obrigatório"),

    referenceDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Preencha o campo de data"),


    calculationTypeName: z
        .enum(["VALOR", "PERCENTUAL", "QUANTIDADE"], {
            errorMap: () => ({ message: "Selecione um tipo de cálculo válido" }),
        }),

    eventName: z
        .string()
        .min(1, "Nome do evento é obrigatório"),

    eventAmount: z
        .number({ invalid_type_error: "Valor do evento deve ser numérico" })
        .nonnegative("O valor não pode ser negativo"),

    eventTypeName: z
        .enum(["PROVENTO", "DESCONTO", "BASE"], {
            errorMap: () => ({ message: "Selecione um tipo de evento válido" }),
        }),

    employeeCodSeniorNumcad: z
        .string()
        .min(1, "Código Senior do funcionário é obrigatório"),

    collaboratorTypeCodeSeniorTipcol: z
        .string()
        .min(1, "Código Senior do tipo colaborador é obrigatório"),

    companyCodSeniorNumemp: z
        .string()
        .min(1, "Código Senior da empresa é obrigatório"),

    payrollPeriodCodSeniorCodcal: z
        .string()
        .min(1, "Código Senior do período é obrigatório"),

    eventCodSeniorCodenv: z
        .string()
        .min(1, "Código Senior do evento é obrigatório"),

    eventTypeCodSeniorTipeve: z
        .string()
        .min(1, "Código Senior do tipo de evento é obrigatório"),

    calculationTypeCodSeniorTipcal: z
        .string()
        .min(1, "Código Senior do tipo de cálculo é obrigatório"),
});

export type PayrollFormSchema = z.infer<typeof payrollFormSchema>;
