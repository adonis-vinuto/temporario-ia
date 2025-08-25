from pydantic import BaseModel
from typing import List

class CacheInfoResponse(BaseModel):
    """Resposta estruturada com estatísticas do cache de agentes."""
    total_cached: int
    cached_agents: List[str]
    ttl_seconds: int