import asyncio
import httpx
from typing import Dict, Optional, Tuple
from datetime import datetime, timedelta
from src.infrastructure.config.settings_config import settings
from src.domain.schema.agent.agent_schema import AgentContext

class AgentTypeCache:
    _instance: Optional['AgentTypeCache'] = None
    _lock = asyncio.Lock()
    _cache: Dict[str, Tuple[str, datetime]]
    _ttl: int
    
    def __new__(cls) -> 'AgentTypeCache':
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._cache = {}
            cls._instance._ttl = 300  # 5 minutos
        return cls._instance
    
    async def get_agent_type(self, agent_context: AgentContext) -> str:
        async with self._lock:  # Thread-safe
            # Verifica se já existe no cache
            if f"{agent_context.id_organization}-{agent_context.module}-{agent_context.id_agent}" in self._cache:
                cached_type, timestamp = self._cache[f"{agent_context.id_organization}-{agent_context.module}-{agent_context.id_agent}"]
                if datetime.now() - timestamp < timedelta(seconds=self._ttl):
                    print(f"Cache HIT para agente {agent_context.id_organization}-{agent_context.module}-{agent_context.id_agent}")
                    return cached_type
            
            # Se não existe ou expirou, busca da API
            print(f"Cache MISS para agente {agent_context.id_organization}-{agent_context.module}-{agent_context.id_agent}, buscando da API...")
            agent_type = await self._fetch_from_api(agent_context)
            self._cache[f"{agent_context.id_organization}-{agent_context.module}-{agent_context.id_agent}"] = (agent_type, datetime.now())
            return agent_type
    
    async def _fetch_from_api(self, agent_context: AgentContext) -> str:
        """Busca o tipo do agente da API"""
        try:
            async with httpx.AsyncClient() as client:   
                response = await client.get(
                    f"{settings.BASE_BACKEND_URL}/api/ai/agent/{agent_context.id_organization}/{agent_context.module}/{agent_context.id_agent}",
                    headers={"Content-Type": "application/json"}
                )
                response.raise_for_status()
                data = response.json()
                return data.get("type", "unknown")
        except Exception as e:
            print(f"Erro ao buscar tipo do agente {agent_context.id_organization}-{agent_context.module}-{agent_context.id_agent}: {e}")
            return "unknown"
    
    def clear_cache(self):
        """Limpa todo o cache (útil para testes)"""
        self._cache.clear()
    
    def get_cache_info(self) -> Dict:
        """Retorna informações do cache para debug"""
        return {
            "total_cached": len(self._cache),
            "cached_agents": list(self._cache.keys()),
            "ttl_seconds": self._ttl
        } 