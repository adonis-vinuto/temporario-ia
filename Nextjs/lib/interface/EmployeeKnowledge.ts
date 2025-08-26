export interface EmployeeKnowledge {
  idEmployee: string;
  companyName: string;
  fullName: string;
  admissionDate: string;
  terminationDate?: string;
  statusDescription: string;
  birthDate: string;
  costCenterName: string;
  salary: number;
  complementarySalary: number;
  salaryEffectiveDate: string;
  gender: string;
  streetAddress: string;
  addressNumber: string;
  cityName: string;
  race: string;
  postalCode: string;
  companyCodSeniorNumemp: string;
  employeeCodSeniorNumcad: string;
  collaboratorTypeCodeSeniorTipcol: string;
  statusCodSeniorSitafa: string;
  costCenterCodSeniorCodccu: string;
}

export interface EmployeeKnowledgeRequest {
  "id-employee": string;
  "company-name": string;
  "full-name": string;
  "admission-date": string;
  "termination-date"?: string;
  "status-description": string;
  "birth-date": string;
  "cost-center-name": string;
  "salary": number;
  "complementary-salary": number;
  "salary-effective-date": string;
  "gender": string;
  "street-address": string;
  "address-number": string;
  "city-name": string;
  "race": string;
  "postal-code": string;
  "company-cod-senior-numemp": string;
  "employee-cod-senior-numcad": string;
  "collaborator-type-code-senior-tipcol": string;
  "status-cod-senior-sitafa": string;
  "cost-center-cod-senior-codccu": string;
}