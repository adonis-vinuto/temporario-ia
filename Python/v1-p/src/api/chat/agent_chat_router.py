from fastapi import APIRouter, Depends
from src.domain.schema.agent.chat_schema import ChatRequest, ChatResponse
from src.domain.schema.agent.agent_schema import AgentContext
from src.application.service.agent.agent_chat_service import ChatService, get_chat_service
from src.infrastructure.limits.resource_limits import get_resource_monitor
from src.infrastructure.config.logging_config import get_logger

logger = get_logger(__name__)
router = APIRouter()

@router.post("/chat-ai/{id_organization}/{module}/{id_agent}", response_model=ChatResponse)
async def chat_with_agent(
    request: ChatRequest,
    agent_context: AgentContext = Depends(),
    chat_service: ChatService = Depends(get_chat_service),
    monitor = Depends(get_resource_monitor)  # NOVO
):
    """Main endpoint to chat with the agent."""
    
    # NOVO: Validações de limites
    monitor.validate_message_length(request.message)
    monitor.validate_chat_history(request.chat_history)
    
    # NOVO: Log seguro
    logger.info(f"Chat request received for org {agent_context.id_organization[:4]}***")
    
    # NOVO: Verificar recursos antes de processar
    await monitor.check_system_resources()
    
    response = await chat_service.chat(
        agent_context=agent_context,
        user_input=request.message,
        chat_history=[item.model_dump() for item in request.chat_history],
    )
    
    # NOVO: Log seguro da resposta
    usage = response.get("usage", {})
    logger.info(f"Chat response sent with {usage.get('total-tokens', 0)} tokens")
    
    return ChatResponse(
        **{
            "message-response": response.get("output", ""),
            "usage": usage
        }
    )