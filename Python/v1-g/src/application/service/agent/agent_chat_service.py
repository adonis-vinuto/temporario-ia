from src.agent.base_agent import BaseAgent, get_base_agent
from src.domain.enum.agent_type_enum import AgentTypeEnum
from src.domain.schema.agent.agent_schema import AgentContext
from src.application.service.agent.agent_cache_service import AgentCacheService
from src.infrastructure.config.logging_config import get_logger

logger = get_logger(__name__)

class ChatService:
    def __init__(
        self,
        base_agent: BaseAgent,
        agent_cache_service: AgentCacheService,
    ):
        self.base_agent = base_agent
        self.agent_cache_service = agent_cache_service

    async def chat(self, agent_context: AgentContext, user_input: str, chat_history: list) -> dict:
        try:
            agent_type_value = await self.agent_cache_service.get_agent_type(agent_context)

            try:
                agent_type = AgentTypeEnum(int(agent_type_value))
            except (ValueError, TypeError) as e:
                logger.warning(f"Tipo de agente inválido: {agent_type_value} | Erro: {e}")
                return {"output": f"Tipo de agente '{agent_type_value}' não reconhecido."}

            logger.info(f"Chat iniciado com agente do tipo: {agent_type.name}")

            if agent_type == AgentTypeEnum.STANDARD:
                return await self.base_agent.chat(user_input, chat_history)
            elif agent_type == AgentTypeEnum.PEOPLE_TWILIO:
                return {"output": "Agente people-twilio em desenvolvimento."}
            elif agent_type == AgentTypeEnum.KOMSALES:
                return {"output": "Agente komsales em desenvolvimento."}
            else:
                return {"output": f"Tipo de agente '{agent_type}' não reconhecido."}
                
        except Exception as e:
            logger.error(f"Erro inesperado no ChatService: {str(e)}")
            import traceback
            traceback.print_exc()
            return {
                "output": f"Erro interno do serviço de chat: {str(e)}",
                "usage": {
                    "model-name": "",
                    "finish-reason": "error",
                    "input-tokens": 0,
                    "output-tokens": 0,
                    "total-tokens": 0,
                }
            }


def get_chat_service(id_agent: str) -> ChatService:
    """
    Injeta as dependências para o ChatService.
    """
    base_agent = get_base_agent(id_agent)
    from src.application.service.agent.agent_cache_service import get_agent_cache_service
    return ChatService(base_agent, get_agent_cache_service())
