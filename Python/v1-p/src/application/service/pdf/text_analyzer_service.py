import re
from fastapi import HTTPException
from src.infrastructure.llm.groq_llm_client import GroqLLMClient
from src.domain.schema.file.pdf_schemas import TextAnalyzerRequest, TextAnalyzerResponse

class TextAnalyzerService:
    """
    Serviço responsável por analisar o texto extraído de PDFs,
    controlar o tamanho do prompt e orquestrar a chamada à LLM.
    """

    # MAX_PROMPT_LENGTH = 2000  # limite máximo fixo de caracteres para o texto

    def __init__(self, llm_client: GroqLLMClient):
        self.llm_client = llm_client

    async def execute(self, request: TextAnalyzerRequest) -> TextAnalyzerResponse:
        extracted_text = request.extracted_text
        query = request.query

        # 1. Validação de texto vazio ou muito curto
        if not extracted_text or len(extracted_text.strip()) < 5:
            raise HTTPException(status_code=400, detail="Texto muito curto ou vazio.")

        # 2. Normalizar espaços: remover múltiplos espaços e quebras de linha
        normalized_text = re.sub(r"\s+", " ", extracted_text).strip()

        # 3. Limitar tamanho do texto (caracteres)
        # if len(normalized_text) > self.MAX_PROMPT_LENGTH:
        #     raise HTTPException(
        #         status_code=400,
        #         detail=f"Texto muito longo. Limite máximo é {self.MAX_PROMPT_LENGTH} caracteres.",
        #     )

        prompt = [
            (
                "system",
                "Você é um assistente que resume textos e responde perguntas sobre o conteúdo fornecido. Sempre retorne dois campos, separados e identificados: 'Resumo:' e 'Resposta:'. Se não houver pergunta, retorne 'Resposta:' como 'Nenhuma pergunta fornecida'."
            ),
            (
                "human",
                (
                    f"Texto: {normalized_text}\n"
                    "Resuma o texto acima de forma clara e objetiva.\n"
                    + (
                        f"Pergunta: {query}\nResponda à pergunta com base no texto."
                        if query and query.strip()
                        else "Não há pergunta. Retorne 'Resposta:' como 'Nenhuma pergunta fornecida'."
                    )
                )
            )
        ]

        response = await self.llm_client.invoke(prompt)
        content = response["content"]

        # Separar o resumo e a resposta usando regex simples
        summary_match = re.search(r"Resumo:(.*?)(Resposta:|$)", content, re.DOTALL)
        answer_match = re.search(r"Resposta:(.*)", content, re.DOTALL)

        summary = summary_match.group(1).strip() if summary_match else ""
        answer = answer_match.group(1).strip() if answer_match else None

        return TextAnalyzerResponse(
            summary=summary,
            answer=answer,
            usage=response.get("usage"),
        )

def get_analyze_text_service() -> TextAnalyzerService:
    llm_client = GroqLLMClient()
    service = TextAnalyzerService(llm_client)
    return service