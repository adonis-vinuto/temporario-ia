"use server";

export async function postResumePdf(formData: FormData): Promise<any> {
  const pdf_id = formData.get("pdf_id") as string;

  const response = await fetch(
    `${process.env.API_URL}/refinePdfData/${pdf_id}`,
    {
      method: "POST"
    }
  );

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(`Erro ao enviar o arquivo: ${erro}`);
  }

  return await response.json();
}