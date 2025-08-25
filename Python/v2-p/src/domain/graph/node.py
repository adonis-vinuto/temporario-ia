from typing import Callable, Dict, Any
from langchain_core.runnables import Runnable

from .state import AgentState
from src.infrastructure.helpers.context_manager import manage_workflow_context

NodeFunction = Callable[[AgentState], Dict[str, Any]]


def create_researcher_node(researcher_agent_runnable: Runnable) -> NodeFunction:
    """
    Fábrica para o nó de pesquisa.
    Recebe um 'Runnable' de pesquisa (o agente executor) como dependência.
    Retorna a função do nó pronta para ser usada no grafo.
    """
    def researcher_node(state: AgentState) -> Dict[str, Any]:
        """
        Este é o nó real. Ele usa o runnable que foi 'injetado'.
        """
        print("---🧠 Nó Pesquisador---")
        topic = state["topic"]
        response = researcher_agent_runnable.invoke({"input": topic})
        return {"research_summary": response["output"]}

    return researcher_node


def create_writer_node(writer_runnable: Runnable) -> NodeFunction:
    """
    Fábrica para o nó de escrita.
    Recebe um 'Runnable' de escrita como dependência.
    """
    def writer_node(state: AgentState) -> Dict[str, Any]:
        print("---✍️ Nó Escritor---")
        
        # Gerencia o contexto para evitar excesso de tokens
        managed_state = manage_workflow_context(state)
        
        # Prepara o input para o runnable a partir do estado gerenciado
        invoke_input = {
            "topic": managed_state["topic"],
            "research_summary": managed_state["research_summary"],
            "draft": managed_state.get("draft", ""),
            "critique": managed_state.get("critique", "")
        }
        
        draft_text = writer_runnable.invoke(invoke_input).content
        revision_number = state.get("revision_number", 0) + 1
        
        print(f"Rascunho (Revisão #{revision_number}) gerado.")
        return {"draft": draft_text, "revision_number": revision_number}

    return writer_node


def create_critic_node(critic_runnable: Runnable) -> NodeFunction:
    """
    Fábrica para o nó de crítica.
    Recebe um 'Runnable' de crítica como dependência.
    """
    def critic_node(state: AgentState) -> Dict[str, Any]:
        print("---🧐 Nó Crítico---")
        
        # Gerencia o contexto para evitar excesso de tokens
        managed_state = manage_workflow_context(state)
        
        invoke_input = {
            "draft": managed_state["draft"],
            "human_feedback": managed_state.get("human_feedback", "")
        }
        
        print(f"Draft length para crítica: {len(invoke_input['draft'])}")
        print(f"Human feedback: '{invoke_input['human_feedback']}'")
        
        critique_text = critic_runnable.invoke(invoke_input).content
        
        print(f"Crítica recebida (length: {len(critique_text)}).")
        print(f"Crítica contém APROVADO: {'APROVADO' in critique_text.upper()}")
        print(f"Crítica contém REVISAR: {'REVISAR' in critique_text.upper()}")
        
        # Limpa o feedback humano para não ser usado na próxima rodada
        return {"critique": critique_text, "human_feedback": ""}

    return critic_node


def send_email_node(state: AgentState) -> Dict[str, Any]:
    """
    Este nó representa a intenção de negócio de enviar uma notificação.
    A implementação real do envio de e-mail (uma dependência de infra)
    seria injetada se necessário, mas para a lógica de domínio,
    declarar a ação é o suficiente.
    """
    print(f"---📧 Nó de E-mail ---")
    print(f"INTENÇÃO DE NEGÓCIO: Enviar notificação sobre o tópico: {state['topic']}")
    print(f"✅ ARTIGO FINALIZADO E NOTIFICAÇÃO ENVIADA!")
    
    # Marca que o email foi enviado e o workflow está completo
    return {
        "final_article": state.get("draft", "Artigo finalizado"),
        "email_sent": True,
        "workflow_status": "completed"
    }


def decide_next_step(state: AgentState) -> str:
    """
    Este nó é pura lógica de negócio, sem dependências externas.
    Ele roteia o fluxo de trabalho com base no estado atual.
    """
    critique = state.get("critique", "")
    revision_number = state.get("revision_number", 0)
    
    print(f"--- DECIDE_NEXT_STEP DEBUG ---")
    print(f"Revision number: {revision_number}")
    print(f"Critique length: {len(critique)}")
    print(f"Critique (first 200 chars): {critique[:200]}...")
    
    if "APROVADO" in critique.upper():
        print("--- LÓGICA DE DOMÍNIO: Fluxo aprovado. ---")
        return "send_email_node"
    
    # Reduzido o limite de revisões para evitar acúmulo excessivo de contexto
    if revision_number > 2:
        print("--- LÓGICA DE DOMÍNIO: Limite de revisões atingido. ---")
        return "__end__" # LangGraph usa '__end__' para o nó final
    
    print("--- LÓGICA DE DOMÍNIO: Revisão necessária. ---")
    return "escritor"
