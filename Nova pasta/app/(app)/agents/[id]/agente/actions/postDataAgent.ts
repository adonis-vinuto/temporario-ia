"use server";

export async function postDataAgent(formData: FormData): Promise<any> {
  const idAgent = formData.get("idAgent") as string;
  const type = formData.get("type") as string;
  const file = formData.get("file");

  if (!idAgent || !type || !file) {
    throw new Error("Parâmetros inválidos.");
  }

  const tableMap: { [key: string]: string } = {
    colaboradores: "employees",
    salario: "salary_history",
    eventos: "payroll_details",
  };

  const table = tableMap[type];
  if (!table) {
    throw new Error("Tipo de arquivo inválido.");
  }

  const backendFormData = new FormData();
  backendFormData.append("file", file);

  const response = await fetch(
    `${process.env.API_URL}/parseFormattedExcelToDb/${idAgent}?table=${table}`,
    {
      method: "POST",
      body: backendFormData,
    }
  );

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(`Erro ao enviar o arquivo: ${erro}`);
  }

  return await response.json();
}