"use server";

export async function sendImage(idAgent: number, file: File): Promise<any> {
  const response = await fetch(
    `${process.env.API_URL}/extractImageDataFunction/${idAgent}`,
    {
      method: "POST",
      headers: {
        "Content-Type": file.type,
        "Content-Disposition": `attachment; filename="${file.name}"`,
      },
      body: file,
    }
  );

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(`Erro ao enviar imagem: ${erro}`);
  }

  return await response.json().catch(() => ({}));
}