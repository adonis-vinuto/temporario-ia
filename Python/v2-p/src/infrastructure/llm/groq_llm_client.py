from langchain_groq import ChatGroq
from pydantic import SecretStr
from src.infrastructure.config.settings_config import settings

class GroqLLMClient:
    """
    Cliente para comunicação com a API da Groq, encapsulando a lógica
    de chamada e tratamento da LLM.
    """
    def __init__(self):
        self.client = ChatGroq(
            model="llama3-70b-8192",  # Modelo default
            temperature=0,            # Temperatura zero para respostas mais determinísticas
            api_key=SecretStr(settings.GROQ_API_KEY),
        )

    async def invoke(self, prompt: list[tuple[str, str]]) -> dict:
        """
        Envia um prompt para a LLM da Groq de forma assíncrona e retorna
        o conteúdo e estatísticas de uso de tokens.

        :param prompt: Lista de mensagens no formato (role, content)
        :return: dicionário com 'content' e 'usage'
        """
        response = await self.client.ainvoke(prompt)
        return {
            "content": getattr(response, "content", ""),
            "usage": getattr(response, "response_metadata", {}).get("token_usage", {}),
        }