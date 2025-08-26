// Nextjs/lib/interface/PayrollKnowledge.ts

export interface PayrollKnowledge {
  idEmployee: string;
  idPayroll: string;
  payrollPeriodCod: string;
  eventName: string;
  eventAmount: number;
  eventTypeName: string;
  referenceDate: string;
  calculationTypeName: string;
  employeeCodSeniorNumcad: string;
  collaboratorTypeCodeSeniorTipcol: string;
  companyCodSeniorNumemp: string;
  payrollPeriodCodSeniorCodcal: string;
  eventCodSeniorCodenv: string;
  eventTypeCodSeniorTipeve: string;
  calculationTypeCodSeniorTipcal: string;
}

export interface PayrollKnowledgeRequest {
  "id-employee": string;
  "id-payrooll": string;
  "payroll-period-cod": string;
  "event-name": string;
  "event-amount": number;
  "event-type-name": string;
  "reference-date": string;
  "calculation-type-name": string;
  "employee-cod-senior-numcad": string;
  "collaborator-type-code-senior-tipcol": string;
  "company-cod-senior-numemp": string;
  "payroll-period-cod-senior-codcal": string;
  "event-cod-senior-codenv": string;
  "event-type-cod-senior-tipeve": string;
  "calculation-type-cod-senior-tipcal": string;
}