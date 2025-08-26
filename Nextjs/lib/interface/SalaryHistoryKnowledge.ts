export interface SalaryHistoryKnowledge {
  idEmployee: string;
  idSalaryHistory: string;
  changeDate: string;
  newSalary: number;
  motiveName: string;
  employeeCodSeniorNumcad: string;
  collaboratorTypeCodeSeniorTipcol: string;
  companyCodSeniorNumemp: string;
  motiveCodSeniorCodmot: string;
}

export interface SalaryHistoryKnowledgeRequest {
  "id-employee": string;
  "id-salary-history": string;
  "change-date": string;
  "new-salary": number;
  "motive-name": string;
  "employee-cod-senior-numcad": string;
  "collaborator-type-code-senior-tipcol": string;
  "company-cod-senior-numemp": string;
  "motive_cod_senior_codmot": string;
}