import re
from fastapi import HTTPException
from src.infrastructure.llm.groq_llm_client import GroqLLMClient
from src.domain.schema.enhance.text_enhancer_schema import TextEnhancerRequest, TextEnhancerResponse

class EnhanceTextService:
    """
    Serviço responsável por validar e processar o texto,
    controlar o tamanho do prompt e orquestrar a chamada à LLM.
    """

    MAX_PROMPT_LENGTH = 2000  # limite máximo fixo de caracteres para o texto

    def __init__(self, llm_client: GroqLLMClient):
        self.llm_client = llm_client

    async def execute(self, request: TextEnhancerRequest) -> TextEnhancerResponse:
        text = request.text

        # 1. Validação de texto vazio ou muito curto
        if not text or len(text.strip()) < 5:
            raise HTTPException(status_code=400, detail="Texto muito curto ou vazio.")

        # 2. Normalizar espaços: remover múltiplos espaços e quebras de linha
        normalized_text = re.sub(r"\s+", " ", text).strip()

        # 3. Limitar tamanho do texto (caracteres)
        if len(normalized_text) > self.MAX_PROMPT_LENGTH:
            raise HTTPException(
                status_code=400,
                detail=f"Texto muito longo. Limite máximo é {self.MAX_PROMPT_LENGTH} caracteres.",
            )

        prompt = [
            (
                "system",
                "Melhore o texto fornecido para que fique claro e natural, sem exageros. "
                "Retorne apenas o texto melhorado, sem quebras de linha e sem adicionar nada além do texto reescrito.",
            ),
            ("human", normalized_text),
        ]

        response = await self.llm_client.invoke(prompt)
        return TextEnhancerResponse(
            text_response=response["content"],
            usage=response.get("usage"),
        )

def get_enhance_text_service() -> EnhanceTextService:
    llm_client = GroqLLMClient()
    service = EnhanceTextService(llm_client)
    return service