from src.infrastructure.cache.agent_cache import AgentTypeCache
from src.domain.schema.agent.cache_schema import CacheInfoResponse
from src.domain.schema.agent.agent_schema import AgentContext
from src.infrastructure.config.logging_config import get_logger

logger = get_logger(__name__)

class AgentCacheService:
    """Camada de serviço para lógica de tipos de agente."""

    def __init__(self):
        self.cache = AgentTypeCache()

    async def get_agent_type(self, agent_context: AgentContext) -> str:
        """Busca o tipo do agente usando cache"""
        return await self.cache.get_agent_type(agent_context)

    def get_cache_info(self) -> CacheInfoResponse:
        """Retorna estatísticas do cache."""
        info = self.cache.get_cache_info()
        return CacheInfoResponse(**info)

    def clear_cache(self):
        """Limpa o cache."""
        self.cache.clear_cache()

# Instância global
agent_cache_service = AgentCacheService()

def get_agent_cache_service() -> AgentCacheService:
    return agent_cache_service