import uuid
from fastapi import APIRouter
from src.application.service.graph.email_flow import WorkflowService
from .model import ChatRequest, ChatResponse

# Cria a instância da API
router = APIRouter()

# Cria uma instância única do nosso serviço. 
# O grafo será compilado uma vez aqui dentro.
workflow_service = WorkflowService()

@router.post("/graph-chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Este é o endpoint principal que interage com nosso workflow.
    Ele é 'fino' (thin), sua única responsabilidade é lidar com HTTP,
    delegando toda a lógica para a camada de aplicação.
    """
    thread_id = request.thread_id or str(uuid.uuid4())
    
    # Preparar estado para o processo
    input_state = {
        "topic": request.input_text if not request.thread_id else "",
        "human_feedback": request.input_text if request.thread_id else ""
    }
    
    # Chama o serviço para processar o turno da conversa (com await)
    final_state = await workflow_service.process_turn(thread_id, input_state)
    
    # Verificar se houve erro
    if "error" in final_state:
        return ChatResponse(
            thread_id=thread_id,
            status="ERROR",
            message_to_user=f"Erro no processamento: {final_state['error']}",
            data={}
        )
    
    # Analisa o estado final para construir a resposta HTTP   
    # Verificar se o workflow chegou ao fim (send_email executado)
    if final_state.get('final_article') or 'send_email_node' in str(final_state):
        return ChatResponse(
            thread_id=thread_id,
            status="COMPLETED",
            message_to_user="Artigo finalizado e notificação enviada!",
            data={"final_article": final_state.get('draft', 'Artigo finalizado')}
        )
    elif final_state.get('draft') and not final_state.get('critique'):
        # Tem draft mas ainda não passou pelo crítico
        return ChatResponse(
            thread_id=thread_id,
            status="PAUSED_FOR_HUMAN_INPUT",
            message_to_user="Rascunho pronto para sua revisão. Por favor, envie seu feedback.",
            data={"draft_to_review": final_state.get('draft')}
        )
    elif final_state.get('critique') and "APROVADO" in final_state.get('critique', '').upper():
        # Crítica aprovou, workflow deve ter continuado
        return ChatResponse(
            thread_id=thread_id,
            status="COMPLETED",
            message_to_user="Artigo aprovado e processo finalizado!",
            data={"final_article": final_state.get('draft'), "critique": final_state.get('critique')}
        )
    else:
        return ChatResponse(
            thread_id=thread_id,
            status="IN_PROGRESS",
            message_to_user="Processamento em andamento...",
            data={"current_state": final_state}
        )