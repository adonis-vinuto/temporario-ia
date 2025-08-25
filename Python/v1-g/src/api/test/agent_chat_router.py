from fastapi import APIRouter, Depends
from fastapi import APIRouter, Depends
from src.domain.schema.agent.chat_schema import ChatRequest, ChatResponse
from src.domain.schema.agent.agent_schema import AgentContext
from src.application.service.agent.agent_chat_service import ChatService, get_chat_service
from fastapi import HTTPException

router = APIRouter(prefix="/test", tags=["Test Operations"])

@router.post("/test-tools/{id_organization}/{module}/{id_agent}", response_model=ChatResponse)
async def test_title_summary_tools(
    request: ChatRequest,
    agent_context: AgentContext = Depends(),
    chat_service: ChatService = Depends(get_chat_service),
):
    """Endpoint de teste para as ferramentas de título e resumo."""
    try:
        result = {
            "title": "Título de teste",
            "summary": "Resumo de teste"
        }
        usage = {
            "title": {},
            "summary": {}
        }

        response_title = await chat_service.chat(
            agent_context=agent_context,
            user_input=f"Crie um título para o seguinte texto: {request.message}",
            chat_history=[],  # Começar com histórico limpo para teste
        )

        response_summary = await chat_service.chat(
            agent_context=agent_context,
            user_input=f"Crie um resumo para o seguinte texto: {request.message}",
            chat_history=[],  # Começar com histórico limpo para teste
        )
        
        title = response_title.get("output", "Título não gerado")
        summary = response_summary.get("output", "Resumo não gerado")
        
        usage_title = response_title.get("usage", {})
        usage_summary = response_summary.get("usage", {})
        
        formatted_response = f"""**RESULTADO DO TESTE DE FERRAMENTAS**

        **Título Gerado:**
        {title}

        **Resumo Gerado:**
        {summary}

        ---
        *Teste das ferramentas generate_title e generate_summary concluído com sucesso.*"""

        final_usage = usage_summary if usage_summary else usage_title

        return ChatResponse(
            **{
                "message-response": formatted_response,
                "usage": final_usage
            }
        )
        
    except Exception as e:
        print(f"Erro detalhado: {str(e)}")
        print(f"Tipo do erro: {type(e)}")
        raise HTTPException(status_code=500, detail=f"Erro no teste das ferramentas: {str(e)}")