from fastapi import APIRouter, Depends
from src.domain.schema.agent.chat_schema import ChatRequest, ChatResponse
from src.domain.schema.agent.agent_schema import AgentContext
from src.application.service.agent.agent_chat_service import ChatService, get_chat_service

router = APIRouter()

@router.post("/chat-ai/{id_organization}/{module}/{id_agent}", response_model=ChatResponse)
async def chat_with_agent(
    request: ChatRequest,
    agent_context: AgentContext = Depends(),
    chat_service: ChatService = Depends(get_chat_service),
):
    """Main endpoint to chat with the agent."""
    print("OKKKKKK")
    response = await chat_service.chat(
        agent_context=agent_context,
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