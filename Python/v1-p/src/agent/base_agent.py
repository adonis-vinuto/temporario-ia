# Imports necessários
from langchain_core.runnables import Runnable
from langchain_core.messages import HumanMessage, AIMessage
from src.domain.schema.agent.chat_schema import RoleEnum
from src.infrastructure.callback.metadata_callback import MetadataCallbackHandler

class BaseAgent:
    """
    Uma classe base genérica para interagir com qualquer 'Runnable' do LangChain,
    gerenciando o histórico de chat e o rastreamento de uso de tokens.
    """
    def __init__(self, runnable: Runnable):
        """
        Inicializa o agente com um executável (runnable) do LangChain.

        Args:
            runnable: Uma instância de qualquer objeto executável do LangChain 
                      (ex: AgentExecutor, LLMChain, ou um próprio LLM).
        """
        self.runnable = runnable

    def _prepare_chat_history(self, chat_history: list) -> list:
        """Converte o histórico de chat do formato de dicionário para objetos LangChain."""
        langchain_chat_history = []
        for message in chat_history:
            if message.get("role") == RoleEnum.USER.value:
                langchain_chat_history.append(HumanMessage(content=message["content"]))
            elif message.get("role") == RoleEnum.AGENT.value:
                langchain_chat_history.append(AIMessage(content=message["content"]))
        return langchain_chat_history

    async def chat(self, user_input: str, chat_history: list) -> dict:
        """
        Executa um turno de conversa com o runnable.
        """
        langchain_chat_history = self._prepare_chat_history(chat_history)
        metadata_callback = MetadataCallbackHandler()

        # Invoca o runnable com os inputs necessários
        response = await self.runnable.ainvoke(
            {"input": user_input, "chat_history": langchain_chat_history},
            config={"callbacks": [metadata_callback]}
        )
        
        # Criar o dict diretamente dos metadados em vez de usar o objeto Pydantic
        last_call_metadata = metadata_callback.metadata_list[-1] if metadata_callback.metadata_list else {}
        response["usage"] = {
            "model-name": last_call_metadata.get("model_name", ""),
            "finish-reason": last_call_metadata.get("finish_reason", ""),
            "input-tokens": last_call_metadata.get("input_tokens", 0),
            "output-tokens": last_call_metadata.get("output_tokens", 0),
            "total-tokens": last_call_metadata.get("total_tokens", 0)
        }
        
        return response