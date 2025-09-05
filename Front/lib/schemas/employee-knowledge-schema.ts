import { z } from "zod";

export const employeeKnowledgeSchema = z.object({
  idEmployee: z.string().min(1, "ID do funcionário é obrigatório"),
  companyName: z.string().min(1, "Nome da empresa é obrigatório"),
  fullName: z.string().min(1, "Nome completo é obrigatório"),
  admissionDate: z.string().min(1, "Data de admissão é obrigatória"),
  terminationDate: z.string().optional(),
  statusDescription: z.string().min(1, "Status é obrigatório"),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  costCenterName: z.string().min(1, "Centro de custo é obrigatório"),
  salary: z.number().nonnegative("Salário não pode ser negativo"),
  complementarySalary: z.number().nonnegative("Salário complementar não pode ser negativo"),
  salaryEffectiveDate: z.string().min(1, "Data efetiva do salário é obrigatória"),
  gender: z.string().min(1, "Gênero é obrigatório"),
  streetAddress: z.string().min(1, "Endereço é obrigatório"),
  addressNumber: z.string().min(1, "Número é obrigatório"),
  cityName: z.string().min(1, "Cidade é obrigatória"),
  race: z.string().min(1, "Raça é obrigatória"),
  postalCode: z.string().min(1, "CEP é obrigatório"),
  companyCodSeniorNumemp: z.string().min(1, "Código empresa é obrigatório"),
  employeeCodSeniorNumcad: z.string().min(1, "Código funcionário é obrigatório"),
  collaboratorTypeCodeSeniorTipcol: z.string().min(1, "Tipo de colaborador é obrigatório"),
  statusCodSeniorSitafa: z.string().min(1, "Status código é obrigatório"),
  costCenterCodSeniorCodccu: z.string().min(1, "Código do centro de custo é obrigatório"),
});

// tipo inferido automaticamente
export type EmployeeKnowledgeForm = z.infer<typeof employeeKnowledgeSchema>;
