from fastapi import APIRouter, Depends
from src.domain.schema.agent.chat_schema import ChatRequest, ChatResponse
from src.application.service.komsales.komsales_service import KomSalesService, get_komsales_service

router = APIRouter()

@router.post("/komsales-chat", response_model=ChatResponse)
async def chat_with_agent(
    request: ChatRequest,
    chat_service: KomSalesService = Depends(get_komsales_service),
):
    """Main endpoint to chat with the agent."""
    response = await chat_service.chat(
        user_input=request.message,
        chat_history=[item.model_dump() for item in request.chat_history],
    )
    
    agent_output = response.get("output", "")
    usage = response.get("usage", {})

    return ChatResponse(
        **{
            "message-response": agent_output,
            "usage": usage
        }
    )