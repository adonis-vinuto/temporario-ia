from typing import Optional
from src.agent.base_agent import BaseAgent
from src.domain.enum.agent_type_enum import AgentTypeEnum
from src.domain.schema.agent.agent_schema import AgentContext
from src.application.service.agent.agent_cache_service import AgentCacheService
from src.agent.people.people_agent import create_agent_executor as create_people_runnable
from src.agent.komsales.komsales_agent import create_agent_executor as create_komsales_runnable
from src.infrastructure.config.logging_config import get_logger
from src.infrastructure.helpers.usage_helper import create_empty_usage

logger = get_logger(__name__)

class ChatService:
    def __init__(self, agent_cache_service: AgentCacheService):
        self.agent_cache_service = agent_cache_service

    async def chat(self, agent_context: AgentContext, user_input: str, chat_history: list) -> dict:
        agent_type_value = await self.agent_cache_service.get_agent_type(agent_context)

        try:
            agent_type = AgentTypeEnum(int(agent_type_value))
        except (ValueError, TypeError) as e:
            logger.warning(f"Tipo de agente inválido: {agent_type_value} | Erro: {e}")
            return {
                "output": f"Tipo de agente '{agent_type_value}' não reconhecido.",
                "usage": create_empty_usage()
            }

        try:
            # Cria o agente diretamente baseado no tipo
            agent = self._create_agent(agent_type, agent_context.id_agent)
            
            if agent:
                return await agent.chat(user_input, chat_history)
            else:
                return {
                    "output": f"Tipo de agente '{agent_type.name}' não suportado.",
                    "usage": create_empty_usage()
                }
                
        except Exception as e:
            logger.error(f"Erro ao criar/executar agente: {str(e)}")
            return {
                "output": f"Erro no processamento: {str(e)}",
                "usage": create_empty_usage()
            }

    def _create_agent(self, agent_type: AgentTypeEnum, id_agent: str) -> Optional[BaseAgent]:
        if agent_type == AgentTypeEnum.STANDARD:
            runnable = create_people_runnable(id_agent)
            return BaseAgent(runnable)
            
        elif agent_type == AgentTypeEnum.KOMSALES:
            logger.warning("Agente KOMSALES acessivel pela rota komsales-chat")
            return None
            
        elif agent_type == AgentTypeEnum.PEOPLE_TWILIO:
            # Quando implementar, adicionar aqui
            logger.warning("Agente PEOPLE_TWILIO ainda não implementado")
            return None
            
        else:
            logger.warning(f"Tipo de agente não suportado: {agent_type}")
            return None


def get_chat_service() -> ChatService:
    """
    Injeta as dependências para o ChatService.
    Agora só precisa do cache service.
    """
    from src.application.service.agent.agent_cache_service import get_agent_cache_service
    agent_cache_service = get_agent_cache_service()
    
    return ChatService(agent_cache_service)