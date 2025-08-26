"use server";

export async function sendPdf(idAgent: number, file: File): Promise<any> {
  const response = await fetch(
    `${process.env.API_URL}/extractPdfDataFunction/${idAgent}`,
    {
      method: "POST",
      headers: {
        // Define apenas o tipo correto do arquivo (PDF)
        "Content-Type": "application/pdf",
        // Optional: você pode simular um nome de arquivo
        "Content-Disposition": `attachment; filename="${file.name}"`,
      },
      body: file, // <-- envia o binário direto
    }
  );

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(`Erro ao enviar PDF: ${erro}`);
  }

  return await response.json().catch(() => ({})); // se não tiver JSON de volta
}
