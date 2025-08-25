from fastapi import APIRouter, Depends
from src.domain.schema.agent.cache_schema import CacheInfoResponse
from src.application.service.agent.agent_cache_service import AgentCacheService, get_agent_cache_service
from src.infrastructure.config.logging_config import get_logger

router = APIRouter()
logger = get_logger(__name__)

@router.get("/cache-info", response_model=CacheInfoResponse, tags=["Debug"])
async def get_cache_info(
    service: AgentCacheService = Depends(get_agent_cache_service),
):
    """
    Retorna estatísticas do cache de tipos de agentes.

    :return: total de itens, chaves e TTL
    """
    logger.debug("Requisição para obter informações do cache.")
    return service.get_cache_info()


@router.post("/clear-cache", tags=["Debug"])
async def clear_cache(
    service: AgentCacheService = Depends(get_agent_cache_service),
):
    """
    Limpa o cache de tipos de agentes.

    :return: mensagem de sucesso
    """
    service.clear_cache()
    logger.info("Cache de tipos de agentes limpo com sucesso.")
    return {"message": "Cache limpo com sucesso."}