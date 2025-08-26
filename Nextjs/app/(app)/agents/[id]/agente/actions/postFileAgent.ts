"use server";

export async function postFileAgent(formData: FormData): Promise<any> {
  const idAgent = formData.get("idAgent") as string;
  const type = formData.get("type") as string;
  const file = formData.get("file");

  if (!idAgent || !type || !file) {
    throw new Error("Parâmetros inválidos.");
  }

  // const pdf_typeMap: { [key: string]: string } = {
  //   Rh_DocumentoTreinamentoCapacitacao: "Rh_DocumentoTreinamentoCapacitacao",
  //   Rh_PoliticasNormasInternas: "Rh_PoliticasNormasInternas",
  //   Rh_ProcessosFluxos: "Rh_ProcessosFluxos",
  //   Rh_ModelosDocumentos: "Rh_ModelosDocumentos",
  //   Rh_FAQs: "Rh_FAQs",
  //   Rh_CalendárioEventos: "Rh_CalendarioEventos",
  // };

  // const pdf_type = pdf_typeMap[type];
  // if (!pdf_type) {
  //   throw new Error("Tipo de arquivo inválido.");
  // }

  const backendFormData = new FormData();
  backendFormData.append("file", file);

  const response = await fetch(
    `${process.env.API_URL}/extractPdf/${idAgent}?pdf_type=${type}`,
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