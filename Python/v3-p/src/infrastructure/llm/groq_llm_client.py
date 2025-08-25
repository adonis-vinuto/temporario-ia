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
            model="openai/gpt-oss-120b", # Modelo default
            temperature=0,            # Temperatura zero para respostas mais determinísticas
            api_key=SecretStr(settings.GROQ_API_KEY),
            # reasoning_effort="medium",
        )

    async def invoke(self, prompt: list[tuple[str, str]]) -> dict:
        """
        Envia um prompt para a LLM da Groq de forma assíncrona e retorna
        o conteúdo e estatísticas de uso de tokens.

        :param prompt: Lista de mensagens no formato (role, content)
        :return: dicionário com 'content' e 'usage'
        """
        response = await self.client.ainvoke(prompt)
        # Extrai metadados de uso e nome do modelo de forma resiliente
        resp_meta = getattr(response, "response_metadata", {}) or {}
        token_usage = resp_meta.get("token_usage", {}) or {}

        # Possíveis locais do nome do modelo
        model_name = (
            resp_meta.get("model")
            or resp_meta.get("model_name")
            or getattr(self.client, "model_name", None)
            or getattr(self.client, "model", None)
            or "unknown"
        )

        # Anexa o modelo dentro de usage (pedido) e também no topo para conveniência
        token_usage = {"model": model_name, **token_usage}

        return {
            "content": getattr(response, "content", ""),
            "model": model_name,
            "usage": token_usage,
        }