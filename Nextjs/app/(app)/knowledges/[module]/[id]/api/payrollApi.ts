// Nextjs/app/(app)/knowledges/[module]/[id]/api/payrollApi.ts

"use server";

import { PayrollKnowledge, PayrollKnowledgeRequest } from "@/lib/interface/PayrollKnowledge";

const API_BASE_URL = process.env.API_URL || "";

export async function getPayrolls(knowledgeId: string): Promise<PayrollKnowledge[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/people/payrooll/${knowledgeId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar dados de pagamento");
  }

  // Mapear os campos do response para o formato camelCase
  const data = await response.json();
  return data.map((item: any) => ({
    idEmployee: item["id-employee"],
    idPayroll: item["id-payrooll"],
    payrollPeriodCod: item["payroll-period-cod"],
    eventName: item["event-name"],
    eventAmount: item["event-amount"],
    eventTypeName: item["event-type-name"],
    referenceDate: item["reference-date"],
    calculationTypeName: item["calculation-type-name"],
    employeeCodSeniorNumcad: item["employee-cod-senior-numcad"],
    collaboratorTypeCodeSeniorTipcol: item["collaborator-type-code-senior-tipcol"],
    companyCodSeniorNumemp: item["company-cod-senior-numemp"],
    payrollPeriodCodSeniorCodcal: item["payroll-period-cod-senior-codcal"],
    eventCodSeniorCodenv: item["event-cod-senior-codenv"],
    eventTypeCodSeniorTipeve: item["event-type-cod-senior-tipeve"],
    calculationTypeCodSeniorTipcal: item["calculation-type-cod-senior-tipcal"],
  }));
}

export async function getPayrollById(
  knowledgeId: string,
  payrollId: string
): Promise<PayrollKnowledge> {
  const response = await fetch(
    `${API_BASE_URL}/api/people/payrooll/${knowledgeId}/${payrollId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar dados de pagamento");
  }

  const data = await response.json();
  return {
    idEmployee: data["id-employee"],
    idPayroll: data["id-payrooll"],
    payrollPeriodCod: data["payroll-period-cod"],
    eventName: data["event-name"],
    eventAmount: data["event-amount"],
    eventTypeName: data["event-type-name"],
    referenceDate: data["reference-date"],
    calculationTypeName: data["calculation-type-name"],
    employeeCodSeniorNumcad: data["employee-cod-senior-numcad"],
    collaboratorTypeCodeSeniorTipcol: data["collaborator-type-code-senior-tipcol"],
    companyCodSeniorNumemp: data["company-cod-senior-numemp"],
    payrollPeriodCodSeniorCodcal: data["payroll-period-cod-senior-codcal"],
    eventCodSeniorCodenv: data["event-cod-senior-codenv"],
    eventTypeCodSeniorTipeve: data["event-type-cod-senior-tipeve"],
    calculationTypeCodSeniorTipcal: data["calculation-type-cod-senior-tipcal"],
  };
}

export async function createPayroll(
  knowledgeId: string,
  data: PayrollKnowledgeRequest
): Promise<PayrollKnowledge> {
  const response = await fetch(
    `${API_BASE_URL}/api/people/payrooll/${knowledgeId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao criar dados de pagamento");
  }

  const responseData = await response.json();
  return {
    idEmployee: responseData["id-employee"],
    idPayroll: responseData["id-payrooll"],
    payrollPeriodCod: responseData["payroll-period-cod"],
    eventName: responseData["event-name"],
    eventAmount: responseData["event-amount"],
    eventTypeName: responseData["event-type-name"],
    referenceDate: responseData["reference-date"],
    calculationTypeName: responseData["calculation-type-name"],
    employeeCodSeniorNumcad: responseData["employee-cod-senior-numcad"],
    collaboratorTypeCodeSeniorTipcol: responseData["collaborator-type-code-senior-tipcol"],
    companyCodSeniorNumemp: responseData["company-cod-senior-numemp"],
    payrollPeriodCodSeniorCodcal: responseData["payroll-period-cod-senior-codcal"],
    eventCodSeniorCodenv: responseData["event-cod-senior-codenv"],
    eventTypeCodSeniorTipeve: responseData["event-type-cod-senior-tipeve"],
    calculationTypeCodSeniorTipcal: responseData["calculation-type-cod-senior-tipcal"],
  };
}

export async function updatePayroll(
  knowledgeId: string,
  payrollId: string,
  data: PayrollKnowledgeRequest
): Promise<PayrollKnowledge> {
  const response = await fetch(
    `${API_BASE_URL}/api/people/payrooll/${knowledgeId}/${payrollId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao atualizar dados de pagamento");
  }

  const responseData = await response.json();
  return {
    idEmployee: responseData["id-employee"],
    idPayroll: responseData["id-payrooll"],
    payrollPeriodCod: responseData["payroll-period-cod"],
    eventName: responseData["event-name"],
    eventAmount: responseData["event-amount"],
    eventTypeName: responseData["event-type-name"],
    referenceDate: responseData["reference-date"],
    calculationTypeName: responseData["calculation-type-name"],
    employeeCodSeniorNumcad: responseData["employee-cod-senior-numcad"],
    collaboratorTypeCodeSeniorTipcol: responseData["collaborator-type-code-senior-tipcol"],
    companyCodSeniorNumemp: responseData["company-cod-senior-numemp"],
    payrollPeriodCodSeniorCodcal: responseData["payroll-period-cod-senior-codcal"],
    eventCodSeniorCodenv: responseData["event-cod-senior-codenv"],
    eventTypeCodSeniorTipeve: responseData["event-type-cod-senior-tipeve"],
    calculationTypeCodSeniorTipcal: responseData["calculation-type-cod-senior-tipcal"],
  };
}

export async function deletePayroll(
  knowledgeId: string,
  payrollId: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/people/payrooll/${knowledgeId}/${payrollId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao deletar dados de pagamento");
  }
}