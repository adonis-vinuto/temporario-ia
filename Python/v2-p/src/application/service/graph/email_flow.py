import uuid
from typing import Dict, Any, TypedDict
from langchain_core.runnables import Runnable
from langchain.agents import AgentExecutor

# Importando o StateGraph para construir o workflow
from langgraph.graph import StateGraph

# Importando os componentes puros do domínio
from src.domain.graph.state import AgentState
from src.domain.graph.node import (
    create_researcher_node,
    create_writer_node,
    create_critic_node,
    send_email_node, # Este não precisa de fábrica, pois não tem dependência de infra
    decide_next_step
)

# Importando as implementações concretas da infraestrutura
from src.infrastructure.llm.agent_factory import (
    create_researcher_agent_executor,
    create_writer_runnable,
    create_critic_runnable
)
# A persistência será adicionada depois, por enquanto usamos a memória
from src.infrastructure.persistence.memory_checkpointer import memory_saver 

class State(TypedDict):
    topic: str
    research_summary: str
    draft: str
    critique: str
    human_feedback: str
    final_article: str
    revision_count: int

class WorkflowService:
    """
    Este serviço é responsável por montar, compilar e executar o workflow.
    Ele age como o maestro da nossa arquitetura.
    """
    _app = None

    def __init__(self):
        # O grafo é construído e compilado apenas uma vez, quando o serviço é iniciado.
        if WorkflowService._app is None:
            print("--- Montando e compilando o workflow pela primeira vez ---")
            
            # Passo 1: Criar os 'cérebros' (runnables) a partir da infraestrutura
            researcher_agent = create_researcher_agent_executor()
            writer_runnable = create_writer_runnable()
            critic_runnable = create_critic_runnable()

            # Passo 2: Criar os nós finais usando as fábricas do domínio e os runnables da infra
            researcher_node_final = create_researcher_node(researcher_agent)
            writer_node_final = create_writer_node(writer_runnable)
            critic_node_final = create_critic_node(critic_runnable)
            
            # Passo 3: Montar a estrutura do grafo (A "Graph Definition" acontece aqui!)
            workflow = StateGraph(AgentState)

            workflow.add_node("pesquisador", researcher_node_final)
            workflow.add_node("escritor", writer_node_final)
            workflow.add_node("critico", critic_node_final)
            workflow.add_node("send_email_node", send_email_node) # Nó simples do domínio

            workflow.set_entry_point("pesquisador")

            workflow.add_edge("pesquisador", "escritor")
            workflow.add_edge("escritor", "critico")
            
            # Adiciona a lógica de roteamento condicional do domínio
            workflow.add_conditional_edges(
                "critico",
                decide_next_step,
                {
                    "send_email_node": "send_email_node",
                    "escritor": "escritor",
                    "__end__": "__end__" 
                }
            )

            workflow.add_edge("send_email_node", "__end__")

            # Passo 4: Compilar o grafo final
            # Agora com checkpointer ativo para permitir persistência de estado
            WorkflowService._app = workflow.compile(
                interrupt_before=["critico"],
                checkpointer=memory_saver 
            )
            print("--- Workflow compilado e pronto para uso ---")

    async def invoke_workflow(self, thread_id: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executa um turno do workflow para uma thread específica.
        """
        thread_config = {"configurable": {"thread_id": thread_id}}
        
        # O serviço verifica se é a primeira chamada para inicializar o estado corretamente
        current_state = await self._app.aget_state(thread_config)
        is_first_message = not current_state or not hasattr(current_state, 'values') or not current_state.values

        if is_first_message:
            # O input inicial precisa conter o tópico
            graph_input = {"topic": input_data.get("input_text", "")}
            print(f"🚀 Iniciando novo workflow com tópico: {graph_input['topic']}")
            # Invoca o grafo e retorna o estado final da execução
            final_state = await self._app.ainvoke(graph_input, thread_config)
        else:
            # As chamadas subsequentes contêm o feedback
            human_feedback = input_data.get("input_text", "")
            print(f"🔄 Continuando workflow pausado com feedback: {human_feedback}")
            
            # Para workflows pausados com interrupt_before, a abordagem correta é:
            # 1. Atualizar o estado com o feedback usando aupdate_state
            # 2. Continuar com ainvoke(None) para resumir do ponto de interrupção
            
            # Atualizar o estado com o feedback humano
            await self._app.aupdate_state(thread_config, {"human_feedback": human_feedback})
            
            # Continuar o workflow - LangGraph retoma automaticamente do nó interrompido
            final_state = await self._app.ainvoke(None, thread_config)
        
        return final_state

    async def get_current_state(self, thread_id: str) -> Dict[str, Any]:
        """Recupera o estado atual de uma thread."""
        thread_config = {"configurable": {"thread_id": thread_id}}
        return await self._app.aget_state(thread_config)

    async def process_turn(self, thread_id: str, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processa um turno completo do workflow para uma thread específica.
        """
        try:
            # Criar input_data no formato esperado pelo invoke_workflow
            if state.get("topic"):
                # Primeira chamada com tópico
                input_data = {"input_text": state["topic"]}
            else:
                # Chamada subsequente com feedback
                input_data = {"input_text": state.get("human_feedback", "")}
            
            # Usar o método invoke_workflow existente
            final_state = await self.invoke_workflow(thread_id, input_data)
            
            # Converter o resultado do StateGraph para um dict simples
            if hasattr(final_state, 'values') and callable(final_state.values):
                # Se for um StateSnapshot do LangGraph, chama o método values()
                state_values = final_state.values()
                # Converte dict_values para dict se necessário
                if hasattr(state_values, '__iter__') and not isinstance(state_values, dict):
                    # Se for dict_values, precisamos reconstruir o dict
                    keys = final_state.keys() if hasattr(final_state, 'keys') else []
                    return dict(zip(keys, state_values)) if keys else {"values": list(state_values)}
                return state_values
            elif hasattr(final_state, '__dict__'):
                # Se for um objeto com atributos
                return final_state.__dict__
            elif isinstance(final_state, dict):
                # Se já for um dict
                return final_state
            else:
                # Fallback
                return {"result": str(final_state)}

        except Exception as e:
            error_message = str(e)
            print(f"Erro no workflow: {error_message}")
            
            # Tratamento específico para erro de contexto excedido
            if "context_length_exceeded" in error_message.lower() or "reduce the length" in error_message.lower():
                return {
                    **state,
                    "error": "Conteúdo muito extenso. Por favor, tente um tópico mais específico ou forneça feedback mais conciso.",
                    "suggestion": "Considere dividir o tópico em partes menores ou ser mais específico na solicitação."
                }
            
            # Outros erros gerais
            return {
                **state,
                "error": f"Erro no processamento: {error_message}"
            }

    async def create_article(self, topic: str, human_feedback: str = "", thread_id: str = None) -> Dict[str, Any]:
        """
        Método principal para criar um artigo completo.
        """
        if thread_id is None:
            thread_id = str(uuid.uuid4())
        
        initial_state = {
            "topic": topic,
            "research_summary": "",
            "draft": "",
            "critique": "",
            "human_feedback": human_feedback,
            "final_article": "",
            "revision_count": 0
        }

        # Usar o método process_turn que integra com o StateGraph
        result = await self.process_turn(thread_id, initial_state)
        
        return result

    async def continue_workflow(self, thread_id: str, human_feedback: str = "") -> Dict[str, Any]:
        """
        Continua um workflow existente com feedback humano.
        """
        state = {
            "human_feedback": human_feedback
        }
        
        return await self.process_turn(thread_id, state)

def get_workflow_service() -> WorkflowService:
    """Factory function para o WorkflowService."""
    return WorkflowService()