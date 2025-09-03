"use server";

import { 
  SalaryHistoryKnowledge, 
  SalaryHistoryKnowledgeRequest 
} from "@/lib/interface/SalaryHistoryKnowledge";

const API_BASE_URL = process.env.API_URL || "";

export async function getSalaryHistories(knowledgeId: string): Promise<SalaryHistoryKnowledge[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/people/salary-history/${knowledgeId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar histórico de salários");
  }

  const data = await response.json();
  
  // Transform kebab-case to camelCase
  return data.map((item: SalaryHistoryKnowledgeRequest) => ({
    idEmployee: item["id-employee"],
    idSalaryHistory: item["id-salary-history"],
    changeDate: item["change-date"],
    newSalary: item["new-salary"],
    motiveName: item["motive-name"],
    employeeCodSeniorNumcad: item["employee-cod-senior-numcad"],
    collaboratorTypeCodeSeniorTipcol: item["collaborator-type-code-senior-tipcol"],
    companyCodSeniorNumemp: item["company-cod-senior-numemp"],
    motiveCodSeniorCodmot: item["motive_cod_senior_codmot"],
  }));
}

export async function getSalaryHistoryById(
  knowledgeId: string,
  salaryHistoryId: string
): Promise<SalaryHistoryKnowledge> {
  const response = await fetch(
    `${API_BASE_URL}/api/people/salary-history/${knowledgeId}/${salaryHistoryId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar histórico de salário");
  }

  const item = await response.json();
  
  return {
    idEmployee: item["id-employee"],
    idSalaryHistory: item["id-salary-history"],
    changeDate: item["change-date"],
    newSalary: item["new-salary"],
    motiveName: item["motive-name"],
    employeeCodSeniorNumcad: item["employee-cod-senior-numcad"],
    collaboratorTypeCodeSeniorTipcol: item["collaborator-type-code-senior-tipcol"],
    companyCodSeniorNumemp: item["company-cod-senior-numemp"],
    motiveCodSeniorCodmot: item["motive_cod_senior_codmot"],
  };
}

export async function createSalaryHistory(
  knowledgeId: string,
  data: SalaryHistoryKnowledgeRequest
): Promise<SalaryHistoryKnowledge> {
  const response = await fetch(
    `${API_BASE_URL}/api/people/salary-history/${knowledgeId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao criar histórico de salário");
  }

  const item = await response.json();
  
  return {
    idEmployee: item["id-employee"],
    idSalaryHistory: item["id-salary-history"],
    changeDate: item["change-date"],
    newSalary: item["new-salary"],
    motiveName: item["motive-name"],
    employeeCodSeniorNumcad: item["employee-cod-senior-numcad"],
    collaboratorTypeCodeSeniorTipcol: item["collaborator-type-code-senior-tipcol"],
    companyCodSeniorNumemp: item["company-cod-senior-numemp"],
    motiveCodSeniorCodmot: item["motive_cod_senior_codmot"],
  };
}

export async function updateSalaryHistory(
  knowledgeId: string,
  salaryHistoryId: string,
  data: SalaryHistoryKnowledgeRequest
): Promise<SalaryHistoryKnowledge> {
  const response = await fetch(
    `${API_BASE_URL}/api/people/salary-history/${knowledgeId}/${salaryHistoryId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao atualizar histórico de salário");
  }

  const item = await response.json();
  
  return {
    idEmployee: item["id-employee"],
    idSalaryHistory: item["id-salary-history"],
    changeDate: item["change-date"],
    newSalary: item["new-salary"],
    motiveName: item["motive-name"],
    employeeCodSeniorNumcad: item["employee-cod-senior-numcad"],
    collaboratorTypeCodeSeniorTipcol: item["collaborator-type-code-senior-tipcol"],
    companyCodSeniorNumemp: item["company-cod-senior-numemp"],
    motiveCodSeniorCodmot: item["motive_cod_senior_codmot"],
  };
}

export async function deleteSalaryHistory(
  knowledgeId: string,
  salaryHistoryId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/people/salary-history/${knowledgeId}/${salaryHistoryId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao deletar histórico de salário");
  }
}