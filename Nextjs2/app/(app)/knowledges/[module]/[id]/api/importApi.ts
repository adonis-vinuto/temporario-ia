// app/(app)/knowledges/[module]/[id]/api/importApi.ts
"use server";

const API_BASE_URL = process.env.API_URL || "";

export interface ImportResult {
  success: boolean;
  message: string;
  recordsImported?: number;
  errors?: string[];
}

export async function importExcelData(
  knowledgeId: string, 
  formData: FormData
): Promise<ImportResult> {
  const response = await fetch(
    `${API_BASE_URL}/api/people/employee/import/${knowledgeId}`,
    {
      method: "POST",
      body: formData, // FormData já tem o Content-Type correto
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao importar dados: ${errorText}`);
  }

  const result: ImportResult = await response.json();
  return result;
}

export async function downloadExcelTemplate(): Promise<Blob> {
  const response = await fetch(
    `${API_BASE_URL}/api/people/employee/template`,
    {
      method: "GET",
      headers: {
        "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao baixar modelo Excel");
  }

  return response.blob();
}