"use server";

export async function postIntegracaoAgent(formData: FormData): Promise<any> {
  const idAgent = formData.get("idAgent") as string;


  if (!idAgent) {
    throw new Error("Parâmetros inválidos.");
  }



  const response = await fetch(
    `${process.env.API_URL}/integracaoFunction/${idAgent}`,
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