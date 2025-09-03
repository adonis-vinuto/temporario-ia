// app/(app)/knowledges/[module]/[id]/api/hcmImportApi.ts
"use server";

const API_BASE_URL = process.env.API_URL || "";

export interface HcmConnectionTest {
  success: boolean;
  message: string;
  connectionDetails?: {
    wsdlUrl: string;
    username: string;
    connectedAt: string;
  };
}

export interface HcmImportResult {
  success: boolean;
  message: string;
  recordsImported?: number;
  recordsUpdated?: number;
  errors?: string[];
  summary?: {
    employees: number;
    salaryHistories: number;
    payrolls: number;
  };
}

export async function testHcmConnection(integrationId: string): Promise<HcmConnectionTest> {
  const response = await fetch(
    `${API_BASE_URL}/api/integrations/hcm/${integrationId}/test-connection`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao testar conexão: ${errorText}`);
  }

  const result: HcmConnectionTest = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || "Falha na conexão com o HCM Senior");
  }
  
  return result;
}

export async function importHcmData(
  knowledgeId: string, 
  integrationId: string
): Promise<HcmImportResult> {
  const response = await fetch(
    `${API_BASE_URL}/api/people/employee/import-hcm/${knowledgeId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        integrationId: integrationId,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao importar dados do HCM: ${errorText}`);
  }

  const result: HcmImportResult = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || "Falha na importação dos dados");
  }
  
  return result;
}

// Função para buscar dados específicos do HCM (caso necessário)
export async function getHcmEmployees(integrationId: string): Promise<unknown[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/integrations/hcm/${integrationId}/employees`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao buscar colaboradores do HCM: ${errorText}`);
  }

  return response.json();
}

export async function getHcmSalaryHistories(integrationId: string): Promise<unknown[]> {
  const response = await fetch(
    `${API_BASE_URL}/api/integrations/hcm/${integrationId}/salary-histories`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao buscar histórico salarial do HCM: ${errorText}`);
  }

  return response.json();
}