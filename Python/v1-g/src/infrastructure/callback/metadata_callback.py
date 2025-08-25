from typing import Any, Dict, List
from langchain.callbacks.base import AsyncCallbackHandler
from langchain_core.outputs import LLMResult

class MetadataCallbackHandler(AsyncCallbackHandler):
    """
    Callback que captura um dicionário completo de metadados de cada chamada ao LLM,
    incluindo uso de tokens, modelo e motivo da finalização.
    """
    def __init__(self) -> None:
        self.metadata_list: List[Dict[str, Any]] = []

    async def on_llm_end(self, response: LLMResult, **kwargs: Any) -> None:
        """
        No final da chamada do LLM, extrai e armazena um dicionário completo de metadados.
        """
        # Ignoramos chamadas que não produzem gerações
        if not response.generations:
            return

        # Dicionário para armazenar todos os dados desta chamada
        full_metadata = {}

        try:
            # O caminho que descobrimos: response.generations[0][0]
            generation_chunk = response.generations[0][0]

            # 1. Extrair informações da geração (modelo, motivo da finalização)
            if generation_chunk.generation_info:
                full_metadata.update(generation_chunk.generation_info)

            # 2. Extrair informações de uso de tokens (se disponíveis na mensagem)
            if hasattr(generation_chunk, 'message') and hasattr(generation_chunk.message, 'usage_metadata'):
                if generation_chunk.message.usage_metadata:
                    full_metadata.update(generation_chunk.message.usage_metadata)

            # Adiciona o dicionário completo à nossa lista
            if full_metadata:
                self.metadata_list.append(full_metadata)

        except (AttributeError, IndexError):
            # Se a estrutura for inesperada, simplesmente não adicionamos nada para esta chamada
            # e evitamos que a aplicação quebre.
            print("AVISO: Estrutura de resposta do LLM inesperada. Metadados não capturados para esta chamada.")